<script setup>
import { computed, ref, watch } from 'vue'
import { useResolverStore } from '../stores/resolver'

// Components
import TeamStatus from './TeamStatus.vue'

// Properties
const props = defineProps({
  rank: Number,
  teamKey: String,
  name: String,
  school:String,
  solved: Number,
  penalty: Number,
  status: Array
});

// Stores
const main = useResolverStore()

// Reactive
const element = ref(null)
const dynClass = ref(['border-l-0'])

// Computed
const gridColStyle = computed(()=>({
  gridTemplateColumns: `repeat(${props.status.length}, 1fr)`
}))
const medalImgSrc = computed(()=>{
  if (props.solved === 0)
    return ''

  if (props.rank === 1)
    return '/toolkit/v1/imgs/champion.svg'
  else if (props.rank <= main.goldNum)
    return '/toolkit/v1/imgs/gold.svg'
  else if (props.rank <= main.goldNum + main.silverNum)
    return '/toolkit/v1/imgs/silver.svg'
  else if (props.rank <= main.goldNum + main.silverNum + main.bronzeNum)
    return '/toolkit/v1/imgs/bronze.svg'
  else
    return ''
})

// Actions
const scrollToElement = (callback)=>{
  const startY = scrollY
  const diff = element.value.getBoundingClientRect().top - innerHeight + element.value.getBoundingClientRect().height
  const duration = 500 * main.speed
  const easeFn = (x)=>x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2

  let start = null
  const step = (tms)=>{
    if (start === null)
      start = tms

    const elapse = tms - start
    const easePct = easeFn(Math.min(elapse / duration, 1))

    scrollTo(0, startY + diff * easePct)
    if (elapse < duration)
      requestAnimationFrame(step)
    else if (typeof callback === 'function')
      callback()
  }

  requestAnimationFrame(step)
}

// Watch
watch(
  ()=>main.focusTeam,
  ()=>{
    if (main.focusTeam === props.teamKey) {
      dynClass.value = ['bg-purple-500']
      scrollToElement()
    } else
      dynClass.value = ['']
  }
)
</script>

<template>
  <div 
    class="border-green-400 flex items-center py-4 relative transition-all"
    :class="dynClass"
    ref="element"
  >
    <!-- Medal -->
    <img
      v-if="rank !== -1 && rank <= main.goldNum + main.silverNum + main.bronzeNum && solved > 0"
      class="absolute h-8 left-0 top-0 w-8"
      draggable="false"
      :src="medalImgSrc"
    />

    <!-- Rank # -->
    <div class="font-bold text-center text-white w-24">
      {{ rank === -1 ? '*' : `#${rank}` }}
    </div>

    <div class="flex flex-col flex-grow">
      <!-- Team info -->
      <div class="flex justify-between text-white">
        <!-- Name & school -->
        <div class="flex w-1/2">
          <div class="font-bold w-1/2">{{ name }}</div>
          <div>{{ school }}</div>
        </div>

        <!-- Solved & penalty -->
        <div class="flex flex-grow justify-end text-center">
          <div class="w-1/4">{{ solved }}</div>
          <div class="w-1/4">{{ Math.round(penalty / 60000) }}</div>
        </div>
      </div>

      <!-- Status list -->
      <div class="flex-grow grid" :style="gridColStyle">
        <TeamStatus
          v-for="i in status"
          :key="i.id"
          :result="i.result"
          :tries="i.tries"
          :frozen-tries="i.frozenTries"
          :penalty="i.penalty"
        />
      </div>
    </div>
  </div>
</template>
