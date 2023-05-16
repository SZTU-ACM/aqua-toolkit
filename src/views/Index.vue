<script setup>
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

// Document
import { version } from '../../package.json'

// Components
import AquaButton from '../components/AquaButton.vue'
import AquaFooter from '../components/AquaFooter.vue'
import AquaI18nSelect from '../components/AquaI18nSelect.vue'

// I18n
const { t, locale } = useI18n()

// Router
const router = useRouter()

// Actions
const changeTitle = ()=>{
  document.title = t('index.title')
}

// Watch
watch(locale, changeTitle)

// Life cycle
onMounted(changeTitle)
</script>

<template>
  <!-- I18n -->
  <AquaI18nSelect/>

  <!-- -->
  <main class="fixed flex flex-col inset-0 items-center pt-32">
    <!-- Title -->
    <div class="flex items-center relative">
      <img class="h-16 mr-4 w-16" src="/logo.svg"/>
      <h1 class="font-bold text-4xl">{{ t('index.title') }}</h1>
      <span class="absolute -bottom-2 right-0">v{{ version }}</span>
    </div>

    <!-- Selections -->
    <div class="flex flex-col mt-20">
      <!-- Seats generator -->
      <AquaButton class="flex items-center w-full" @click="router.push('/seats-generator')" disabled="true">
        <img class="h-8 mr-4 w-8" src="/imgs/random.svg"/>
        <div>{{ t('index.seatsGenerator') }}</div>
      </AquaButton>

      <!-- Dynamic rank -->
      <AquaButton class="flex items-center mt-4 w-full" @click="router.push('/dynamic-rank')">
        <img class="h-8 mr-4 w-8" src="/imgs/rank.svg"/>
        <div>{{ t('index.dynamicRank') }}</div>
      </AquaButton>

      <!-- Resolver -->
      <AquaButton class="flex items-center mt-4 w-full" @click="router.push('/resolver')" disabled="true">
        <img class="h-8 mr-4 w-8" src="/imgs/resolver.svg"/>
        <div>{{ t('index.resolver') }}</div>
      </AquaButton>
    </div>

    <!-- Footer -->
    <AquaFooter/>  
  </main>
</template>
