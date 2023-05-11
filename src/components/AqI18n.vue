<template>
  <div class="fixed flex top-1 left-1">
    <FontAwesomeIcon class="h-8 w-8" icon="fa-language fa-solid"/>
    <select v-model="locale" class="bg-transparent font-bold ml-2 outline-none text-lg">
      <option v-for="i in langs" class="text-black" :value="i.locale">{{ i.display }}</option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { langs } from '../i18n'

// I18n
const { locale } = useI18n()

// Watch
watch(locale, (v)=>{
  localStorage.setItem('lang', v)
})
</script>