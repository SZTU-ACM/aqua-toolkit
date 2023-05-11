<template>
  <!-- Wrapper -->
  <Transition>
    <div v-show="main.podiumShow" class="backdrop-brightness-50 fixed flex inset-0 items-center justify-center select-none z-50">
      <div class="bg-blue-500 flex items-center p-8 rounded-xl">
        <!-- Medal -->
        <img v-if="main.podiumMedal === 'champion'" class="h-24 w-24" src="/imgs/champion.svg"/>
        <img v-else-if="main.podiumMedal === 'gold'" class="h-24 w-24" src="/imgs/gold.svg"/>
        <img v-else-if="main.podiumMedal === 'silver'" class="h-24 w-24" src="/imgs/silver.svg"/>
        <img v-else class="h-24 w-24" src="/imgs/bronze.svg"/>

        <!-- Info -->
        <div class="flex flex-col items-center ml-4">
          <h1 class="font-bold text-4xl" :class="medalColor">{{ t(`resolver.${main.podiumMedal}`) }}</h1>
          <h2 class="font-bold mt-4 text-white text-3xl">{{ main.podiumTeam ? main.podiumTeam.name : '' }}</h2>
          <h3 class="text-white text-xl">{{ main.podiumTeam ? main.podiumTeam.members : '' }}</h3>
          <h4 class="italic mt-2 text-white">{{ main.podiumTeam ? main.podiumTeam.school : '' }}</h4>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useResolverStore } from '../stores/resolver'

// I18n
const { t } = useI18n()

// Stores
const main = useResolverStore()

// Computed
const medalColor = computed(()=>{
  switch (main.podiumMedal) {
    case 'champion':
      return 'text-red-500'
    case 'gold':
      return 'text-amber-400'
    case 'silver':
      return 'text-neutral-300'
    case 'bronze':
      return 'text-yellow-600'
  }
})
</script>

<style lang="postcss" scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity .25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>