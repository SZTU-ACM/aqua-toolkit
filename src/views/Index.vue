<template>
  <!-- Background -->
  <div class="bg-slate-900 fixed inset-0 -z-50"></div>

  <!-- Main -->
  <main class="flex flex-col items-center text-white w-full z-0">
    <!-- I18n -->
    <AqI18n class="z-0"/>

    <!-- Title -->
    <div class="flex items-center mt-32 relative">
      <img class="h-16 w-16" src="/logo.svg"/>
      <h1 class="font-bold ml-4 text-4xl">{{ t('index.title') }}</h1>
      <span class="absolute -bottom-2 right-0 text-lg">v{{ version }}</span>
    </div>

    <!-- Menu -->
    <div class="flex flex-col mt-16">
      <!-- Seats generator -->
      <AqButton @click="router.push('/st-gen')" class="flex items-center w-full">
        <FontAwesomeIcon class="h-8 w-8" icon="fa-dice fa-solid"/>
        <div class="ml-4">{{ t('index.stGen') }}</div>
      </AqButton>

      <!-- Dynamic rank -->
      <AqButton @click="router.push('/dyn-rnk')" class="flex items-center mt-4 w-full">
        <FontAwesomeIcon class="h-8 w-8" icon="fa-list-ol fa-solid"/>
        <div class="ml-4">{{ t('index.dynRnk') }}</div>
      </AqButton>

      <!-- Resolver -->
      <AqButton @click="router.push('/res')" class="flex items-center mt-4 w-full">
        <FontAwesomeIcon class="h-8 w-8" icon="fa-medal fa-solid"/>
        <div class="ml-4">{{ t('index.resolver') }}</div>
      </AqButton>
    </div>

    <!-- Footer -->
    <AqFooter class="mt-16 z-0"/>
  </main>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

// Documents
import { version } from '../../package.json'

// Components
import AqButton from '../components/AqButton.vue'
import AqFooter from '../components/AqFooter.vue'
import AqI18n from '../components/AqI18n.vue'

// I18n
const { t } = useI18n()

// Router
const router = useRouter()

// Life cycle
onMounted(()=>{
  document.title = t('index.title')
})
</script>