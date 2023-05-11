/* Resolver store */
import { defineStore } from 'pinia'
import { Remote, ContestInfo, SolutionInfo, TeamInfo } from '../api/remote'
import _ from 'lodash'
import dateFormat from 'dateformat'

// Interface
export interface ProblemStatus {
  status: string,
  tries: number,
  frozenTries: number,
  penalty: number
}
interface RankItem {
  teamKey: string,
  rank: number,
  realRank: number,
  name: string,
  members: string,
  school: string,
  type: string,
  solved: number,
  penalty: number,
  status: ProblemStatus[]
}
interface Job {
  command: string,
  parameters?: any[]
}

// Functions
const mkstatus = (problemIdList: number[], solutions: SolutionInfo[], startTime: number, frozenTime?: number): Map<string, ProblemStatus[]>=>{
  const ret = new Map<string, ProblemStatus[]>()
  const firstBlood: number[] = []
  const statusTemplate: ProblemStatus = {
    status: 'none',
    tries: 0,
    frozenTries: 0,
    penalty: 0
  }

  solutions.forEach((x)=>{
    const teamKey = `${x.teamId}@${x.contestId}`
    const problemIdx = problemIdList.indexOf(x.problemId)

    // If problem deleted
    if (problemIdx === -1) {
      return
    }

    // If team first occurred
    if (!ret.has(teamKey)) {
      ret.set(teamKey, _.times(problemIdList.length, ()=>_.cloneDeep(statusTemplate)))
    }
    const curStatus = (ret.get(teamKey) as ProblemStatus[])[problemIdx]

    // If already accepted
    if (['first_blood', 'accepted'].includes(curStatus.status)) {
      return
    }

    // If frozen
    if (x.time >= (frozenTime ?? Number.MAX_SAFE_INTEGER)) {
      curStatus.status = 'frozen'
      curStatus.frozenTries++
      return
    }

    // Switch status
    switch (x.status) {
      case 'AC':
        if (firstBlood.includes(x.problemId))
          curStatus.status = 'accepted'
        else {
          firstBlood.push(x.problemId)
          curStatus.status = 'first_blood'
        }

        curStatus.tries++
        curStatus.penalty += x.time - startTime
        break
      case 'CE':
        curStatus.status = 'wrong_answer'
        curStatus.tries++
        break
      case 'WA':
        curStatus.status = 'wrong_answer'
        curStatus.tries++
        curStatus.penalty += 1200000
        break
      default:
        break
    }
  })

  return ret
}
const mkrank = (teamList: Map<string, TeamInfo>, status: Map<string, ProblemStatus[]>, mode: string): [RankItem[], Map<string, number>]=>{
  const ret: RankItem[] = []

  // Generate rank
  status.forEach((v, k)=>{
    const team = teamList.get(k) as TeamInfo
    let solved = 0
    let penalty = 0

    v.filter((x)=>['first_blood', 'accepted'].includes(x.status)).forEach((x)=>{
      solved++
      penalty += x.penalty
    })
    ret.push({
      teamKey: k,
      rank: -1,
      realRank: -1,
      name: team.type === 'unofficial' ? `*${team.name}` : team.name,
      members: team.members,
      school: team.school,
      type: team.type,
      solved,
      penalty,
      status: v
    })
  })

  // Sort
  ret.sort((a, b)=>{
    if (a.solved !== b.solved)
      return b.solved - a.solved
    return a.penalty - b.penalty
  })

  // Assign rank
  let curRank = 1, totRank = 0, lstIdx = -1
  ret.forEach((x, i, ref)=>{
    ref[i].realRank = i + 1
    if (x.type === 'unofficial' && mode === 'regular') {
      return
    }
    totRank++
    if (lstIdx !== -1 && (ret[lstIdx].solved !== x.solved || ret[lstIdx].penalty !== x.penalty)) {
      curRank = totRank
    }
    ref[i].rank = curRank
    lstIdx = i
  })

  // Generate team rank map
  const mp = new Map(ret.map((x)=>[x.teamKey, x.realRank]))

  return [ret, mp]
}
const mkmedal = (rank: RankItem[], gold: number, silver: number, bronze: number): Map<string, string>=>{
  silver += gold
  bronze += silver

  const ret = new Map<string, string>()
  rank.forEach((x)=>{
    if (x.rank === -1) {
      return
    }

    if (x.rank <= gold) {
      if (ret.size === 0) {
        ret.set(x.teamKey, 'champion')
      } else {
        ret.set(x.teamKey, 'gold')
      }
    } else if (x.rank <= silver) {
      ret.set(x.teamKey, 'silver')
    } else if (x.rank <= bronze) {
      ret.set(x.teamKey, 'bronze')
    }
  })

  return ret
}

// Store
export const useResolverStore = defineStore('resolver', {
  state: ()=>({
    // Remote params
    remoteParams: Remote.paramDefine.reduce((x, y)=>{
      x[y.key] = ''
      return x
    }, {} as Record<string, string>),
    // Settings
    idList: '',
    name: '',
    startTime: '',
    endTime: '',
    frozenTime: '',
    goldCount: 0,
    silverCount: 0,
    bronzeCount: 0,
    mode: 'regular',
    schoolOptions: [] as string[],
    teamFilter: ['official', 'girl', 'unofficial'],
    schoolFilter: [] as string[],
    // Prefetch
    contestIdList: [] as number[],
    contestInfos: [] as ContestInfo[],
    problemIdList: [] as number[],
    lastPrefetchTime: null as null | number,
    prefetchDone: false,
    // Preprocess
    workflow: null as null | Job[],
    initRank: [] as RankItem[],
    lastPreprocessTime: null as null | number,
    // Resolve
    rank: [] as RankItem[],
    speed: 1,
    focusTeam: '',
    focusProblem: -1,
    resolveStart: false,
    transitionClass: null as null | HTMLStyleElement,
    podiumTeam: null as null | TeamInfo,
    podiumMedal: '',
    podiumShow: false,
    podiumList: null as null | TeamInfo[],
    podiumListShow: false,
    manualMode: false,
    res0: null as null | Function
  }),
  getters: {
    timeSpan: (state)=>{
      return `${dateFormat(state.startTime, 'yyyy/mm/dd HH:MM:ss')} ~ ${dateFormat(state.endTime, 'yyyy/mm/dd HH:MM:ss')}`
    }
  },
  actions: {
    async prefetch() {
      // Reset prefetch status
      this.prefetchDone = false

      // Pass parameters to remote
      Remote.parameters = new Map(_.toPairs(this.remoteParams))

      // Check contest ID list
      if (!/\d+(,\d+)*/.test(this.idList.replace(' ', ''))) {
        alert('Invalid ID list')
        return
      }
      this.contestIdList = this.idList.replace(' ', '').split(',').map((x)=>parseInt(x))

      // Fetch all contest info
      try {
        await Promise.all(this.contestIdList.map((x)=>Remote.fetchContestInfo(x))).then((ls)=>{
          this.contestInfos = ls
        })
      } catch (err) {
        alert(`Prefetch error: ${(err as Error).message}`)
        return
      }

      // Check contest merge
      for (const i of this.contestInfos) {
        if (i.startTime !== this.contestInfos[0].startTime) {
          alert(`Start time not matched: ${i.contestId}`)
          return
        }

        if (i.endTime !== this.contestInfos[0].endTime) {
          alert(`End time not matched: ${i.contestId}`)
          return
        }

        if (i.frozenTime !== this.contestInfos[0].frozenTime) {
          alert(`Frozen start time not matched: ${i.contestId}`)
          return
        }

        if (!_.isEqual(i.problemIdList, this.contestInfos[0].problemIdList)) {
          alert(`Problem list not matched: ${i.contestId}`)
          return
        }
      }

      // Patch states
      this.$patch({
        name: this.contestInfos[0].name,
        startTime: dateFormat(this.contestInfos[0].startTime, 'yyyy-mm-dd\'T\'HH:MM:ss'),
        endTime: dateFormat(this.contestInfos[0].endTime, 'yyyy-mm-dd\'T\'HH:MM:ss'),
        frozenTime: dateFormat(this.contestInfos[0].frozenTime, 'yyyy-mm-dd\'T\'HH:MM:ss'),
        problemIdList: this.contestInfos[0].problemIdList,
        schoolOptions: _.uniq(this.contestInfos.flatMap((x)=>x.teamList.map((x)=>x.school)).filter((x)=>x)),
        schoolFilter: _.uniq(this.contestInfos.flatMap((x)=>x.teamList.map((x)=>x.school)).filter((x)=>x)),
        lastPrefetchTime: new Date().getTime(),
        prefetchDone: true
      })
    },
    async preprocess() {
      // Reset workflow
      this.workflow = null

      // Generate lists
      const teamList = new Map()
      this.contestInfos.forEach((x)=>{
        x.teamList.forEach((y)=>{
          teamList.set(`${y.teamId}@${x.contestId}`, y)
        })
      })

      // Pass parameters to remote
      Remote.parameters = new Map(_.toPairs(this.remoteParams))

      // Fetch all solutions
      let solutions: SolutionInfo[] = []
      try {
        await Promise.all(this.contestIdList.map((x)=>Remote.fetchSolutionsInfo(x, 0))).then((ls)=>{
          ls.forEach((x)=>solutions.push(...x))
          solutions.sort((a, b)=>a.time - b.time)
        })
      } catch (err) {
        alert(`Preprocess error: ${(err as Error).message}`)
        return
      }

      // Check finished & privilege
      for (const i of solutions) {
        if (i.status === 'PD') {
          alert(`Contest is still judging: ${i.solutionId}@${i.contestId}`)
          return
        }

        if (i.status === 'FR') {
          alert(`Privilege denied: ${i.solutionId}@${i.contestId}`)
          return
        }
      }

      // Apply filters
      solutions = solutions.filter((x)=>{
        const team = teamList.get(`${x.teamId}@${x.contestId}`) as TeamInfo

        return this.teamFilter.includes(team.type) && this.schoolFilter.includes(team.school)
      })

      // Generate status
      const frozenStatus = mkstatus(this.problemIdList, solutions, new Date(this.startTime).getTime(), new Date(this.frozenTime).getTime())
      const finalStatus = mkstatus(this.problemIdList, solutions, new Date(this.startTime).getTime())

      // Generate medals
      const medalMap = mkmedal(mkrank(teamList, finalStatus, this.mode)[0], this.goldCount, this.silverCount, this.bronzeCount)
      const medalCnt = [...medalMap.entries()].reduce((x, y)=>{
        x[y[1] === 'champion' ? 'gold' : y[1]]++
        return x
      }, { gold: 0, silver: 0, bronze: 0 } as Record<string, number>)
      let medalLs = []

      // Generate workflow
      let [rank, trmap] = mkrank(teamList, frozenStatus, this.mode)
      this.workflow = [{ command: 'moveToButton' }]
      this.initRank = _.cloneDeep(rank)
      for (let i = rank.length - 1; i >= 0; i--) {
        // Focus on team
        this.workflow.push({ command: 'focusOnTeam', parameters: [rank[i].teamKey] })

        // Scan status
        let hasChange = false
        for (let j = 0; j < this.problemIdList.length; j++) {
          if (rank[i].status[j].status === 'frozen') {
            // Focus on status
            this.workflow.push({ command: 'focusOnStatus', parameters: [j] })

            // Reveal status
            const status = (finalStatus.get(rank[i].teamKey) as ProblemStatus[])[j]
            const fStatus = (frozenStatus.get(rank[i].teamKey) as ProblemStatus[])[j]
            fStatus.status = status.status
            this.workflow.push({ command: 'revealStatus', parameters: [i, j, status] })

            // Generate new rank
            fStatus.penalty = status.penalty
            const [t1, t2] = mkrank(teamList, frozenStatus, this.mode)

            // Update rank
            if (t2.get(rank[i].teamKey) !== trmap.get(rank[i].teamKey)) {
              const rewriteMap = new Map(t1.map((x)=>[x.teamKey, x.rank]))

              this.workflow.push({ command: 'updateRank', parameters: [i, t2.get(rank[i].teamKey), [...rewriteMap.entries()]] })
              rank = t1
              trmap = t2
              i++
              hasChange = true
              break
            }
            rank = t1
            trmap = t2
          }
        }

        // Award medal
        if (hasChange) {
          continue
        } else if (medalMap.has(rank[i].teamKey)) {
          const teamKey = rank[i].teamKey
          const medal = medalMap.get(teamKey) as string

          this.workflow.push({ command: 'awardMedal', parameters: [teamList.get(rank[i].teamKey), medal] })

          medalCnt[medal === 'champion' ? 'gold' : medal]--
          medalLs.push(teamKey)
          if (medalCnt[medal === 'champion' ? 'gold' : medal] === 0) {
            this.workflow.push({ command: 'awardList', parameters: [medal === 'champion' ? 'gold' : medal, medalLs.map((x)=>teamList.get(x))] })
            medalLs = []
          }
        }
      }
      this.workflow.push({ command: 'done' })
      this.lastPreprocessTime = new Date().getTime()
    },
    async resolve() {
      // Set environment
      if (this.resolveStart)
        return 
      this.resolveStart = true
      document.body.style.overflowY = 'hidden'
      onbeforeunload = (ev)=>{
        ev.preventDefault()
        ev.returnValue = ''
        alert('Sure to leave?')
      }

      for (const i of this.workflow as Job[]) {
        console.log(i.command, i.parameters)
        switch (i.command) {
          case 'moveToButton':
            await this.moveToButton()
            break
          case 'focusOnTeam':
            await this.focusOnTeam((i.parameters as any[])[0] as string)
            break
          case 'focusOnStatus':
            await this.focusOnStatus((i.parameters as any[])[0] as number)
            break
          case 'revealStatus':
            await this.revealStatus(i.parameters as any[])
            break
          case 'updateRank':
            await this.updateRank(i.parameters as any[])
            break
          case 'awardMedal':
            if (this.manualMode === false) {
              this.speed = 1
              this.manualMode = true
            }
            await this.awardMedal(i.parameters as any[])
            break
          case 'awardList':
            await this.awardList(i.parameters as any[])
            break
          case 'done':
            this.focusTeam = ''
            this.focusProblem = -1
            this.resolveStart = false
            document.body.style.overflowY = ''
            break
        }
      }
    },
    moveToButton() {
      // Wait for animation
      return new Promise<void>((res)=>{
        scrollTo(0, 0)
        const duration = 3000
        const target = document.documentElement.scrollHeight - document.documentElement.clientHeight
        const easeQuadInOut = (t: number)=>t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1
        let start = -1

        const delay = (time: number)=>new Promise<void>((res)=>setTimeout(()=>res(), time))
        const step = async (timestamp: number)=>{
          if (start === -1) {
            start = timestamp
          }

          const elapse = timestamp - start
          const pct = easeQuadInOut(Math.min(elapse / duration, 1))
          scrollTo(0, pct * target)

          if (elapse < duration) {
            requestAnimationFrame(step)
          } else {
            await delay(1000)
            res()
          }
        }
        requestAnimationFrame(step)
      })
    },
    focusOnTeam(teamKey: string) {
      // Wait for animation
      return new Promise<void>((res)=>{
        this.res0 = res
        this.focusTeam = teamKey
      })
    },
    async focusOnStatus(idx: number) {
      const delay = (time: number)=>new Promise<void>((res)=>setTimeout(()=>res(), time))

      this.focusProblem = idx

      // If manual mode
      if (this.manualMode) {
        await new Promise<void>((res)=>{
          const ku = (ev: KeyboardEvent)=>{
            if (ev.code === 'Space') {
              document.removeEventListener('keyup', ku)
              res()
            }
          }
  
          document.addEventListener('keyup', ku)
        })
      } else {
        await delay(500 * this.speed)
      }
    },
    async revealStatus(param: any[]) {
      // Get params
      const teamIdx = param[0] as number
      const problemIdx = param[1] as number
      const status = param[2] as ProblemStatus
      const curStatus = this.rank[teamIdx]

      // Update status
      curStatus.status[problemIdx] = status
      if (status.status !== 'wrong_answer') {
        curStatus.solved++
        curStatus.penalty += status.penalty
        curStatus.status[problemIdx].penalty = status.penalty
      }
      this.focusProblem = -1

      // Delay
      const delay = (time: number)=>new Promise<void>((res)=>setTimeout(()=>res(), time))
      await delay(200 * this.speed)
    },
    async updateRank(param: any[]) {
      // Get params
      const srcIdx = param[0] as number
      const dstIdx = param[1] as number
      const tmap = new Map(param[2] as [string, number][])

      // Set global class
      const duration = Math.max(Math.min(300 * (srcIdx - dstIdx), 1500), 500) * this.speed
      if (this.transitionClass === null) {
        this.transitionClass = document.createElement('style')
        document.head.appendChild(this.transitionClass as HTMLStyleElement);
        (this.transitionClass as HTMLStyleElement).sheet?.insertRule(`.row-move { transition: all ${duration}ms ease }`, 0)
      } else {
        (this.transitionClass as HTMLStyleElement).sheet?.deleteRule(0);
        (this.transitionClass as HTMLStyleElement).sheet?.insertRule(`.row-move { transition: all ${duration}ms ease }`, 0)
      }

      // Move
      const tmp = this.rank.splice(srcIdx, 1)[0]
      this.rank.splice(dstIdx - 1, 0, tmp)

      // Set new rank
      for (let i = dstIdx - 1; i < this.rank.length; ++i) {
        this.rank[i].rank = tmap.get(this.rank[i].teamKey) as number
      }

      // Delay
      const delay = (time: number)=>new Promise<void>((res)=>setTimeout(()=>res(), time))
      await delay(duration + 100)
    },
    async awardMedal(param: any[]) {
      // Get params
      const teamInfo = param[0] as TeamInfo
      const medal = param[1] as string

      // Set podium
      this.podiumTeam = teamInfo
      this.podiumMedal = medal
      this.podiumShow = true

      // Wait for mouse
      await new Promise<void>((res)=>{
        const dbc = ()=>{
          document.removeEventListener('dblclick', dbc)
          res()
        }

        document.addEventListener('dblclick', dbc)
      })

      // Hide podium
      this.podiumShow = false

      // Delay
      const delay = (time: number)=>new Promise<void>((res)=>setTimeout(()=>res(), time))
      await delay(600)
    },
    async awardList(param: any[]) {
      // Get params
      const medal = param[0] as string
      const list = param[1] as TeamInfo[]

      // Set podium
      this.podiumList = list
      this.podiumMedal = medal
      this.podiumListShow = true

      // Wait for mouse
      await new Promise<void>((res)=>{
        const dbc = ()=>{
          document.removeEventListener('dblclick', dbc)
          res()
        }

        document.addEventListener('dblclick', dbc)
      })

      // Hide podium
      this.podiumListShow = false

      // Delay
      const delay = (time: number)=>new Promise<void>((res)=>setTimeout(()=>res(), time))
      await delay(600)
    }
  },
  persist: {
    paths: [
      'remoteParams',
      'idList', 'name', 'startTime', 'endTime', 'frozenTime', 'goldCount', 'silverCount', 'bronzeCount', 'mode', 'schoolOptions',
      'teamFilter', 'schoolFilter',
      'contestIdList', 'contestInfos', 'problemIdList', 'lastPrefetchTime', 'prefetchDone',
      'workflow', 'initRank', 'lastPreprocessTime'
    ]
  }
})