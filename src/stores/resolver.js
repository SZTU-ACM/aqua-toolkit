/* Main store */
import { defineStore } from 'pinia'
import _ from 'lodash'

export const useResolverStore = defineStore('resolver', {
  state: ()=>({
    // Meta data
    contestName: '',
    startTime: '',
    endTime: '',
    frozenStartTime: '',
    goldNum: 0,
    silverNum: 0,
    bronzeNum: 0,
    schoolOptions: [],
    mode: 'Regular',
    teamMap: new Map(),
    problemList: [],
    solutionList: [],
    // Filter data
    teamFilter: ['Official', 'Unofficial', 'Girl'],
    schoolFilter: [],
    // UI
    interfaceMsg: '',
    settingsMsg: '<span class="text-yellow-300">Please fetch meta data first</span>',
    preprocessDisable: true,
    resolveDisable: true,
    // Resolve
    stop: true,
    rank: null,
    finalStatus: null,
    focusTeam: null,
    podiumTeam: null,
    speed: 1.5,
    // External action
    fetchMetaData: ()=>{},
    // Internal
    resolveHandle: null
  }),
  getters: {
    totalMedalNum() {
      return this.goldNum + this.silverNum + this.bronzeNum
    }
  },
  actions: {
    // Dump store
    dump() {
      console.log(this.$state)
    },

    // Wait for resume
    wait() {
      if (this.resolveHandle !== null)
        this.resolveHandle()

      return new Promise((resolve)=>{
        this.resolveHandle = resolve
      })
    },

    // Resume
    resume() {
      if (this.resolveHandle !== null) {
        this.resolveHandle()
        this.resolveHandle = null
      }
    },

    // Add speed
    addSpeed(x) {
      this.speed = Math.max(0.05, Math.min(this.speed + x, 3))
    },

    // Check if a rank has medal
    hasMedal(rank) {
      return rank !== -1 && rank <= this.totalMedalNum
    },

    // Call back for fetch meta finished
    fetchMetaFinished() {
      this.settingsMsg = ''
      this.preprocessDisable = false
    },

    // Preprocess rank
    preprocess() {
      this.settingsMsg = '<span>Proprocessing...</span>'
      try {
        const { final, frozen } = this.genStatus()

        this.rank = this.genRank(frozen)
        this.finalStatus = final
        this.settingsMsg = '<span>Done.</span>'
        this.resolveDisable = false
        console.log(frozen)
      } catch (err) {
        console.error(err)
        this.settingsMsg = `<span class="text-red-500">${err.message}</span>`
      }
    },

    // Resolve
    async startResolve() {
      // Delay function
      const delay = (t)=>new Promise((resolve)=>{
        setInterval(resolve, t)
      })

      // For each team from low to high
      this.stop = false
      let isInMedal = false
      for (let i = this.rank.length - 1; this.stop === false && i >= 0; i--) {
        // Focus on team
        this.focusTeam = this.rank[i].teamKey
        await delay(500 * this.speed)

        // Final status flag(reversed)
        let flag = true

        // For each problem
        for (let j = 0; this.stop === false && j < this.problemList.length; j++) {
          // If status is frozen, we need to reveal it
          if (this.rank[i].status[j].result === 'frozen') {
            // Focus on problem
            this.rank[i].status[j].result = 'pending'
            if (this.hasMedal(this.rank[i].rank) && this.rank[i].solved > 0)
              await this.wait()
            else
              await delay(500 * this.speed)

            // Patch status
            const nStatus = this.finalStatus.get(this.rank[i].teamKey)[j]
            this.rank[i].status[j] = nStatus

            // If rank up
            if (['first_blood', 'accepted'].includes(nStatus.result)) {
              // Patch statistic
              this.rank[i].solved++
              this.rank[i].penalty = 0
              this.rank[i].status
                .filter((v)=>['first_blood', 'accepted'].includes(v.result))
                .forEach((v)=>this.rank[i].penalty += v.penalty)

              // Rerank
              await delay(500 * this.speed)
              this.reRank()
              await delay(1100 * this.speed)

              // Restore loop states
              i++
              this.focusTeam = null
              flag = false
              break
            }
          }
        }

        // If status settled & team has medal
        if (flag && this.hasMedal(this.rank[i].rank) && this.rank[i].solved > 0) {
          if (!isInMedal) {
            isInMedal = true
            this.speed = 2
          }

          // Show podium & wait for mouse click
          this.podiumTeam = {
            rank: this.rank[i].rank,
            name: this.rank[i].name,
            member: this.teamMap.get(this.rank[i].teamKey).member,
            done: false
          }
          await this.wait()
        }
      }

      // Clean up
      this.focusTeam = null
    },

    // Generate status from solutions
    genStatus() {
      const ret1 = new Map(), ret2 = new Map()
      const fb1 = [], fb2 = []

      // For each solution
      this.solutionList
        // Apply filter
        .filter((v)=>{
          const team = this.teamMap.get(v.teamKey)
          return this.teamFilter.includes(team.kind) && this.schoolFilter.includes(team.school)
        })
        // For each
        .forEach((v)=>{
          // Problem index
          const pidx = this.problemList.indexOf(v.problemId)
          if (pidx === -1)
            return

          // Check team existed in maps
          if (!ret1.has(v.teamKey)) {
            let tmp = []
            for (let i = 0; i < this.problemList.length; ++i)
              tmp.push({
                result: 'none',
                tries: 0,
                frozenTries: 0,
                penalty: 0
              })
            ret1.set(v.teamKey, tmp)
          }
          if (!ret2.has(v.teamKey)) {
            let tmp = []
            for (let i = 0; i < this.problemList.length; ++i)
              tmp.push({
                result: 'none',
                tries: 0,
                frozenTries: 0,
                penalty: 0
              })
            ret2.set(v.teamKey, tmp)
          }
          const cur1 = ret1.get(v.teamKey)[pidx], cur2 = ret2.get(v.teamKey)[pidx]

          // For accepted
          if (v.result === 'AC') {
            if (!['first_blood', 'accepted'].includes(cur1.result)) {
              if (fb1.includes(v.problemId))
                cur1.result = 'accepted'
              else {
                fb1.push(v.problemId)
                cur1.result = 'first_blood'
              }
              cur1.tries++
              cur1.penalty += new Date(v.inDate).getTime() - new Date(this.startTime).getTime()
            }

            if (new Date(v.inDate).getTime() < new Date(this.frozenStartTime).getTime()) {
              if (!['first_blood', 'accepted'].includes(cur2.result)) {
                if (fb2.includes(v.problemId))
                  cur2.result = 'accepted'
                else {
                  fb2.push(v.problemId)
                  cur2.result = 'first_blood'
                }
                cur2.tries++
                cur2.penalty += new Date(v.inDate).getTime() - new Date(this.startTime).getTime()
              }
            } else if (!['first_blood', 'accepted'].includes(cur2.result)) {
              cur2.result = 'frozen'
              cur2.frozenTries++
            }
          // For wrong answer & compile error
          } else {
            if (!['first_blood', 'accepted'].includes(cur1.result)) {
              cur1.result = 'wrong_answer'
              cur1.tries++
              if (v.result === 'WA')
                cur1.penalty += 1200000
            }

            if (new Date(v.inDate).getTime() < new Date(this.frozenStartTime).getTime()) {
              if (!['first_blood', 'accepted'].includes(cur2.result)) {
                cur2.result = 'wrong_answer'
                cur2.tries++
                if (v.result === 'WA')
                  cur2.penalty += 1200000
              }
            } else if (!['first_blood', 'accepted'].includes(cur2.result)) {
              cur2.result = 'frozen'
              cur2.frozenTries++
            }
          }
        })

      return { final: ret1, frozen: ret2 }
    },

    // Generate rank from status
    genRank(status) {
      const ret = []
      status.forEach((v, k)=>{
        let solved = 0, penalty = 0
        v.filter((v)=>['first_blood', 'accepted'].includes(v.result)).forEach((v)=>{
          solved++
          penalty += v.penalty
        })
        ret.push({
          teamKey: k,
          name: this.teamMap.get(k).name,
          school: this.teamMap.get(k).school,
          solved,
          penalty,
          status: v.map((v, idx)=>({
            ...v,
            id: idx
          }))
        })
      })

      ret.sort((a, b)=>{
        if (a.solved !== b.solved)
          return b.solved - a.solved
        else if (a.penalty !== b.penalty)
          return a.penalty - b.penalty
        else if (a.name !== b.name)
          return a.name < b.name ? -1 : 1
        else 
          return a.school < b.school ? -1 : 1
      })

      let lstRnkIdx = -1, lstRnk = 1, stp = 1
      ret.forEach((v, idx, ref)=>{
        const team = this.teamMap.get(v.teamKey)
        if (team.kind === 'Unofficial' && this.mode === 'Regular') {
          ref[idx].rank = -1
          return
        }

        if (lstRnkIdx === -1) {
          ref[idx].rank = 1
        } else {
          if (v.solved !== ref[lstRnkIdx].solved || v.penalty !== ref[lstRnkIdx].penalty)
            lstRnk = stp
          ref[idx].rank = lstRnk
        }
        lstRnkIdx = idx
        stp++
      })

      return ret
    },

    // Rerank
    reRank() {
      const ret = _.cloneDeep(this.rank)

      ret.sort((a, b)=>{
        if (a.solved !== b.solved)
          return b.solved - a.solved
        else if (a.penalty !== b.penalty)
          return a.penalty - b.penalty
        else if (a.name !== b.name)
          return a.name < b.name ? -1 : 1
        else 
          return a.school < b.school ? -1 : 1
      })

      let lstRnkIdx = -1, lstRnk = 1, stp = 1
      ret.forEach((v, idx, ref)=>{
        const team = this.teamMap.get(v.teamKey)
        if (team.kind === 'Unofficial' && this.mode === 'Regular') {
          ref[idx].rank = -1
          return
        }

        if (lstRnkIdx === -1) {
          ref[idx].rank = 1
        } else {
          if (v.solved !== ref[lstRnkIdx].solved || v.penalty !== ref[lstRnkIdx].penalty)
            lstRnk = stp
          ref[idx].rank = lstRnk
        }
        lstRnkIdx = idx
        stp++
      })

      this.rank = ret
    }
  },
  persist: {
    paths: [
      'contestName',
      'startTime', 'endTime', 'frozenStartTime',
      'goldNum', 'silverNum', 'bronzeNum',
      'schoolOptions', 'mode',
      'teamFilter', 'schoolFilter'
    ]
  }
})
