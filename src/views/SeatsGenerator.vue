<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import hljs from 'highlight.js'

import { useSeatsGeneratorStore } from '../stores/seatsGenerator'

// Documents
import randomRaw from '../api/shuffle?raw'

// Components
import AquaButton from '../components/AquaButton.vue'
import AquaFileUpload from '../components/AquaFileUpload.vue'
import AquaFooter from '../components/AquaFooter.vue'
import AquaI18nSelect from '../components/AquaI18nSelect.vue'
import AquaPopUp from '../components/AquaPopUp.vue'

// I18n
const { t, locale } = useI18n()

// Router
const router = useRouter()

// Stores
const main = useSeatsGeneratorStore()

// Reactive
const showCode = ref(false)
const showInput = ref(false)
const showExport = ref(false)

// Action
const changeTitle = ()=>{
  document.title = `${t('seatsGenerator.title')} - ${t('index.title')}`
}

// Watch
watch(locale, changeTitle)

// Life cycle
onMounted(()=>{
  changeTitle()
  hljs.highlightAll()
  main.init()
})
</script>

<template>
  <!-- I18n -->
  <AquaI18nSelect/>

  <!-- main -->
  <main class="fixed flex flex-col inset-0 items-center pt-12">
    <!-- Title -->
    <div class="flex items-center">
      <img class="h-16 mr-4 w-16" src="/imgs/random.svg"/>
      <h1 class="font-bold text-4xl">{{ t('seatsGenerator.title') }}</h1>
    </div>

    <!-- Wrapper -->
    <div class="flex items-center">
      <!-- Buttons up -->
      <div class="flex flex-col items-center">
        <div class="flex mt-8">
          <!-- Back -->
          <AquaButton class="flex items-center" @click="router.push('/')" :disabled="main.isShuffling">
            <img class="h-8 mr-4 w-8" src="/imgs/return.svg"/>
            <div>{{ t('seatsGenerator.back') }}</div>
          </AquaButton>

          <!-- Show random code -->
          <AquaButton class="flex items-center ml-4" @click="showCode = true">
            <img class="h-8 mr-4 w-8" src="/imgs/js.svg"/>
            <div>{{ t('seatsGenerator.showRandomCode') }}</div>
          </AquaButton>

          <!-- Data input -->
          <AquaButton class="flex items-center ml-4" @click="showInput = true" :disabled="main.isShuffling">
            <img class="h-8 mr-4 w-8" src="/imgs/csv.svg"/>
            <div>{{ t('seatsGenerator.dataImport') }}</div>
          </AquaButton>

          <!-- Reset -->
          <AquaButton class="flex items-center ml-4" @click="main.reset" :disabled="!main.canReset">
            <img class="h-8 mr-4 w-8" src="/imgs/reset.svg"/>
            <div>{{ t('seatsGenerator.reset') }}</div>
          </AquaButton>
        </div>

        <!-- Buttons down -->
        <div class="flex mt-4">
          <!-- Generate -->
          <AquaButton class="flex items-center" @click="main.shuffle" :disabled="!main.canGenerate">
            <img class="h-8 mr-4 w-8" src="/imgs/random.svg"/>
            <div>{{ main.shuffleMode === 'all' ? t('seatsGenerator.stop') : t('seatsGenerator.generate') }}</div>
          </AquaButton>

          <!-- Generate by seed -->
          <AquaButton class="flex items-center ml-4" @click="main.shuffleBySeed" :disabled="!main.canGenerateBySeed">
            <img class="h-8 mr-4 w-8" src="/imgs/seed.svg"/>
            <div>{{ t('seatsGenerator.generateBySeed') }}</div>
          </AquaButton>

          <!-- Generate for selected -->
          <AquaButton class="flex items-center ml-4" @click="main.shuffleSelect" :disabled="!main.canGenerateForSelected">
            <img class="h-8 mr-4 w-8" src="/imgs/star.svg"/>
            <div>{{ t('seatsGenerator.generateForSelected') }}</div>
          </AquaButton>

          <!-- Export -->
          <AquaButton class="flex items-center ml-4" @click="showExport = true" :disabled="!main.canExport">
            <img class="h-8 mr-4 w-8" src="/imgs/export.svg"/>
            <div>{{ t('seatsGenerator.export') }}</div>
          </AquaButton>
        </div>
      </div>

      <!-- Seed -->
      <div class="flex flex-col items-center ml-8 text-3xl">
        <div class="font-bold">{{ t('seatsGenerator.seed') }}</div>
        <input v-model="main.seed" class="bg-transparent border-b-2 border-solid border-white text-center w-48" type="number"/>
      </div>

      <!-- Order -->
      <div v-if="main.selectOrd" class="font-bold ml-8 text-3xl">{{ t('seatsGenerator.order') + '\u2002#' + main.selectOrd }}</div>
    </div>

    <!-- Team -->
    <div v-if="main.teamList" class="border border-solid border-white overflow-y-scroll mt-8 mb-4 w-11/12">
      <table class="text-center w-full">
        <tr
          v-for="i, idx in main.teamList"
          class="py-2 even:bg-blue-950 odd:bg-blue-900 hover:bg-purple-600"
          :class="[main.selectIdx === idx ? '!bg-yellow-500' : '']"
          @click="main.select(idx)"
        >
          <td class="w-1/12">{{ idx + 1 }}</td>
          <td class="w-1/5">{{ i.name }}</td>
          <td class="w-1/5">{{ i.school }}</td>
          <td>{{ i.member }}</td>
          <td>{{ i.coach }}</td>
          <td class="w-1/12">{{ i.room }}</td>
          <td class="w-1/12">{{ i.id ? `team${i.id}` : '' }}</td>
        </tr>
      </table>
    </div>

    <template v-else>
      <!-- Warn -->
      <h1 class="font-bold mt-12 text-3xl text-red-500">{{ t('seatsGenerator.plsImportData') }}</h1>

      <!-- Footer -->
      <AquaFooter/>
    </template>
  </main>

  <!-- Random code -->
  <AquaPopUp v-show="showCode" @close="showCode = false">
    <div class="bg-indigo-500 p-4 rounded-xl w-1/2 z-50" style="height:95%">
      <div class="h-full w-full overflow-y-scroll">
        <pre class="whitespace-pre-wrap"><code>{{ randomRaw }}</code></pre>
      </div>
    </div>
  </AquaPopUp>

  <!-- Data input -->
  <AquaPopUp v-show="showInput" @close="showInput = false">
    <div class="bg-indigo-500 flex flex-col items-center px-12 py-4 rounded-xl w-1/2 z-50">
      <h1 class="font-bold text-2xl">{{ t('seatsGenerator.dataImport') }}</h1>

      <!-- Team -->
      <h2
        class="font-bold mb-2 self-start"
        :class="[main.teamList ? 'text-green-500' : 'text-red-500']"
      >
        {{ t('seatsGenerator.uploadTeam') }}<span class="text-red-500">*</span>
      </h2>
      <AquaFileUpload accept="text/csv" text="CSV Files" @aqua-upload="main.parseTeamImport"/>
      <AquaButton class="mt-4" @click="main.teamList = main.rawTeamList = null">{{ t('seatsGenerator.delete') }}</AquaButton>

      <!-- Room -->
      <h2
        class="font-bold mb-2 mt-4 self-start"
        :class="[main.roomList ? 'text-green-500' : 'text-red-500']"
      >
        {{ t('seatsGenerator.uploadRoom') }}
      </h2>
      <AquaFileUpload accept="text/csv" text="CSV Files" @aqua-upload="main.parseRoomImport"/>
      <AquaButton class="mt-4" @click="main.roomList = null">{{ t('seatsGenerator.delete') }}</AquaButton>
    </div>
  </AquaPopUp>

  <!-- Export -->
  <AquaPopUp v-if="showExport" @close="showExport = false">
    <div class="bg-indigo-500 flex flex-col items-center px-12 py-4 rounded-xl z-50">
      <h1 class="font-bold text-2xl">{{ t('seatsGenerator.export') }}</h1>

      <!-- CSV -->
      <AquaButton class="flex items-center mt-4 w-full" @click="main.dlCsv">
        <img class="h-8 mr-4 w-8" src="/imgs/csv.svg"/>
        <div>{{ t('seatsGenerator.downloadCsv') }}</div>
      </AquaButton>

      <!-- JSON -->
      <AquaButton class="flex items-center mt-4 w-full" @click="main.dlJson">
        <img class="h-8 mr-4 w-8" src="/imgs/json.svg"/>
        <div>{{ t('seatsGenerator.downloadJson') }}</div>
      </AquaButton>

      <!-- YAML -->
      <AquaButton class="flex items-center mt-4 w-full" @click="main.dlYaml">
        <img class="h-8 mr-4 w-8" src="/imgs/yaml.svg"/>
        <div>{{ t('seatsGenerator.downloadYaml') }}</div>
      </AquaButton>

      <!-- TXT -->
      <AquaButton class="flex items-center mt-4 w-full" @click="main.dlText">
        <img class="h-8 mr-4 w-8" src="/imgs/text.svg"/>
        <div>{{ t('seatsGenerator.downloadText') }}</div>
      </AquaButton>
    </div>
  </AquaPopUp>
</template>
