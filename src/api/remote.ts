/* Remote interface */
import axios from 'axios'
import { Base64 } from 'js-base64'
import dateFormat from 'dateformat'

// Interfaces
interface ParamDefine {
  name: string,
  desc?: string,
  key: string,
  type?: string
}

export interface TeamInfo {
  teamId: string,
  name: string,
  school: string,
  members: string,
  coach: string,
  room: string,
  type: string,
  tag: string
}

export interface ContestInfo {
  contestId: number,
  name: string,
  startTime: number,
  endTime: number,
  frozenTime: number,
  problemIdList: number[],
  teamList: TeamInfo[]
}

export interface SolutionInfo {
  solutionId: number,
  contestId: number,
  problemId: number,
  teamId: string,
  time: number,
  status: string
}

// Remote class template below
/*
class Remote {
  // Remote description
  static description: string = ''

  // Remote parameters
  static paramDefine: ParamDefine[] = []
  static parameters: Map<string, string> = new Map()

  // Fetch contest info
  static async fetchContestInfo(contestId: number): Promise<ContestInfo> {}

  // Fetch solutions info
  static async fetchSolutionsInfo(contestId: number, filter: number | number[]): Promise<SolutionInfo[]> {}
}
*/

class Remote {
  // Remote description
  static description: string = 'SOJ remote provided'

  // Remote parameters
  static paramDefine: ParamDefine[] = [
    {
      name: 'API url',
      desc: 'http(s)://...',
      key: 'api_url',
      type: 'url'
    },
    {
      name: 'No login mode',
      desc: '"true" for enable, other for disable',
      key: 'no_login',
      type: 'text'
    },
    {
      name: 'User ID',
      key: 'user_id',
      type: 'text'
    },
    {
      name: 'Password',
      key: 'password',
      type: 'password'
    }
  ]
  static parameters: Map<string, string> = new Map()

  // Fetch contest info
  static async fetchContestInfo(contestId: number): Promise<ContestInfo> {
    return Remote.soj_login().then((accessToken)=>{
      const contestInfo = Remote.soj_getContest(contestId, accessToken)
      const problemsInfo = Remote.soj_getProblems(contestId, accessToken)
      const teamsInfo = Remote.soj_getTeams(contestId, accessToken)
      return Promise.all([contestInfo, problemsInfo, teamsInfo])
    }).then((infos)=>{
      return {
        contestId,
        name: infos[0].title,
        startTime: new Date(infos[0].start_time).getTime(),
        endTime: new Date(infos[0].end_time).getTime(),
        frozenTime: new Date(infos[0].end_time).getTime() - infos[0].frozen_minute * 60000,
        problemIdList: infos[1].map((x)=>x.problem_id),
        teamList: infos[2].map((x)=>({
          teamId: x.team_id,
          name: x.name.startsWith('*') ? x.name.substr(1) : x.name,
          school: x.school,
          members: x.tmember,
          coach: x.coach,
          room: x.room,
          type: ['official', 'girl', 'unofficial'][x.name.startsWith('*') ? 2 : x.tkind],
          tag: ''
        }))
      }
    })
  }

  // Fetch solutions info
  static async fetchSolutionsInfo(contestId: number, filter: number | number[]): Promise<SolutionInfo[]> {
    return Remote.soj_login().then((accessToken)=>{
      if (typeof filter === 'number')
        return Remote.soj_getSolutions(contestId, filter, accessToken)
      else
        return Remote.soj_getSolutionsById(contestId, filter, accessToken)
    }).then((res)=>{
      return res.map((x)=>({
        solutionId: x[0],
        contestId: x[1],
        problemId: x[2],
        teamId: x[3],
        time: new Date(x[5]).getTime(),
        status: x[4] === 4 ? 'AC' : (x[4] === 11 ? 'CE' : (x[4] === -1 ? 'FR' : x[4] >= 5 ? 'WA' : 'PD'))
      }))
    })
  }

  static soj_mkparam(data: object) {
    return encodeURI(Base64.encode(JSON.stringify(data)))
  }

  static soj_mktime(time: Date) {
    return dateFormat(time, 'yyyy-mm-dd HH:MM:ss')
  }

  static async soj_login() {
    if (Remote.parameters.get('no_login')?.trim() === 'true')
      return true

    const res = (await axios({
      baseURL: Remote.parameters.get('api_url'),
      url: '/api/token',
      method: 'post',
      data: {
        user_id: Remote.parameters.get('user_id'),
        password: Remote.parameters.get('password')
      }
    })).data
    if (res.code !== 200)
      throw new Error(res.msg)

    return res.access_token as string
  }

  static async soj_getContest(contestId: number, accessToken: boolean | string) {
    const res = (await axios({
      baseURL: Remote.parameters.get('api_url'),
      url: '/api/contest_list',
      method: 'get',
      headers: {
        Authorization: accessToken === true ? undefined : `Bearer ${accessToken}`
      },
      params: {
        json: Remote.soj_mkparam({
          filter: {
            contest_id: ['=', contestId.toString()]
          }
        })
      }
    })).data
    if (res.code !== 200)
      throw new Error(res.msg)

    return res.data[0]
  }

  static async soj_getProblems(contestId: number, accessToken: boolean | string) {
    const res = (await axios({
      baseURL: Remote.parameters.get('api_url'),
      url: '/api/contest_problem_list',
      method: 'get',
      headers: {
        Authorization: accessToken === true ? undefined : `Bearer ${accessToken}`
      },
      params: {
        json: Remote.soj_mkparam({
          filter: {
            contest_id: ['=', contestId.toString()]
          }
        })
      }
    })).data
    if (res.code !== 200)
      throw new Error(res.msg)

    return (res.data as any[]).sort((a, b)=>a.num - b.num)
  }

  static async soj_getTeams(contestId: number, accessToken: boolean | string) {
    const res = (await axios({
      baseURL: Remote.parameters.get('api_url'),
      url: '/api/cpc_team_list',
      method: 'get',
      headers: {
        Authorization: accessToken === true ? undefined : `Bearer ${accessToken}`
      },
      params: {
        json: Remote.soj_mkparam({
          filter: {
            contest_id: ['=', contestId.toString()]
          }
        })
      }
    })).data
    if (res.code !== 200)
      throw new Error(res.msg)

    return res.data as any[]
  }

  static async soj_getSolutions(contestId: number, after: number, accessToken: boolean | string) {
    const res = (await axios({
      baseURL: Remote.parameters.get('api_url'),
      url: '/api/solution_list',
      method: 'get',
      headers: {
        Authorization: accessToken === true ? undefined : `Bearer ${accessToken}`
      },
      params: {
        json: Remote.soj_mkparam({
          contest_id: contestId.toString(),
          in_date_after: Remote.soj_mktime(new Date(after))
        })
      }
    })).data
    if (res.code !== 200)
      throw new Error(res.msg)

    return res.data as any[]
  }

  static async soj_getSolutionsById(contestId: number, solutionIdList: number[], accessToken: boolean | string) {
    const res = (await axios({
      baseURL: Remote.parameters.get('api_url'),
      url: '/api/solution_list',
      method: 'get',
      headers: {
        Authorization: accessToken === true ? undefined : `Bearer ${accessToken}`
      },
      params: {
        json: Remote.soj_mkparam({
          contest_id: contestId.toString(),
          solution_id_list: solutionIdList
        })
      }
    })).data
    if (res.code !== 200)
      throw new Error(res.msg)

    return res.data as any[]
  }
}

// Export
export { Remote }