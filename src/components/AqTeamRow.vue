<template>
  <div class="flex items-center py-4 relative w-full" :class="bgClass" ref="el">
    <!-- Medal -->
    <template v-if="rank === -1"/>
    <img v-else-if="rank === 1" class="absolute h-8 left-1 top-1 w-8" draggable="false" src="/imgs/champion.svg"/>
    <img v-else-if="rank as number <= main.goldCount" class="absolute h-8 left-1 top-1 w-8" draggable="false" src="/imgs/gold.svg"/>
    <img v-else-if="rank as number <= main.goldCount + main.silverCount" class="absolute h-8 left-1 top-1 w-8" draggable="false" src="/imgs/silver.svg"/>
    <img v-else-if="rank as number <= main.goldCount + main.silverCount + main.bronzeCount" class="absolute h-8 left-1 top-1 w-8" draggable="false" src="/imgs/bronze.svg"/>

    <!-- Rank -->
    <div class="font-bold text-center w-20">{{ rank === -1 ? '*' : `#${rank}` }}</div>

    <!-- Wrapper -->
    <div class="flex flex-col flex-grow">
      <!-- Info -->
      <div class="flex items-center justify-between">
        <div class="flex items-center w-1/2">
          <div class="font-bold w-1/2">{{ name }}</div>
          <div class="w-1/2">{{ school }}</div>
        </div>
        <div class="flex items-center text-center w-1/4">
          <div class="font-bold w-1/2">{{ solved }}</div>
          <div class="w-1/2">{{ Math.floor(penalty as number / 60000) }}</div>
        </div>
      </div>

      <!-- Wrapper -->
      <div class="grid py-2" :style="gridStyle">
        <AqStatusTag
          v-for="(i, idx) in (status as ProblemStatus[])"
          :frozen-tries="i.frozenTries"
          :key="idx"
          :penalty="i.penalty"
          :status="main.focusTeam === teamKey && main.focusProblem === idx ? 'pending' : i.status"
          :tries="i.tries"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, Ref } from 'vue'
import { useResolverStore, ProblemStatus } from '../stores/resolver'

// Components
import AqStatusTag from './AqStatusTag.vue'

// Properties
const props = defineProps({
  teamKey: String,
  rank: Number,
  name: String,
  school: String,
  solved: Number,
  penalty: Number,
  status: Array
})

// Stores
const main = useResolverStore()

// Reactive
const el: Ref<null | Element> = ref(null)

// Computed
const bgClass = computed(()=>main.focusTeam === props.teamKey ? ['!bg-purple-500', 'z-30'] : '')
const gridStyle = computed(()=>({
  gridTemplateColumns: `repeat(${main.problemIdList.length}, 1fr)`
}))

// Watch
watch(()=>main.focusTeam, async (x)=>{
  if (x !== props.teamKey) {
    return
  }

  const duration = 1000 * main.speed
  const startY = scrollY
  const target = (el.value as Element).getBoundingClientRect().bottom - document.documentElement.clientHeight
  const easeQuadInOut = (t: number)=>t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1
  let start = -1

  const step = async (timestamp: number)=>{
    if (start === -1) {
      start = timestamp
    }

    const elapse = timestamp - start
    const pct = easeQuadInOut(Math.min(elapse / duration, 1))
    scrollTo(0, startY + pct * target)

    if (elapse < duration) {
      requestAnimationFrame(step)
    } else {
      (main.res0 as Function)()
    }
  }
  requestAnimationFrame(step)
})
</script>