/* Seats generator store */
import { defineStore } from 'pinia'
import { toText, toCsv, toJson, toYaml, download } from '../api/file'
import { shuffle, SelectOne } from '../api/shuffle'
import _ from 'lodash'
import Papa from 'papaparse'

// Export
export const useStGenStore = defineStore('stGen', {
  state: ()=>({
    // List
    teamList: null as null | string[][],
    roomList: null as null | string[][],
    workList: null as null | string[][],
    // Seed
    seed: 42,
    // Animation
    animation: null as null | number,
    mode: null as null | string,
    // Select
    selIdx: null as null | number,
    selOrd: null as null | number,
    selCls: null as null | SelectOne
  }),
  getters: {
    importTeamClass: (state)=>{
      return state.teamList ? 'text-green-500' : 'text-red-500'
    },
    importRoomClass: (state)=>{
      return state.roomList ? 'text-green-500' : 'text-red-500'
    },
    selectedRowClass: (state)=>{
      return (idx: number)=>[state.selIdx === idx ? '!bg-red-700' : '']
    },
    isShuffling: (state)=>{
      return state.animation !== null
    },
    canReset: (state)=>{
      return state.teamList !== null && state.mode === null
    },
    canGen: (state)=>{
      return state.teamList !== null && (state.mode ?? 'gen') === 'gen'
    },
    canGenBySeed: (state)=>{
      return state.teamList !== null && state.mode === null
    },
    canGenForSelected: (state)=>{
      return state.teamList !== null && state.selIdx !== null && ((state.mode === null && state.workList === null) || state.mode === 'selected')
    },
    canExport: (state)=>{
      return state.teamList !== null && state.workList !== null && (state.mode === null || state.mode === 'selected')
    },
    canChangeSeed: (state)=>{
      return state.mode === null
    }
  },
  actions: {
    reGenSeed() {
      this.seed = Math.floor(Math.random() * 1000000)
    },
    parseImport(type: string, e: InputEvent) {
      const reader = new FileReader()
      reader.onload = (ev)=>{
        try {
          if (type === 'team') {
            const tmp = Papa.parse(ev.target?.result as string, { skipEmptyLines: true })
            if (tmp.errors.length !== 0) {
              console.error(tmp.errors)
              throw 'Parse error'
            }
            const data = tmp.data as string[][]

            data.forEach((x, y)=>{
              if (x.length !== 6)
                throw `Invalid team in row ${y + 1}`
            })

            this.teamList = data
            this.reset()
          } else {
            const tmp = Papa.parse(ev.target?.result as string, { skipEmptyLines: true })
            if (tmp.errors.length !== 0) {
              console.error(tmp.errors)
              throw 'Parse error'
            }
            const data = tmp.data as string[][]

            data.forEach((x, y)=>{
              if (x.length !== 2)
                throw `Invalid room in row ${y + 1}`
            })

            this.roomList = data
            this.reset()
          }
        } catch (err) {
          alert(err)
        } finally {
          (e.target as HTMLInputElement).value = ''
        }
      }
      reader.readAsText(((e.target as HTMLInputElement).files as FileList)[0])
    },
    deleteImport(type: string) {
      if (type === 'team')
        this.teamList = null
      else 
        this.roomList = null
      this.workList = null
    },
    reset() {
      this.workList = null
      this.mode = null
      this.seed = 42
      this.selIdx = null
      this.selOrd = null
      this.selCls = null
    },
    genRoomIdList() {
      let ls: any[][] = _.range((this.teamList as string[][]).length).map((x)=>[x.toString().padStart(3, '0'), ''])
      if (this.roomList !== null) {
        const tmp = this.roomList.reduce((lst, cur)=>{
          lst.push(...new Array(parseInt(cur[1])).fill(cur[0]))
          return lst
        }, [])
        ls = ls.map((x, y)=>[x[0], tmp[y]])
      }

      return ls
    },
    gen() {
      this.selIdx = null
      this.selOrd = null
      this.selCls = null

      if (this.animation !== null) {
        clearInterval(this.animation)
        this.animation = null
        this.mode = null
        return
      }

      this.animation = window.setInterval(()=>{
        const ls = this.genRoomIdList()

        this.reGenSeed()
        shuffle(this.seed, ls)
        this.workList = ls
      }, 100)
      this.mode = 'gen'
    },
    genBySeed() {
      this.selIdx = null
      this.selOrd = null
      this.selCls = null

      this.animation = window.setInterval(()=>{
        const ls = this.genRoomIdList()

        shuffle(Math.floor(Math.random() * 1000000), ls)
        this.workList = ls
      }, 100)
      this.mode = 'seed'

      setTimeout(()=>{
        const ls = this.genRoomIdList()

        clearInterval(this.animation as number)
        this.animation = null
        this.mode = null

        shuffle(this.seed, ls)
        this.workList = ls
      }, 1000)
    },
    selectRow(idx: number) {
      if (this.selIdx !== idx && (this.workList === null || this.workList[idx] === null))
        this.selIdx = idx
      else
        this.selIdx = null
    },
    genForSelected() {
      if (this.mode === null) {
        this.reGenSeed()
        this.mode = 'selected'
        this.workList = new Array(this.teamList?.length).fill(null)
        this.selCls = new SelectOne(this.seed, this.genRoomIdList())
      }

      const ls = this.genRoomIdList()
      this.animation = window.setInterval(()=>{
        (this.workList as string[][])[this.selIdx as number] = ls[Math.floor(Math.random() * ls.length)]
      }, 100)

      setTimeout(()=>{
        clearInterval(this.animation as number)
        this.animation = null

        const res = (this.selCls as SelectOne).select()
        this.selOrd = res[0];
        (this.workList as string[][])[this.selIdx as number] = res[1]
        this.selIdx = null
      }, 1000)
    },
    dlExport(type: string) {
      const ret = _.zipWith(this.teamList, this.workList, (x, y)=>{
        const l = [y[0], ...x.slice(0, x.length - 2)]
        l.push(y[1], ...x.slice(x.length - 2))
        return l
      })

      const cols = ['id', 'name', 'school', 'members', 'coach', 'room', 'type', 'tag']
      switch (type) {
        case 'text':
          download(toText(ret), 'teams.txt', 'text/plain')
          break
        case 'csv':
          download(toCsv(ret), 'teams.csv', 'text/csv')
          break
        case 'json':
          download(toJson(ret, cols), 'teams.json', 'application/json')
          break
        case 'yaml':
          download(toYaml(ret, cols), 'teams.yaml', 'text/yaml')
          break
      }
    }
  },
  persist: {
    paths: [
      'teamList', 'roomList', 'workList',
      'seed', 'mode',
      'selOrd', 'selCls'
    ],
    afterRestore: (ctx)=>{
      if (ctx.store.selCls !== null) {
        const old = ctx.store.selCls
        ctx.store.selCls = new SelectOne(old.seed, old.arr)
        ctx.store.selCls.acc = old.acc
      }
    }
  }
})