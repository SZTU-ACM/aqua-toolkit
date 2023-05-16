<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResolverStore } from '../stores/resolver'

// Components
import TeamPodium from '../components/TeamPodium.vue'
import TeamRow from '../components/TeamRow.vue'

// Router
const router = useRouter()

// Stores
const main = useResolverStore()

// Actions
const scrollToButtom = (callback)=>{
  const startY = scrollY
  const diff = document.documentElement.scrollHeight - innerHeight
  const duration = 5000
  const easeFn = (x)=>x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2

  let start = null
  const step = (tms)=>{
    if (start === null)
      start = tms

    const elapse = tms - start
    const percent = Math.min(elapse / duration, 1)
    const easePct = easeFn(percent, 0, 1, 1)

    scrollTo(0, startY + diff * easePct)
    if (elapse < duration)
      requestAnimationFrame(step)
    else if (typeof callback === 'function')
      callback()
  }

  requestAnimationFrame(step)
}
const onKeyUp = (e)=>{
  switch (e.code) {
    case 'Escape':
      router.push('/')
      break
    case 'Minus':
      main.addSpeed(0.2)
      break
    case 'Equal':
      main.addSpeed(-0.2)
      break
    case 'KeyE':
      main.resume()
      break
    case 'Digit0':
      main.speed = 1.5
      break
    case 'Enter':
      if (main.stop === false)
        return

      new Promise((resolve)=>{
        scrollToButtom(resolve)
      }).then(main.startResolve)
      break
  }
}
const setTransitionDuration = (el)=>{
  el.style.transitionDuration = (1000 * main.speed) + 'ms'
}

// Life cycle
onMounted(()=>{
  if (main.rank === null)
    router.push('/')

  scrollTo(0, 0)

  document.body.classList.add('hide-scrollbar')
  document.addEventListener('keyup', onKeyUp)
  window.onbeforeunload = (e)=>{
    e.priventDefault()
    e.returnvalue = ''
    return 'Sure to quit?'
  }
})
onUnmounted(()=>{
  document.body.classList.remove('hide-scrollbar')
  document.removeEventListener('keyup', onKeyUp)
  window.onbeforeunload = null
})
</script>

<template>
  <div @click="main.resume">
    <!-- Podium -->
    <TeamPodium/>

    <!-- Header -->
    <header class="flex flex-col items-center py-12 text-white">
      <h1 class="font-bold mb-4 text-3xl">{{ main.contestName }}</h1>
      <p>{{ main.startTime }} ~ {{ main.endTime }}</p>
    </header>

    <!-- Rank -->
    <TransitionGroup name="list" @before-enter="setTransitionDuration">
      <TeamRow
        v-for="(i, idx) in main.rank"
        :key="i.teamKey"
        :team-key="i.teamKey"
        :rank="i.rank"
        :name="i.name"
        :school="i.school"
        :solved="i.solved"
        :penalty="i.penalty"
        :status="i.status"
        :class="{'bg-blue-900': idx % 2 === 0, 'bg-blue-950': idx % 2 === 1}"
      />
    </TransitionGroup>
  </div>
</template>

<style lang="postcss" scoped>
.list-move {
  @apply transition-all z-50
}
</style>
