/* Random shuffle module */
import { MT19937 } from './mt19937'
import _ from 'lodash'

// Shuffle all (Fisher-Yates shuffle)
export const shuffle = (seed: number, arr: any[]): void=>{
  const rnd = new MT19937(seed)

  for (let i = arr.length - 1; i > 0; --i) {
    // Get pseudorandom integer in range [0, i]:
    //
    // nextRngInt(a, b) => Math.floor(nextFloat() * (b - a)) + a
    // nextFloat() => nextInt() / 0xFFFFFFFF
    //
    const j = rnd.nextRngInt(0, i + 1)

    // Swap arr[i], arr[j]
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
}

// School spread
export const spread = (arr: { id: string, room: string, school: string }[]): void=>{
  const tmp = arr.map((x, y)=>({ idx: y, id: x.id, school: x.school }))
  tmp.sort((a, b)=>a.id < b.id ? -1 : 1)

  for (let i = 1; i < tmp.length; ++i) {
    if (tmp[i].school === tmp[i - 1].school) {
      for (let j = 1; (i + j) % tmp.length !== i; ++j) {
        if (tmp[i].school !== tmp[(i + j) % tmp.length].school && 
            tmp[i].school !== tmp[(i + j + 1) % tmp.length].school && 
            tmp[i].school !== tmp[(i + j + 2) % tmp.length].school
        ) {
          let t: any = arr[tmp[i].idx]
          arr[tmp[i].idx] = arr[tmp[(i + j + 1) % tmp.length].idx]
          arr[tmp[(i + j + 1) % tmp.length].idx] = t

          t = tmp[i]
          tmp[i] = tmp[(i + j + 1) % tmp.length]
          tmp[(i + j + 1) % tmp.length] = tmp[i]
          break
        }
      }
    }
  }
}

// Select one
export class SelectOne {
  seed: number
  arr: any[]
  acc: number = 0

  constructor(seed: number, arr: any[]) {
    this.seed = seed
    this.arr = _.cloneDeep(arr)
  }

  select(): [number, any] {
    // Shuffle & accumulate
    shuffle(this.seed, this.arr)
    this.acc++

    return [this.acc, this.arr.pop()]
  }
}