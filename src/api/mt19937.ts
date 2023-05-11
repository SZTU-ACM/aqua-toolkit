/* MT19937 pseudorandom number generator */

class MT19937 {
  #state: bigint[] = []
  #index: number = 0

  constructor(seed: number) {
    this.#state[0] = BigInt(seed)
    for (let i = 1; i < 624; ++i) {
      this.#state[i] = (0x6C078965n * (this.#state[i - 1] ^ (this.#state[i - 1] >> 30n)) + BigInt(i)) & 0xFFFFFFFFn
    }
  }

  #twist() {
    for (let i = 0; i < 624; ++i) {
      const y = (this.#state[i] & 0x80000000n) | (this.#state[(i + 1) % 624] & 0x7FFFFFFFn)
      this.#state[i] = (y >> 1n) ^ this.#state[(i + 397) % 624]

      if (y % 2n !== 0n) {
        this.#state[i] ^= 0x9908B0DFn
      }
    }
  }

  nextInt() {
    if (this.#index === 0)
      this.#twist()

    let y = this.#state[this.#index]
    y ^= y >> 11n
    y ^= (y << 7n) & 0x9D2C5680n
    y ^= (y << 15n) & 0xEFC60000n
    y ^= (y >> 18n)

    this.#index = (this.#index + 1) % 624
    return Number(y & 0xFFFFFFFFn)
  }

  nextFloat() {
    return this.nextInt() / 0xFFFFFFFF
  }

  nextRngInt(mn: number, mx: number) {
    return Math.floor(this.nextFloat() * (mx - mn)) + mn
  }

  nextRngFloat(mn: number, mx: number) {
    return this.nextFloat() * (mx - mn) + mn
  }
}

// Export
export { MT19937 }