<template>
  <!-- Background -->
  <div class="bg-slate-900 fixed inset-0 -z-50"></div>

  <!-- Main -->
  <main class="fixed flex flex-col inset-0 items-center text-white z-0">
    <!-- I18n -->
    <AqI18n class="z-0"/>

    <!-- Title -->
    <div class="flex items-center mt-12">
      <img class="h-16 w-16" src="/imgs/dice.svg"/>
      <h1 class="font-bold ml-4 text-4xl">{{ t('index.stGen') }}</h1>
    </div>

    <!-- Top -->
    <div class="flex items-center mt-8">
      <!-- Buttons -->
      <div class="flex flex-col items-center">
        <!-- Up -->
        <div class="flex items-center">
          <!-- Back -->
          <AqButton @click="router.push('/')" class="flex items-center" :disabled="main.isShuffling">
            <FontAwesomeIcon class="h-8 w-8" icon="fa-left-long fa-solid"/>
            <div class="ml-4">{{ t('stGen.back') }}</div>
          </AqButton>

          <!-- Show random code -->
          <AqButton @click="showCode = true" class="flex items-center ml-4">
            <FontAwesomeIcon class="h-8 w-8" icon="fa-code fa-solid"/>
            <div class="ml-4">{{ t('stGen.showRndCode') }}</div>
          </AqButton>

          <!-- Import -->
          <AqButton @click="showImport = true" class="flex items-center ml-4" :disabled="main.isShuffling">
            <FontAwesomeIcon class="h-8 w-8" icon="fa-file-import fa-solid"/>
            <div class="ml-4">{{ t('stGen.import') }}</div>
          </AqButton>

          <!-- Reset -->
          <AqButton @click="main.reset" class="flex items-center ml-4" :disabled="main.isShuffling">
            <FontAwesomeIcon class="h-8 w-8" icon="fa-arrow-rotate-left fa-solid"/>
            <div class="ml-4">{{ t('stGen.reset') }}</div>
          </AqButton>
        </div>

        <!-- Down -->
        <div class="flex items-center mt-4">
          <!-- Generate -->
          <AqButton @click="main.gen" class="flex items-center" :disabled="!main.canGen">
            <template v-if="main.mode === 'gen'">
              <FontAwesomeIcon class="h-8 w-8" icon="fa-circle-stop fa-solid"/>
              <div class="ml-4">{{ t('stGen.stop') }}</div>
            </template>
            <template v-else>
              <FontAwesomeIcon class="h-8 w-8" icon="fa-solid fa-rocket"/>
              <div class="ml-4">{{ t('stGen.gen') }}</div>
            </template>
          </AqButton>

          <!-- Generate by seed -->
          <AqButton @click="main.genBySeed" class="flex items-center ml-4" :disabled="!main.canGenBySeed">
            <FontAwesomeIcon class="h-8 w-8" icon="fa-seedling fa-solid"/>
            <div class="ml-4">{{ t('stGen.genBySeed') }}</div>
          </AqButton>

          <!-- Generate for selected -->
          <AqButton @click="main.genForSelected" class="flex items-center ml-4" :disabled="!main.canGenForSelected">
            <FontAwesomeIcon class="h-8 w-8" icon="fa-solid fa-star"/>
            <div class="ml-4">{{ t('stGen.genForSel') }}</div>
          </AqButton>

          <!-- Export -->
          <AqButton @click="showExport = true" class="flex items-center ml-4" :disabled="!main.canExport">
            <FontAwesomeIcon class="h-8 w-8" icon="fa-file-export fa-solid"/>
            <div class="ml-4">{{ t('stGen.export') }}</div>
          </AqButton>
        </div>
      </div>

      <!-- Seed -->
      <div class="flex flex-col items-center ml-8 text-3xl">
        <div class="font-bold">{{ t('stGen.seed') }}</div>
        <input v-model="main.seed" class="bg-transparent border-b-2 border-solid border-white outline-none text-center w-44" :class="[main.canChangeSeed ? '' : 'italic']" :disabled="!main.canChangeSeed" type="number"/>
      </div>

      <!-- Select order -->
      <div v-if="main.selOrd" class="flex flex-col items-center ml-8 text-3xl">
        <div class="font-bold">{{ t('stGen.order') }}</div>
        <div>#{{ main.selOrd }}</div>
      </div>
    </div>

    <!-- List -->
    <div v-if="main.teamList" class="border border-solid border-white overflow-y-scroll mt-12 w-11/12">
      <table class="text-center w-full">
        <tr v-for="(i, idx) in main.teamList" @click="main.selectRow(idx)" class="even:bg-blue-950 hover:bg-purple-700 odd:bg-blue-800" :class="main.selectedRowClass(idx)">
          <td class="w-16">{{ idx + 1 }}</td>
          <td class="w-1/4" :class="i[4] === '1' ? 'text-pink-300' : ''">{{ (i[4] === '2' ? '*' : '') + i[0] }}</td>
          <td class="w-1/6">{{ i[1] }}</td>
          <td class="w-1/4">{{ i[2] }}</td>
          <td class="w-1/6">{{ i[3] }}</td>
          <td>{{ ((main.workList ?? [])[idx] ?? [])[0] ?? '' }}</td>
          <td>{{ ((main.workList ?? [])[idx] ?? [])[1] ?? '' }}</td>
        </tr>
      </table>
    </div>

    <!-- Warn text -->
    <h1 v-else class="font-bold mt-12 text-3xl text-red-500">{{ t('stGen.plsImport') }}</h1>

    <!-- Footer -->
    <AqFooter class="mt-16 z-0"/>
  </main>

  <!-- Random code -->
  <AqPopUp v-show="showCode" @trigger="showCode = false">
    <div class="bg-indigo-700 h-5/6 p-2 rounded-lg w-2/5 z-50">
      <div class="overflow-y-scroll h-full">
        <pre style="margin:0"><code v-html="randomCode" class="language-typescript"></code></pre>
      </div>
    </div>
  </AqPopUp>

  <!-- Import -->
  <AqPopUp v-show="showImport" @trigger="showImport = false">
    <div class="bg-indigo-700 p-2 rounded-lg text-white w-2/5 z-50">
      <!-- Team -->
      <h2 class="font-bold text-2xl" :class="main.importTeamClass">{{ t('stGen.importTeam') }}<span class="text-red-500"> *</span></h2>
      <AqFileUpload @change="(e)=>main.parseImport('team', e)" accept="text/csv" class="mt-2"/>
      <AqButton @click="main.deleteImport('team')" class="flex items-center mt-2 mx-auto">
        <FontAwesomeIcon icon="fa-solid fa-trash"/>
        <div class="ml-4">{{ t('stGen.delete') }}</div>
      </AqButton>

      <h2 class="font-bold mt-4 text-2xl" :class="main.importRoomClass">{{ t('stGen.importRoom') }}</h2>
      <AqFileUpload @change="(e)=>main.parseImport('room', e)" accept="text/csv" class="mt-2"/>
      <AqButton @click="main.deleteImport('room')" class="flex items-center mt-2 mx-auto">
        <FontAwesomeIcon icon="fa-solid fa-trash"/>
        <div class="ml-4">{{ t('stGen.delete') }}</div>
      </AqButton>
    </div>
  </AqPopUp>

  <!-- Export -->
  <AqPopUp v-show="showExport" @trigger="showExport = false">
    <div class="bg-indigo-700 flex flex-col items-center p-4 rounded-lg text-white z-50">
      <!-- Plain text -->
      <AqButton @click="main.dlExport('text')" class="flex items-center w-full">
        <FontAwesomeIcon class="h-8 w-8" icon="fa-download fa-solid"/>
        <div class="ml-4">{{ t('stGen.exportText') }}</div>
      </AqButton>

      <!-- Csv -->
      <AqButton @click="main.dlExport('csv')" class="flex items-center mt-4 w-full">
        <FontAwesomeIcon class="h-8 w-8" icon="fa-download fa-solid"/>
        <div class="ml-4">{{ t('stGen.exportCsv') }}</div>
      </AqButton>

      <!-- Json -->
      <AqButton @click="main.dlExport('json')" class="flex items-center mt-4 w-full">
        <FontAwesomeIcon class="h-8 w-8" icon="fa-download fa-solid"/>
        <div class="ml-4">{{ t('stGen.exportJson') }}</div>
      </AqButton>

      <!-- Yaml -->
      <AqButton @click="main.dlExport('yaml')" class="flex items-center mt-4 w-full">
        <FontAwesomeIcon class="h-8 w-8" icon="fa-download fa-solid"/>
        <div class="ml-4">{{ t('stGen.exportYaml') }}</div>
      </AqButton>
    </div>
  </AqPopUp>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStGenStore } from '../stores/stGen'
import Prism from 'prismjs'

// Documents
import randomCode from '../api/shuffle?raw'

// Components
import AqButton from '../components/AqButton.vue'
import AqFileUpload from '../components/AqFileUpload.vue'
import AqFooter from '../components/AqFooter.vue'
import AqI18n from '../components/AqI18n.vue'
import AqPopUp from '../components/AqPopUp.vue'

// I18n
const { t } = useI18n()

// Router
const router = useRouter()

// Stores
const main = useStGenStore()

// Reactive
const showCode = ref(false)
const showImport = ref(false)
const showExport = ref(false)

// Life cycle
onMounted(()=>{
  document.title = t('index.stGen')
  Prism.highlightAll()
})
</script>

<style lang="postcss" scoped>
input[type=number] {
  appearance: textfield;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  @apply appearance-none m-0
}
</style>