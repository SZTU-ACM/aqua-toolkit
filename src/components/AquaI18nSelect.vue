<script setup>
import { useI18n } from 'vue-i18n'
import { langs } from '../i18n'

// I18n
const { locale } = useI18n({ useScope: 'global' })

// Actions
const onChange = ()=>{
  localStorage.setItem('lang', locale.value)
}
</script>

<template>
  <div class="fixed flex items-center left-2 top-2 z-40">
    <img class="h-6 mr-2 w-6" src="/imgs/i18n.svg"/>
    <select
      v-model="locale"
      class="font-bold bg-transparent outline-none text-lg"
      @change="onChange"
    >
      <option v-for="i in langs" :value="i.value">{{ i.display }}</option>
    </select>
  </div>
</template>

<style lang="postcss" scoped>
option {
  @apply text-black
}
</style>
