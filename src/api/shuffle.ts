/* Random shuffle module */
import { MT19937 } from './mt19937'
import _ from 'lodash'

// Shuffle all (Fisher-Yates shuffle)
const shuffle = (seed: number, arr: any[])=>{
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

// Select one
class SelectOne {
  seed: number
  arr: any[]
  acc: number = 0

  constructor(seed: number, arr: any[]) {
    this.seed = seed
    this.arr = _.cloneDeep(arr)
  }

  select() {
    // Shuffle & accumulate
    shuffle(this.seed, this.arr)
    this.acc++

    return [this.acc, this.arr.pop()]
  }
}

// Export
export { shuffle, SelectOne }