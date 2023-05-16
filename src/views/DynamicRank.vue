<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContestStore } from '../stores/contest'
import { useRemoteStore } from '../stores/remote'
import cruise from '../api/cruise'

// Components
import CompetitorRowVue from '../components/CompetitorRow.vue'

// Router
const router = useRouter()
const route = useRoute()

// Stores
const contest = useContestStore()

// Reactive
const exception = ref(null)

// Computed
const gridColStyle = computed(()=>{
  if (contest.problems === null)
    return {}
  return {
    gridTemplateColumns: `repeat(${contest.problems.length}, 1fr)`
  }
})

// Functions
const onKeyUp = async (e)=>{
  switch (e.code) {
    case 'Escape':
      router.push('/')
      break
    case 'KeyE':
      router.push('/dynamic-rank-settings')
      break
    case 'KeyC':
      cruise.toggle()
      break
    case 'KeyV':
      cruise.toggleMode()
      break
    case 'KeyF': {
      contest.rank = null
      const res = await contest.startLoop(true)
      if (res.code !== 0)
        exception.value = res.msg
      break
    }
  }
}

// Life cycle
onMounted(async ()=>{
  document.addEventListener('keyup', onKeyUp)
  document.body.style.minWidth = '1900px'
 
  if (route.query.idls !== undefined) {
    const remote = useRemoteStore()
    remote.skipLogin = true
    remote.apiUrl = route.query.api ?? '/'

    contest.contestList = decodeURI(route.query.idls)
    await contest.init()
    contest.rank = null

    const res = await contest.startLoop(true, route.query.oneshot === '1' ? true : false)
    if (route.query.title !== undefined)
      contest.title = decodeURI(route.query.title)
    if (res.code !== 0)
      exception.value = res.msg
  }
})
onBeforeUnmount(()=>{
  document.removeEventListener('keyup', onKeyUp)
  document.body.style.minWidth = ''
})
</script>

<template>
  <!-- Settings -->
  <div class="absolute p-4 top-0 left-0">
    <RouterLink to="/dynamic-rank-settings" class="hover:text-red-500">
      » Settings «
    </RouterLink>
  </div>

  <!-- Title -->
  <div class="my-10">
    <div class="font-bold text-3xl text-center text-white">{{ contest.title }}</div>
    <div class="font-mono my-4 text-center text-white">{{ contest.startTime }} ~ {{ contest.endTime }}</div>
  </div>

  <!-- Header -->
  <a id="rank-top"/>
  <header class="bg-gray-800 flex items-center px-8 py-4 sticky top-0 z-10 print:relative">
    <div class="flex w-1/6">
      <div class="font-bold text-white w-1/3">Rank</div>
      <div class="font-bold text-center text-white w-2/3">Competitor</div>
    </div>
    <div class="font-bold text-center grid text-white w-2/3" :style="gridColStyle">
      <div v-for="(__, idx) in contest.problems">
        {{ String.fromCharCode(idx + 'A'.charCodeAt(0)) }}
      </div>
    </div>
    <div class="font-bold text-center text-white w-1/12">Solved</div>
    <div class="font-bold text-center text-white w-1/12">Penalty</div>
  </header>

  <!-- Competitors -->
  <transition-group v-if="contest.filteredRank !== null" name="competitors">
    <competitor-row-vue
      v-for="(i, idx) in contest.filteredRank"
      :class="[idx % 2 === 0 ? '' : 'bg-gray-800']"
      :key="i.id"
      :k="i.id"
      :rank="i.rank"
      :name="i.name"
      :school="i.school"
      :solved="i.solved"
      :penalty="i.penalty"
      :change="i.change"
      :status="i.status"
    />
  </transition-group>
  <div v-else-if="exception === null" class="msg">
    <div class="spin"/>
    <div>Loading</div>
  </div>
  <div v-else class="warn">[Error] {{ exception }}</div>
</template>

<style lang="postcss" scoped>
.competitors-move,
.competitors-enter-active,
.competitors-leave-active {
  transition: all 1s ease;
}

.competitors-enter-from,
.competitors-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.competitors-leave-active {
  position: absolute;
}

.msg {
  @apply flex font-bold items-center justify-center 
          my-20 text-3xl text-center text-white
}

.warn {
  @apply flex font-bold items-center justify-center 
          my-20 text-3xl text-center text-red-500
}

.spin {
  @apply animate-spin border-4 border-b-white border-l-white 
          border-r-white border-t-transparent h-8 mx-8 rounded-full text-3xl w-8
}
</style>
