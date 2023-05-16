<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

// Properties
const props = defineProps({
  accept: String,
  text: String
})

// I18n
const { t } = useI18n()

// Reactive
const el = ref(null)
const cid = ref(`aqua-file-upload-${Math.floor(Math.random() * 0xFFFFFFFF)}`)
</script>

<template>
  <div class="flex items-center justify-center w-full">
    <label class="border-2 border-dashed border-white cursor-pointer flex flex-col items-center p-4 rounded-lg w-full hover:backdrop-brightness-50" :for="cid">
      <img class="h-12 w-12" src="/imgs/upload.svg"/>
      <p><b>{{ t('common.clickToUpload') }}</b>{{ t('common.orDragAndDrop') }}</p>
      <p class="text-sm">{{ text }}</p>
      <input :accept="accept" class="hidden" :id="cid" type="file" ref="el" @change="$emit('aqua-upload', el)"/>
    </label>
  </div>
</template>
