<template>
  <!-- Wrapper -->
  <Transition>
    <div v-show="main.podiumListShow" class="backdrop-brightness-50 fixed flex inset-0 items-center justify-center select-none z-50">
      <div class="bg-blue-500 flex items-center p-8 rounded-xl w-2/3">
        <div class="flex flex-col items-center">
          <!-- Medal -->
          <img v-if="main.podiumMedal === 'champion'" class="h-24 w-24" src="/imgs/champion.svg"/>
          <img v-else-if="main.podiumMedal === 'gold'" class="h-24 w-24" src="/imgs/gold.svg"/>
          <img v-else-if="main.podiumMedal === 'silver'" class="h-24 w-24" src="/imgs/silver.svg"/>
          <img v-else class="h-24 w-24" src="/imgs/bronze.svg"/>

          <!-- Medal -->
          <h1 class="font-bold text-4xl" :class="medalColor">{{ t(`resolver.${main.podiumMedal}`) }}</h1>
        </div>

        <!-- Wrapper -->
        <div class="flex-grow overflow-hidden" style="max-height: 60vh" ref="lsref">
          <!-- List -->
          <div class="gap-2 grid grid-cols-2 ml-4 text-white" style="grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr))">
            <div v-for="i in (main.podiumList ?? [])" class="my-2">
              <h2 class="font-bold text-2xl">{{ i.name }}</h2>
              <h3>{{ i.school }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted, Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useResolverStore } from '../stores/resolver'

// I18n
const { t } = useI18n()

// Stores
const main = useResolverStore()

// Reactive
const lsref: Ref<null | HTMLDivElement> = ref(null)

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

// Life cycle
let handle = 0
onMounted(()=>{
  const el = lsref.value as HTMLDivElement

  handle = window.setInterval(()=>{
    el.scrollTo(0, el.scrollTop + 1)

    if (el.scrollTop + el.clientHeight === el.scrollHeight) {
      el.scrollTo(0, 0)
    }
    console.log(el.scrollTop, el.scrollHeight)
  }, 50)
})
onUnmounted(()=>{
  clearInterval(handle)
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