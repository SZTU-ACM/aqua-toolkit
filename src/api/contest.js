/* Contest */
import _ from 'lodash'
import { useRemoteStore } from '../stores/remote'
import { useContestStore } from '../stores/contest'

class Contest {
  // Singleton
  static #__instance__ = null
  static getInstance() {
    if (Contest.#__instance__ === null)
      Contest.#__instance__ = new Contest()

    return Contest.#__instance__
  }

  title = null
  startTime = null
  endTime = null
  contestMap = null
  problemList = null
  teamMap = null
  lastUpdate = 0
  teamStatusMap = new Map()
  firstBloodList = new Set()
  rank = []
  lastRank = new Map()
  waitingQueue = []
  lastSolutionId = new Set()

  async init(contestIdList) {
    const remote = useRemoteStore()

    this.title = null
    this.startTime = null
    this.endTime = null
    this.frozenTime = null
    this.contestMap = null
    this.problemList = null
    this.teamMap = null
    this.lastUpdate = 0
    this.teamStatusMap = new Map()
    this.firstBloodList = new Set()

    this.rank = []
    this.lastUpdate = new Map()
    this.waitingQueue = []

    let res = await remote.fetchContestList(contestIdList)
    if (res.code < 0)
      return res
    res = res.data

    let tmp = _.xor([...res.keys()], contestIdList)
    if (tmp.length !== 0)
      return { code: -1, msg: 'Contest not available: ' + tmp.join(', ') }

    try {
      const base = res.get(contestIdList[0])
      res.forEach((v, k)=>{
        if (v.start_time !== base.start_time || v.end_time !== base.end_time)
          throw 'Contest start/end time different: ' + k
      })
    } catch (msg) {
      return { code: -1, msg }
    }

    this.title = res.get(contestIdList[0]).title
    this.startTime = res.get(contestIdList[0]).start_time
    this.endTime = res.get(contestIdList[0]).end_time
    this.frozenTime = res.get(contestIdList[0]).frozen_time
    this.contestMap = res

    res = await remote.fetchProblemList(contestIdList)
    if (res.code < 0)
      return res
    res = res.data

    try {
      const base = res.get(contestIdList[0])
      res.forEach((v, k)=>{
        if (_.xorBy(base, v, (x)=>x.problem_id).length !== 0)
          throw 'Contest problem different: ' + k
      })
    } catch (msg) {
      return { code: -1, msg }
    }

    this.problemList = res.get(contestIdList[0])

    res = await remote.fetchTeamList(contestIdList)
    if (res.code < 0)
      return res
    this.teamMap = res.data

    return { code: 0 }
  }

  async update(all, timeAfter, timeBefore) {
    const remote = useRemoteStore()
    const contest = useContestStore()
 
    // Check if fully refresh
    if (all === true) {
      this.lastUpdate = 0
      this.teamStatusMap.clear()
      this.waitingQueue = []
      this.firstBloodList.clear()
    }

    // Check contest list
    if (this.contestMap === null)
      return { code: -1, msg: 'Contest not initialized' }

    // Get pending solutions
    let tmp = []
    while (this.waitingQueue.length > 0 && this.waitingQueue[0].scheduleTime <= new Date().getTime()) {
      tmp.push(this.waitingQueue.shift())
    }

    // Fetch penging solutions
    if (tmp.length !== 0) {
      // Generate query map
      tmp = _.reduce(tmp, (map, v)=>{
        if (!map.has(v.contestId))
          map.set(v.contestId, [])
        map.get(v.contestId).push(v.solutionId)
        return map
      }, new Map())

      // Fetch wait
      const res = await remote.fetchSolutionListByIds(tmp)
      if (res.code !== 0)
        return res
      tmp = res.data

      // Add pendings back to queue, random schedule (5s ~ 25s)
      tmp.filter((v)=>[0, 1, 2, 3].includes(v.result)).forEach((v)=>{
        this.waitingQueue.push({
          contestId: v.contest_id,
          solutionId: v.solution_id,
          scheduleTime: new Date().getTime() + 5000 + Math.random() * 20000
        })
      })
    }

    // Fetch timeline solutions
    const newUpdateTime = new Date().getTime()
    let res = await remote.fetchSolutionListByContests(
      [...this.contestMap.keys()], 
      timeAfter ?? new Date(this.lastUpdate),
      timeBefore
    )
    if (res.code !== 0)
      return res
    res = res.data.filter((v)=>!this.lastSolutionId.has(v.solution_id))
    this.lastSolutionId = new Set(res.map((v)=>v.solution_id))
    if (tmp.length !== 0) {
      res.push(...tmp)
      res.sort((a, b)=>a.in_date - b.in_date)
    }

    // Update team status
    res.forEach((v)=>{
      const teamKey = v.team_id + '@' + v.contest_id

      // Check team status existance
      if (!this.teamStatusMap.has(teamKey)) {
        const tmp = []
        for (let i = 0; i < this.problemList.length; ++i)
          tmp.push({
            id: i,
            result: 'none',
            tries: 0,
            penalty: 0,
            frozenTries: 0
          })
        this.teamStatusMap.set(teamKey, tmp)
      }

      const problemIdx = this.problemList.findIndex((p)=>p.problem_id === v.problem_id)
      const current = this.teamStatusMap.get(teamKey)[problemIdx]

      if (problemIdx === -1)
        return

      // Update status
      switch (v.result) {
        case 4:   // AC
          if (['first_blood', 'accepted'].includes(current.result))
            break

          if (current.result !== 'pending')
            current.tries++

          current.penalty += v.in_date - (timeAfter ?? new Date(this.startTime)).getTime()
 
          if (!this.firstBloodList.has(v.problem_id)) {
            current.result = 'first_blood'
            this.firstBloodList.add(v.problem_id)
          } else {
            current.result = 'accepted'
          }
          
          contest.focusKey = teamKey

          break
        case -1: // Frozen
          if (['first_blood', 'accepted'].includes(current.result))
            break

          current.result = 'frozen'
          current.frozenTries++
          break
        case 5:   // PE
        case 6:   // WA
        case 7:   // TLE
        case 8:   // MLE
        case 9:   // OLE
        case 10:  // RE
          if (['first_blood', 'accepted'].includes(current.result))
            break

          if (current.result !== 'pending')
            current.tries++

          current.result = 'wrong_answer'
          current.penalty += 1200000
          break
        case 11:  // CE
          if (['first_blood', 'accepted'].includes(current.result))
            break

          if (current.result !== 'pending')
            current.tries++

          current.result = 'wrong_answer'
          break
        case 13:  // Tested
        case 100: // Unknown
          break
        case 0:   // Pending
        case 1:   // Pending Rejudging
        case 2:   // Compiling
        case 3:   // Running Rejudging
          if (['first_blood', 'accepted', 'pending'].includes(current.result))
            break

          current.result = 'pending'
          current.tries++
          this.waitingQueue.push({
            contestId: v.contest_id,
            solutionId: v.solution_id,
            scheduleTime: new Date().getTime() + 5000
          })
          break
      }
    })

    // Generate basic rank
    const ret = []
    this.teamStatusMap.forEach((v, k)=>{
      let solved = 0, penalty = 0
      v.filter((t)=>['first_blood', 'accepted'].includes(t.result)).forEach((t)=>{
        solved++
        penalty += t.penalty
      })
      ret.push({
        id: k,
        team_id: this.teamMap.get(k).team_id,
        school: this.teamMap.get(k).school,
        name: this.teamMap.get(k).name,
        solved,
        penalty,
        status: v,
        tkind: this.teamMap.get(k).tkind
      })
    })

    // Sort rank
    ret.sort((a, b)=>{
      if (a.solved === b.solved) {
        if (a.penalty === b.penalty) {
          return a.name < b.name ? -1 : 1
        } else {
          return a.penalty - b.penalty
        }
      } else {
        return b.solved - a.solved
      }
    })

    // Assign rank value
    const newRank = new Map()
    let lstrnk = 0, lsttm = -1
    ret.forEach((value, index, self)=>{
      if (value.tkind === 2) {
        self[index].rank = -1
        return
      }

      if (lstrnk === 0) {
        self[index].rank = 1
        newRank.set(value.id, 1)
        lsttm = index
        lstrnk = 1
        return
      }

      if (value.solved === self[lsttm].solved && value.penalty === self[lsttm].penalty) {
        self[index].rank = self[lsttm].rank
        newRank.set(value.id, self[lsttm].rank)
      } else {
        self[index].rank = lstrnk + 1
        newRank.set(value.id, lstrnk + 1)
      }
      lsttm = index
      ++lstrnk
    })

    // Assign rank change
    ret.forEach((v, i, self)=>{
      if (!this.lastRank.has(v.id))
        self[i].change = 'up'
      else if (v.rank < this.lastRank.get(v.id))
        self[i].change = 'up'
      else if (v.rank > this.lastRank.get(v.id))
        self[i].change = 'down'
    })

    // Update
    this.rank = ret
    this.lastRank = newRank
    this.lastUpdate = newUpdateTime

    return { code: 0 }
  }
}

export { Contest }
