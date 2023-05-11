<template>
  <!-- Background -->
  <div class="bg-slate-900 fixed inset-0 -z-50"></div>

  <!-- Podium -->
  <AqPodium/>

  <!-- Podium list -->
  <AqPodiunList/>

  <!-- Main -->
  <main class="flex flex-col items-center select-none text-white w-full z-0">
    <!-- Title -->
    <h1 class="font-bold mt-12 text-4xl">{{ main.name }}</h1>
    <p class="mt-4">{{ main.timeSpan }}</p>

    <!-- Rank -->
    <TransitionGroup class="mt-8 w-full" moveClass="row-move" name="list" tag="div">
      <AqTeamRow
        v-for="i in main.rank"
        class="even:bg-blue-950 odd:bg-blue-900"
        :key="i.teamKey"
        :name="i.name"
        :penalty="i.penalty"
        :rank="i.rank"
        :school="i.school"
        :solved="i.solved"
        :status="i.status"
        :team-key="i.teamKey"
      />
    </TransitionGroup>
  </main>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useResolverStore } from '../stores/resolver'
import _ from 'lodash'

// Components
import AqPodium from '../components/AqPodium.vue'
import AqPodiunList from '../components/AqPodiunList.vue'
import AqTeamRow from '../components/AqTeamRow.vue'

// I18n
const { t } = useI18n()

// Ruoter
const router = useRouter()

// Stores
const main = useResolverStore()

// Actions
const onKeyUp = async (e: KeyboardEvent)=>{
  switch (e.code) {
    case 'Escape':
      if (main.resolveStart)
        break
      router.push('/res')
      break
    case 'Enter':
      main.resolve()
      break
    case 'Minus':
      main.speed = Math.min(main.speed + 0.2, 4)
      break
    case 'Equal':
      main.speed = Math.max(0.2, main.speed - 0.1)
      break
  }
}

// Life cycle
onMounted(()=>{
  // If no workflow
  if (main.workflow === null) {
    router.push('/res')
  }

  // Reset resolve system
  main.$patch({
    rank: _.cloneDeep(main.initRank),
    speed: 1,
    focusTeam: '',
    focusProblem: -1,
    resolveStart: false,
    podiumTeam: null,
    podiumMedal: '',
    podiumShow: false,
    manualMode: false,
    res0: null
  })

  // Set DOM
  document.title = t('index.resolver')
  document.addEventListener('keyup', onKeyUp)
  scrollTo(0, 0)
})
onUnmounted(()=>{
  // Clean up DOM
  document.removeEventListener('keyup', onKeyUp)
  document.body.style.overflowY = ''
  onbeforeunload = null
})
</script>