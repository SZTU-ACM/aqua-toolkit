<script setup>
import { computed } from 'vue'
import { useResolverStore } from '../stores/resolver'

// Stores
const main = useResolverStore()

// Computed
const medalImgSrc = computed(()=>{
  if (main.podiumTeam === null)
    return ''

  if (main.podiumTeam.rank === 1)
    return '/toolkit/v1/imgs/champion.svg'
  else if (main.podiumTeam.rank <= main.goldNum)
    return '/toolkit/v1/imgs/gold.svg'
  else if (main.podiumTeam.rank <= main.goldNum + main.silverNum)
    return '/toolkit/v1/imgs/silver.svg'
  else if (main.podiumTeam.rank <= main.goldNum + main.silverNum + main.bronzeNum)
    return '/toolkit/v1/imgs/bronze.svg'
  else
    return ''
})
const medalNameText = computed(()=>{
  if (main.podiumTeam === null)
    return ''

  if (main.podiumTeam.rank === 1)
    return 'Champion'
  else if (main.podiumTeam.rank <= main.goldNum)
    return 'Gold'
  else if (main.podiumTeam.rank <= main.goldNum + main.silverNum)
    return 'Silver'
  else if (main.podiumTeam.rank <= main.goldNum + main.silverNum + main.bronzeNum)
    return 'Bronze'
  else
    return ''
})
const medalNameClass = computed(()=>{
  if (main.podiumTeam === null)
    return []

  if (main.podiumTeam.rank === 1)
    return ['text-orange-500']
  else if (main.podiumTeam.rank <= main.goldNum)
    return ['text-amber-400']
  else if (main.podiumTeam.rank <= main.goldNum + main.silverNum)
    return ['text-zinc-300']
  else if (main.podiumTeam.rank <= main.goldNum + main.silverNum + main.bronzeNum)
    return ['text-yellow-500']
  else
    return []
})
</script>

<template>
  <!-- Wrapper -->
  <Transition @after-leave="main.resume">
    <div
      v-show="main.podiumTeam !== null && !main.podiumTeam.done"
      class="backdrop-brightness-50 fixed flex inset-0 items-center justify-center z-50"
      @click="main.podiumTeam.done = true"
    >
      <!-- Card -->
      <div class="bg-blue-500 flex items-center p-8 rounded-lg">
        <!-- Medal image -->
        <img class="block h-24 mr-4 w-24" :src="medalImgSrc"/>

        <!-- Card text -->
        <div class="flex flex-col items-center text-white">
          <h1 class="font-bold mb-4 text-4xl" :class="medalNameClass">{{ medalNameText }}</h1>
          <h2 class="text-3xl">{{ main.podiumTeam === null ? '' : main.podiumTeam.name }}</h2>
          <h3 class="text-xl">{{ main.podiumTeam === null ? '' : main.podiumTeam.member }}</h3>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="postcss" scoped>
.v-enter-active,
.v-leave-active {
  @apply transition-opacity
}

.v-enter-from,
.v-leave-to {
  @apply opacity-0
}
</style>
