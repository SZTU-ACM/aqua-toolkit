/* Seats generator store */
import { defineStore } from 'pinia'
import { fromCsv, toCsv, toJson, toYaml, toTxt, dlFile } from '../api/file-parse'
import { shuffle, SelectOne } from '../api/shuffle'
import _ from 'lodash'

export const useSeatsGeneratorStore = defineStore('seatsGenerator', {
  state: ()=>({
    // List
    rawTeamList: null,
    teamList: null,
    roomList: null,
    // Select
    selectIdx: null,
    selectCtx: null,
    selectOrd: null,
    // Shuffle
    seed: Math.floor(Math.random() * 1000000),
    shuffleHandle: null,
    shuffleMode: null
  }),
  getters: {
    canReset() {
      return this.teamList !== null && this.shuffleHandle === null
    },
    canGenerate() {
      return this.rawTeamList !== null && (this.shuffleMode ?? 'all') === 'all'
    },
    canGenerateBySeed() {
      return this.rawTeamList !== null && this.shuffleHandle === null
    },
    canGenerateForSelected() {
      return this.rawTeamList !== null && this.shuffleMode === null && this.selectIdx !== null
    },
    canExport() {
      return this.rawTeamList !== null && this.shuffleHandle === null
    },
    isShuffling() {
      return this.shuffleHandle !== null
    }
  },
  actions: {
    init() {
      this.selectIdx = null
    },
    // Generate seed
    genSeed() {
      this.seed = Math.floor(Math.random() * 1000000)
    },
    // Reset all
    reset() {
      this.teamList = _.cloneDeep(this.rawTeamList)
      this.genSeed()
      this.selectIdx = null
      this.selectCtx = null
      this.selectOrd = null
    },
    // Parse import file
    parseTeamImport(el) {
      if (el.files.length === 0)
        return

      const reader = new FileReader()
      reader.readAsText(el.files[0])
      reader.onload = ()=>{
        this.rawTeamList = fromCsv(reader.result)
          .filter((v)=>v[0])
          .map((v)=>({
            name: v[0],
            school: v[1],
            member: v[2],
            coach: v[3],
            room: '',
            id: '',
            kind: v[4]
          }))
        this.teamList = _.cloneDeep(this.rawTeamList)
      }
    },
    parseRoomImport(el) {
      if (el.files.length === 0)
        return

      const reader = new FileReader()
      reader.readAsText(el.files[0])
      reader.onload = ()=>{
        this.roomList = fromCsv(reader.result)
          .filter((v)=>v[0])
          .map((v)=>({
            location: v[0],
            capacity: parseInt(v[1])
          }))
      }
    },
    // Select
    select(idx) {
      if (this.shuffleHandle !== null || this.teamList[idx].id !== '')
        return

      if (this.selectIdx === idx)
        this.selectIdx = null
      else
        this.selectIdx = idx
    },
    // Shuffle teams
    shuffle() {
      // Clear select states
      this.selectIdx = null
      this.selectCtx = null
      this.selectOrd = null

      // Start
      if (this.shuffleHandle === null) {
        this.selectIdx = null
        this.shuffleHandle = setInterval(()=>{
          this.genSeed()
          this.shuffleAll()
        }, 100)
        this.shuffleMode = 'all'
      // Stop
      } else {
        clearInterval(this.shuffleHandle)
        this.shuffleHandle = null
        this.shuffleMode = null
      }
    },
    shuffleBySeed() {
      // Clear select states
      this.selectIdx = null
      this.selectCtx = null
      this.selectOrd = null

      // Start animate
      this.shuffleHandle = setInterval(()=>{
        this.shuffleAll(Math.floor(Math.random() * 1000000))
      }, 100)
      this.shuffleMode = 'seed'

      // Animate stop
      setTimeout(()=>{
        clearInterval(this.shuffleHandle)
        this.shuffleHandle = null
        this.shuffleMode = null
        this.shuffleAll()
      }, 1000)
    },
    shuffleAll(seed) {
      // Id list shuffle
      const ls = _.range(1, this.teamList.length + 1)
      shuffle(seed ?? this.seed, ls)

      // Assign id
      this.teamList.forEach((__, i, a)=>{
        a[i].id = ls[i].toString().padStart(3, '0')
      })

      // Assign room if given
      if (this.roomList !== null) {
        const rls = this.roomList.map((v)=>new Array(v.capacity).fill(v.location)).flatMap((v)=>v)
        this.teamList.forEach((__, i, a)=>{
          a[i].room = rls[a[i].id - 1]
        })
      }
    },
    shuffleSelect() {
      // Initialize context
      if (this.selectCtx === null)
        this.selectCtx = new SelectOne(this.seed, _.range(1, this.teamList.length + 1))

      // If selected, return
      if (this.teamList[this.selectIdx].id !== '')
        return

      // Start animate
      const rls = (this.roomList ?? [])
        .map((v)=>new Array(v.capacity).fill(v.location))
        .flatMap((v)=>v)
      this.shuffleHandle = setInterval(()=>{
        this.teamList[this.selectIdx].id = Math.floor(Math.random() * this.teamList.length).toString().padStart(3, '0')
        if (rls.length > 0)
          this.teamList[this.selectIdx].room = rls[this.teamList[this.selectIdx].id - 1]
      }, 100)
      this.shuffleMode = 'select'

      // Animate stop
      setTimeout(()=>{
        clearInterval(this.shuffleHandle)
        this.shuffleHandle = null
        this.shuffleMode = null

        const sel = this.selectCtx.select()
        this.selectOrd = sel[0]
        this.teamList[this.selectIdx].id = sel[1].toString().padStart(3, '0')
        
        // Assign room if given
        if (rls.length > 0)
          this.teamList[this.selectIdx].room = rls[sel[1] - 1]

        // Clean up
        this.selectIdx = null
      }, 1000)
    },
    // Download export file
    dlCsv() {
      const tmp = _.cloneDeep(this.teamList)
      dlFile(
        toCsv(tmp.sort((a, b)=>a.id - b.id).map((v)=>[v.id, v.name, v.school, v.member, v.coach, v.room, v.kind])),
        'teams.csv',
        'text/csv'
      )
    },
    dlJson() {
      const tmp = _.cloneDeep(this.teamList)
      dlFile(
        toJson(
          tmp.sort((a, b)=>a.id - b.id).map((v)=>[v.id, v.name, v.school, v.member, v.coach, v.room, v.kind]),
          ['id', 'name', 'school', 'member', 'coach', 'room', 'kind']
        ),
        'teams.json',
        'application/json'
      )
    },
    dlYaml() {
      const tmp = _.cloneDeep(this.teamList)
      dlFile(
        toYaml(
          tmp.sort((a, b)=>a.id - b.id).map((v)=>[v.id, v.name, v.school, v.member, v.coach, v.room, v.kind]),
          ['id', 'name', 'school', 'member', 'coach', 'room', 'kind']
        ),
        'teams.yaml',
        'text/yaml'
      )
    },
    dlText() {
      const tmp = _.cloneDeep(this.teamList)
      dlFile(
        toTxt(tmp.sort((a, b)=>a.id - b.id).map((v)=>[v.id, v.name, v.school, v.member, v.coach, v.room, v.kind])),
        'teams.txt',
        'text/plain'
      )
    }
  },
  persist: {
    paths: ['rawTeamList', 'teamList', 'roomList', 'seed']
  }
})
