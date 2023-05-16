/* Contest store */
import { defineStore } from 'pinia'
import _ from 'lodash'
import { Contest } from '../api/contest'

const contest = Contest.getInstance()

// Export
export const useContestStore = defineStore('contest', {
  state: ()=>({
    // Internal
    title: '',
    startTime: '',
    endTime: '',
    contestList: '',
    schoolList: null,
    schoolFilter: null,
    unofficialFilter: false,
    problems: null,
    rank: null,
    loop: null,
    focusKey: null
  }),
  getters: {
    filteredRank() {
      if (this.rank === null)
        return null
      let ret = this.rank
      if (this.unofficialFilter)
        ret = ret.filter((v)=>v.tkind !== 2)
      const f = this.getFilter()
      return ret.filter((v)=>!f.includes(v.school))
    }
  },
  actions: {
    async init() {
      const list = this.contestList.split(',').map((v)=>parseInt(v))
      const res = await contest.init(list)
      if (res.code !== 0)
        return res

      this.title = contest.title
      this.startTime = new Date(contest.startTime).toLocaleString()
      this.endTime = new Date(contest.endTime).toLocaleString()

      const tmp = []
      contest.teamMap.forEach((v)=>{
        if (v.school && !tmp.includes(v.school))
          tmp.push(v.school)
      })
      tmp.sort()
      this.schoolList = tmp
      this.schoolFilter = new Array(tmp.length).fill(null)
      this.problems = contest.problemList

      document.title = this.title + ' | Aqua Rank'

      return { code: 0, data: contest }
    },
    getFilter() {
      return this.schoolFilter.filter((v)=>v !== null)
    },
    async update(all, timeAfter, timeBefore) {
      const res = (await contest.update(all, timeAfter, timeBefore))
      if (res.code !== 0)
        return res

      this.rank = contest.rank 
      return { code: 0 }
    },
    async startLoop(force, oneshot) {
      if (this.loop !== null && force !== true)
        return { code: 0 }

      if (force === true)
        clearInterval(this.loop)

      let res = await this.init()
      if (res.code !== 0)
        return res

      await this.update(true)

      if (oneshot === true) {
        console.log('One shot mode')
        return { code: 0 }
      }

      let lstf = new Date().getTime()
      this.loop = setInterval(async ()=>{
        if (new Date().getTime() - lstf >= 60000 * 5) {
          await this.update(true)
          console.log(contest.rank)
          lstf = new Date().getTime()
        }
        else
          await this.update()
      }, 20000)

      return { code: 0 }
    },
    async testLoop(time) {
      if (this.loop !== null)
        clearInterval(this.loop)

      let res = await this.init()
      if (res.code !== 0)
        return res

      await this.update(true, time, new Date(time.getTime() + 60000))

      this.loop = setInterval(async ()=>{
        time = new Date(time.getTime() + 60000)
        await this.update(false, new Date(time.getTime() - 1000), new Date(time.getTime() + 60000))
      }, 10000)

      return { code: 0 }
    }
  },
  persist: {
    paths: ['title', 'startTime', 'endTime', 'contestList', 'schoolList', 'schoolFilter', 'unofficialFilter']
  }
})
