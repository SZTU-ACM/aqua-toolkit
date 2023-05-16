/* SOJ interface store */
import { defineStore } from 'pinia'
import _ from 'lodash'
import axios from 'axios'
import { Base64 } from 'js-base64'
import { useResolverStore } from '../resolver'

// Export
export const useSojStore = defineStore('soj', {
  state: ()=>({
    // Input
    api: '',
    userId: '',
    passwd: '',
    idList: '',
    // Internal
    accessToken: '',
    contestIdList: []
  }),
  actions: {
    async fetchMetaData() {
      const main = useResolverStore()
      main.interfaceMsg = '<span>Fetching...</span>'

      try {
        await this.login()
        await this.verifyContests()
        await this.verifyProblems()
        await this.fetchTeamInfo()
        await this.fetchSolutions()
        main.interfaceMsg = '<span>Done.</span>'
        main.fetchMetaFinished()
      } catch (err) {
        console.error(err)
        main.interfaceMsg = `<span class="text-red-500">${err.message}</span>`
      }
    },
    encodeJsonParam(data) {
      return { json: encodeURI(Base64.encode(JSON.stringify(data))) }
    },
    async login() {
      if (this.api.length === 0)
        throw new Error('API url cannot be empty')

      const res = (await axios({
        url: '/api/token',
        baseURL: this.api,
        method: 'post',
        data: {
          user_id: this.userId,
          password: this.passwd
        }
      })).data
      if (res.code !== 200)
        throw new Error(res.msg)
      if (res.privilege.administrator !== true)
        throw new Error('Permission denied')

      this.accessToken = res.access_token
    },
    async verifyContests() {
      if (/^(\d+)(,\d+)*$/.test(this.idList) === false)
        throw new Error('Invalid contest ID list')
      this.contestIdList = this.idList.split(',').map((v)=>parseInt(v))

      const res = (await axios({
        url: '/api/contest_list',
        baseURL: this.api,
        method: 'get',
        params: this.encodeJsonParam({
          filter: {
            contest_id: ['in', this.contestIdList]
          }
        }),
        headers: {
          'Authorization': 'Bearer ' + this.accessToken
        }
      })).data
      if (res.code !== 200)
        throw new Error(res.msg)

      let tmp = _.xor(res.data.map((v)=>v.contest_id), this.contestIdList)
      if (tmp.length !== 0)
        throw new Error('Contest unavailable: ' + tmp.join(', '))

      for (let i = 1; i < res.data.length; ++i)
        if (res.data[0].start_time !== res.data[i].start_time || res.data[0].end_time !== res.data[i].end_time)
          throw new Error('Contest time unmatched: ' + res.data[i].contest_id)
    
      const main = useResolverStore()
      main.contestName = res.data[0].title
      main.startTime = res.data[0].start_time
      main.endTime = res.data[0].end_time
      
      tmp = new Date(res.data[0].end_time)
      tmp = new Date(tmp.getTime() - res.data[0].frozen_minute * 60000 + 28800000)
      main.frozenStartTime = tmp.toISOString().split('.')[0]
    },
    async verifyProblems() {
      const res = (await axios({
        url: '/api/contest_problem_list',
        baseURL: this.api,
        method: 'get',
        params: this.encodeJsonParam({
          filter: {
            contest_id: ['in', this.contestIdList]
          }
        }),
        headers: {
          'Authorization': 'Bearer ' + this.accessToken
        }
      })).data
      if (res.code !== 200)
        throw new Error(res.msg)

      let tmp = _.groupBy(res.data, 'contest_id')
      if (_.uniq(_.toPairs(tmp).map((v)=>v[1].length)).length !== 1)
        throw new Error('Contest problem count unmatched')

      _.keys(tmp).forEach((v, __, ref)=>{
        const a = tmp[v].sort((a, b)=>a.num - b.num).map((v)=>v.problem_id)
        const b = tmp[ref[0]].sort((a, b)=>a.num - b.num).map((v)=>v.problem_id)
        for (let i = 0; i < a.length; ++i)
          if (a[i] !== b[i])
            throw new Error('Contest problem unmatched: ' + v + ':' + i)
      })

      const main = useResolverStore()
      main.problemList = _.toPairs(tmp)[0][1].sort((a, b)=>a.num - b.num).map((v)=>v.problem_id)
    },
    async fetchTeamInfo() {
     const res = (await axios({
        url: '/api/cpc_team_list',
        baseURL: this.api,
        method: 'get',
        params: this.encodeJsonParam({
          filter: {
            contest_id: ['in', this.contestIdList]
          }
        }),
        headers: {
          'Authorization': 'Bearer ' + this.accessToken
        }
      })).data
      if (res.code !== 200)
        throw new Error(res.msg)

      const main = useResolverStore()
      main.schoolOptions = _.uniq(res.data.map((v)=>v.school).filter((v)=>typeof v === 'string' && v.trim().length > 0))
      main.schoolFilter = _.cloneDeep(main.schoolOptions)
      main.teamMap = new Map(res.data.map((v)=>[
        `${v.team_id}@${v.contest_id}`,
        {
          name: v.name.startsWith('*') ? v.name.substr(1) : v.name,
          school: v.school,
          member: v.tmember,
          kind: v.name.startsWith('*') ? 'Unofficial' : ['Official', 'Girl', 'Unofficial'][v.tkind]
        }
      ]))
    },
    async fetchSolutions() {
      let tmp = []
      for (let i = 0; i < this.contestIdList.length; ++i) {
        const res = (await axios({
          url: '/api/solution_list',
          baseURL: this.api,
          method: 'get',
          params: this.encodeJsonParam({
            contest_id: this.contestIdList[i]
          }),
          headers: {
            'Authorization': 'Bearer ' + this.accessToken
          }
        })).data
        if (res.code !== 200)
          throw new Error(res.msg)

        tmp.push(...res.data.map((v)=>{
          if ([0, 1, 2, 3].includes(v[4]))
            throw new Error('Solutions are judging')
          if (v[4] === -1)
            throw new Error('Permission denied')
      
          return {
            teamKey: `${v[3]}@${v[1]}`,
            problemId: v[2],
            result: v[4] === 4 ? 'AC' : (v[4] === 11 ? 'CE' : 'WA'),
            inDate: v[5]
          }
        }))
      }

      const main = useResolverStore()
      main.solutionList = tmp.sort((a, b)=>a.inDate < b.inDate ? -1 : 1)
    }
  },
  persist: {
    paths: [
      'api', 'userId', 'passwd', 'idList'
    ]
  }
})
