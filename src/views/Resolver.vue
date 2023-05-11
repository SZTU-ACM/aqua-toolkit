<template>
  <!-- Background -->
  <div class="bg-slate-900 fixed inset-0 -z-50"></div>

  <!-- Main -->
  <main class="flex flex-col items-center text-white w-full z-0">
    <!-- I18n -->
    <AqI18n class="z-0"/>

    <!-- Title -->
    <div class="flex items-center mt-12 relative">
      <img class="h-16 w-16" src="/imgs/medal.svg"/>
      <h1 class="font-bold ml-4 text-4xl">{{ t('index.resolver') }}</h1>
    </div>

    <!-- Buttons -->
    <div class="flex items-center mt-8">
      <!-- Back -->
      <AqButton @click="router.push('/')" class="flex items-center">
        <FontAwesomeIcon class="h-8 w-8" icon="fa-left-long fa-solid"/>
        <div class="ml-4">{{ t('resolver.back') }}</div>
      </AqButton>

      <!-- Set remote parameters -->
      <AqButton @click="showRemote = true" class="flex items-center ml-4">
        <FontAwesomeIcon class="h-8 w-8" icon="fa-gear fa-solid"/>
        <div class="ml-4">{{ t('resolver.setRemoteParam') }}</div>
      </AqButton>
    </div>

    <!-- Remote text -->
    <p class="italic mt-4">{{ Remote.description }}</p>

    <!-- Settings -->
    <div class="flex flex-col w-2/5">
      <!-- ID list -->
      <h2 class="font-bold text-2xl">{{ t('resolver.idList') }}</h2>
      <input v-model="main.idList" @blur="main.prefetch" class="outline-none p-2 rounded-md text-black" placeholder="1001,1002,..." type="text"/>
      <p>{{ prefetchTime }}</p>

      <!-- Name -->
      <h2 class="font-bold mt-4 text-2xl">{{ t('resolver.name') }}</h2>
      <input v-model="main.name" class="outline-none p-2 rounded-md text-black" type="text"/>

      <!-- Start time -->
      <h2 class="font-bold mt-4 text-2xl">{{ t('resolver.startTime') }}</h2>
      <input v-model="main.startTime" class="outline-none p-2 rounded-md text-black" type="datetime-local"/>

      <!-- End time -->
      <h2 class="font-bold mt-4 text-2xl">{{ t('resolver.endTime') }}</h2>
      <input v-model="main.endTime" class="outline-none p-2 rounded-md text-black" type="datetime-local"/>

      <!-- Frozen time -->
      <h2 class="font-bold mt-4 text-2xl">{{ t('resolver.frozenTime') }}</h2>
      <input v-model="main.frozenTime" class="outline-none p-2 rounded-md text-black" type="datetime-local"/>

      <!-- Gold count -->
      <h2 class="font-bold mt-4 text-2xl">{{ t('resolver.goldCount') }}</h2>
      <input v-model="main.goldCount" class="outline-none p-2 rounded-md text-black" type="number"/>

      <!-- Silver count -->
      <h2 class="font-bold mt-4 text-2xl">{{ t('resolver.silverCount') }}</h2>
      <input v-model="main.silverCount" class="outline-none p-2 rounded-md text-black" type="number"/>

      <!-- Bronze count -->
      <h2 class="font-bold mt-4 text-2xl">{{ t('resolver.bronzeCount') }}</h2>
      <input v-model="main.bronzeCount" class="outline-none p-2 rounded-md text-black" type="number"/>

      <!-- Mode -->
      <h2 class="font-bold mt-4 text-2xl">{{ t('resolver.mode') }}</h2>
      <Multiselect
        v-model="main.mode"
        :allow-empty="false"
        :custom-label="(x: string)=>t(`resolver.mode${x.replace(/\b\w/, (x)=>x.toUpperCase())}`)"
        :options="['regular', 'global']"
        :searchable="false"
        :show-labels="false"
      />

      <!-- Team filter -->
      <h2 class="font-bold mt-4 text-2xl">{{ t('resolver.teamFilter') }}</h2>
      <Multiselect
        v-model="main.teamFilter"
        :allow-empty="false"
        :close-on-select="false"
        :custom-label="(x: string)=>t(`resolver.team${x.replace(/\b\w/, (x)=>x.toUpperCase())}`)"
        :hide-selected="true"
        :multiple="true"
        :options="['official', 'girl', 'unofficial']"
        :searchable="false"
        :show-labels="false"
        :taggable="true"
      />

      <!-- School filter -->
      <h2 class="font-bold mt-4 text-2xl">{{ t('resolver.schoolFilter') }}</h2>
      <Multiselect
        v-model="main.schoolFilter"
        :allow-empty="false"
        :close-on-select="false"
        :hide-selected="true"
        :multiple="true"
        :options="main.schoolOptions"
        :searchable="false"
        :show-labels="false"
        :taggable="true"
      />
    </div>

    <!-- Buttons -->
    <div class="flex items-center mt-12">
      <!-- Preprocess -->
      <AqButton @click="main.preprocess" class="flex items-center" :disabled="!main.prefetchDone">
        <FontAwesomeIcon class="h-8 w-8" icon="fa-chart-line fa-solid"/>
        <div class="ml-4">{{ t('resolver.preprocess') }}</div>
      </AqButton>

      <!-- Start -->
      <AqButton @click="router.push('/res-rnk')" class="flex items-center ml-4" :disabled="!main.workflow">
        <FontAwesomeIcon class="h-8 w-8" icon="fa-rocket fa-solid"/>
        <div class="ml-4">{{ t('resolver.start') }}</div>
      </AqButton>
    </div>
    <p class="mt-2">{{ preprocessTime }}</p>

    <!-- Footer -->
    <AqFooter class="mt-16 z-0"/>
  </main>

  <!-- Random code -->
  <AqPopUp v-show="showRemote" @trigger="showRemote = false">
    <div class="bg-indigo-700 flex flex-col p-4 rounded-lg text-white w-2/5 z-50">
      <h1 class="font-bold text-center text-3xl">{{ Remote.description }}</h1>
      <div v-for="i in Remote.paramDefine" class="my-2">
        <h2 class="font-bold text-xl">{{ i.name }}</h2>
        <input v-model="main.remoteParams[i.key]" class="border-b-2 border-solid border-white bg-transparent outline-none pb-1 px-1 w-full placeholder:italic placeholder:text-indigo-400" :placeholder="i.desc" :type="i.type"/>
      </div>
    </div>
  </AqPopUp>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Remote } from '../api/remote'
import { useResolverStore } from '../stores/resolver'
import dateFormat from 'dateformat'

// Components
import AqButton from '../components/AqButton.vue'
import AqFooter from '../components/AqFooter.vue'
import AqI18n from '../components/AqI18n.vue'
import AqPopUp from '../components/AqPopUp.vue'
import Multiselect from 'vue-multiselect'

// I18n
const { t } = useI18n()

// Router
const router = useRouter()

// Stores
const main = useResolverStore()

// Reactive
const showRemote = ref(false)

// Computed
const prefetchTime = computed(()=>{
  if (main.lastPrefetchTime === null) {
    return t('resolver.noPrefetch')
  } else {
    return `${t('resolver.lastPrefetchOn')} ${dateFormat(main.lastPrefetchTime, 'yyyy/mm/dd HH:MM:ss')}`
  }
})
const preprocessTime = computed(()=>{
  if (main.lastPreprocessTime === null) {
    return t('resolver.noPreprocess')
  } else {
    return `${t('resolver.lastPreprocessOn')} ${dateFormat(main.lastPreprocessTime, 'yyyy/mm/dd HH:MM:ss')}`
  }
})

// Life cycle
onMounted(()=>{
  document.title = t('index.resolver')
})
</script>