<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import _ from 'lodash'

// Components
import StatusTagVue from './StatusTag.vue'

// Properties
const props = defineProps({
  k: String,
  rank: Number,
  name: String,
  school: String,
  solved: Number,
  penalty: Number,
  change: String,
  status: Array
})

// Reactive
const element = ref(null)
const shadowClass = ref([])

// Computed
const gridColStyle = computed(()=>({
  gridTemplateColumns: `repeat(${props.status.length}, 1fr)`
}))

// Asynchronize function
const resetShadow = ()=>{
  setTimeout(()=>{
    shadowClass.value = []
  }, 2000)
}

// Actions
const setShadow = ()=>{
  switch (props.change) {
    case 'up':
      shadowClass.value = ['up']
      resetShadow()
      break
    case 'down':
      shadowClass.value = ['down']
      resetShadow()
      break
    default:
      shadowClass.value = []
  }
}

// Watch
watch(()=>props.rank, setShadow)

// Live cycle
onMounted(setShadow)
</script>

<template>
  <div 
    class="bg-gray-700 duration-300 flex items-center m-4 p-4 relative rounded-md transition-shadow print:break-inside-avoid"
    :class="shadowClass"
    ref="element"
  >
    <!-- Focus light -->
    <template v-if="false">
      <div class="ping-dot animate-ping"></div>
      <div class="ping-dot"></div>
    </template>

    <!-- Rank & user info -->
    <div class="flex items-center w-1/6">
      <div class="font-bold font-mono text-zinc-100 w-1/3">{{ rank === -1 ? '*' : `#${rank}` }}</div>
      <div class="flex flex-col text-center text-white w-2/3">
        <div class="font-bold">{{ name }}</div>
        <div class="text-sm text-gray-400">{{ school }}</div>
      </div>
    </div>

    <!-- Status tags -->
    <div class="grid select-none w-2/3" :style="gridColStyle">
      <status-tag-vue 
        v-for="i in status" 
        :key="i.id" 
        :result="i.result"
        :tries="i.tries"
        :penalty="i.penalty"
        :frozen-tries="i.frozenTries"
      />
    </div>

    <!-- Total solved & penalty -->
    <div class="font-bold text-center text-white w-1/12">{{ solved }}</div>
    <div class="font-bold text-center text-white w-1/12">{{ Math.floor(penalty / 60000) }}</div>
  </div>
</template>

<style lang="postcss" scoped>
.down {
  @apply shadow-md shadow-red-400
}

.up {
  @apply shadow-md shadow-green-400
}

.ping-dot {
  @apply absolute bg-green-400 h-3 left-2 rounded-full top-2 w-3
}
</style>
