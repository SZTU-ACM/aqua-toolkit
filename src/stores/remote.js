/* Remote store */
import axios from 'axios'
import { Base64 } from 'js-base64'
import { defineStore } from 'pinia'
import dateFormat from 'dateformat'

// Functions
const encodeJson = (data)=>{
  return encodeURI(Base64.encode(JSON.stringify(data)))
}
const encodeTime = (time)=>{
  return dateFormat(time, 'yyyy-mm-dd HH:MM:ss')
}

// Export
export const useRemoteStore = defineStore('remote', {
  state: ()=>({
    apiUrl: '',
    accessToken: null,
    refreshToken: null,
    lastRefreshTime: null,
    userId: null,
    privilege: null,
    skipLogin: false
  }),
  actions: {
    async login(userId, passwd) {
      if (this.skipLogin)
        return { code: 0 }

      try {
        const res = (await axios({
          url: '/api/token',
          method: 'post',
          baseURL: this.apiUrl,
          data: {
            user_id: userId,
            password: passwd
          }
        })).data
        if (res.code !== 200)
          throw { message: res.msg }

        this.$patch({
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          lastRefreshTime: new Date().getTime(),
          userId,
          privilege: res.privilege
        })

        return { code: 0 }
      } catch (err) {
        return { code: -1, msg: err.message }
      }
    },
    logout() {
      this.$patch({
        accessToken: null,
        refreshToken: null,
        lastRefreshTime: null,
        userId: null,
        privilege: null
      })
    },
    async refresh(force) {
      if (this.skipLogin)
        return { code: 0 }

      if (new Date().getTime() - this.lastRefreshTime < 86400000 && force !== true)
        return { code: 0 }

      try {
        const res = (await axios({
          url: '/api/token',
          method: 'put',
          baseURL: this.url,
          headers: {
            'Authorization': 'Bearer ' + this.refreshToken
          }
        })).data
        if (res.code !== 200)
          throw { message: res.msg }

        this.$patch({
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          lastRefreshTime: new Date().getTime(),
          privilege: res.privilege
        })

        return { code: 0 }
      } catch (err) {
        this.logout()
        return { code: -1, msg: err.message }
      }
    },
    async fetchContestList(contestIdList) {
      const res = await this.refresh()
      if (res.code < 0)
        return res

      try {
        const ret = new Map()
        for (const id of contestIdList) {
        const res = (await axios({
          url: '/api/contest_list',
          method: 'get',
          baseURL: this.apiUrl,
          headers: (this.skipLogin ? {} : {
            'Authorization': 'Bearer ' + this.accessToken
          }),
          params: {
            json: encodeJson({
              filter: {
                contest_id: ['=', id]
              }
            })
          }
        })).data
        if (res.code !== 200)
          throw { message: res.meg }

        res.data.filter((v)=>v !== null && v.private === 2).forEach((v)=>{
          ret.set(v.contest_id, v)
        })
        }

        return { code: 0, data: ret }
      } catch (err) {
        return { code: -1, msg: err.message }
      }
    },
    async fetchProblemList(contestIdList) {
      const res = await this.refresh()
      if (res.code < 0)
        return res

      try {
        const ret = new Map()
        for (const id of contestIdList) {
        const res = (await axios({
          url: '/api/contest_problem_list',
          method: 'get',
          baseURL: this.apiUrl,
          headers: (this.skipLogin ? {} : {
            'Authorization': 'Bearer ' + this.accessToken
          }),
          params: {
            json: encodeJson({
              filter: {
                contest_id: ['=', id]
              }
            })
          }
        })).data
        if (res.code !== 200)
          throw { message: res.meg }

        res.data.forEach((v)=>{
          if (!ret.has(v.contest_id))
            ret.set(v.contest_id, [])
          ret.get(v.contest_id).push(v)
        })
        }
        ret.forEach((v, k, self)=>{
          self.set(k, v.sort((a, b)=>a.num - b.num))
        })

        return { code: 0, data: ret }
      } catch (err) {
        return { code: -1, msg: err.message }
      }
    },
    async fetchTeamList(contestIdList) {
      const res = await this.refresh()
      if (res.code < 0)
        return res

      try {
        const ret = new Map()
        for (const id of contestIdList) {
        const res = (await axios({
          url: '/api/cpc_team_list',
          method: 'get',
          baseURL: this.apiUrl,
          headers: (this.skipLogin ? {} : {
            'Authorization': 'Bearer ' + this.accessToken
          }),
          params: {
            json: encodeJson({
              filter: {
                contest_id: ['=', id]
              }
            })
          }
        })).data
        if (res.code !== 200)
          throw { message: res.meg }

        res.data.forEach((v)=>{
          if (v.name.startsWith('*')) {
            v.name = v.name.substr(1)
            v.tkind = 2
          }
          ret.set(v.team_id + '@' + v.contest_id, v)
        })
        }

        return { code: 0, data: ret }
      } catch (err) {
        return { code: -1, msg: err.message }
      }
    },
    async fetchSolutionListRaw(filter) {
      const res = await this.refresh()
      if (res.code < 0)
        return res

      try {
        const res = (await axios({
          url: '/api/solution_list',
          method: 'get',
          baseURL: this.apiUrl,
          headers: (this.skipLogin ? {} : {
            'Authorization': 'Bearer ' + this.accessToken
          }),
          params: {
            json: encodeJson(filter)
          }
        })).data
        if (res.code !== 200)
          throw { message: res.meg }

        const ret = res.data.map((v)=>({
          solution_id: v[0],
          contest_id: v[1],
          problem_id: v[2],
          team_id: v[3],
          result: v[4],
          in_date: new Date(v[5]).getTime()
        }))

        return { code: 0, data: ret }
      } catch (err) {
        return { code: -1, msg: err.message }
      }
    },
    async fetchSolutionListByContests(contestIdList, timeAfter, timeBefore) {
      const ret = []
      for (let i = 0; i < contestIdList.length; ++i) {
        const res = await this.fetchSolutionListRaw({
          contest_id: contestIdList[i],
          in_date_after: encodeTime(timeAfter),
          in_date_before: timeBefore !== undefined ? encodeTime(timeBefore) : undefined
        })
        if (res.code !== 0)
          return res

        ret.push(...res.data)
      }
      ret.sort((a, b)=>a.in_date - b.in_date)

      return { code: 0, data: ret }
    },
    async fetchSolutionListByIds(cidSidMap) {
      const ret = []
      for (let i of cidSidMap) {
        const res = await this.fetchSolutionListRaw({
          contest_id: i[0],
          solution_id_list: i[1]
        })
        if (res.code !== 0)
          return res

        ret.push(...res.data)
      }
      ret.sort((a, b)=>a.in_date - b.in_date)

      return { code: 0, data: ret }
    }
  },
  persist: {
    paths: [
      'accessToken', 'apiUrl', 'lastRefreshTime', 'privilege', 'refreshToken', 'userId'
    ]
  }
})
