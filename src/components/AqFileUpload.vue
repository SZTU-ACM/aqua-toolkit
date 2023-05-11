<template>
  <!-- Wrapper -->
  <div class="border-2 border-dashed border-white rounded-lg w-full">
    <!-- Label -->
    <label class="flex flex-col items-center overflow-hidden p-4 relative w-full hover:backdrop-brightness-50" :for="uuid" ref="lref">
      <FontAwesomeIcon class="h-8 w-8" icon="fa-solid fa-upload"/>
      <h1 class="mt-2 text-xl"><b>{{ t('common.clickToUpload') }}</b>{{ t('common.orDragAndDrop') }}</h1>
      <p class="text-lg">{{ accept }}</p>

      <!-- Input -->
      <input @change="emits('change', $event)" :accept="accept" class="absolute block cursor-pointer inset-0 opacity-0" :name="uuid" type="file"/>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

// Properties
defineProps({
  accept: String
})

// Emits
const emits = defineEmits(['change'])

// I18n
const { t } = useI18n()

// Reactive
const uuid = ref(`aq-file-upload-${Math.floor(Math.random() * 0xFFFFFFFF)}`)
const lref: Ref<null | HTMLLabelElement> = ref(null)

// Life cycle
onMounted(()=>{
  const el = lref.value as HTMLLabelElement

  el.addEventListener('dragenter', ()=>{
    el.style.backdropFilter = 'brightness(.5)'
  });
  ['dragleave', 'dragend', 'drop', 'dragexit'].forEach((x)=>{
    el.addEventListener(x, ()=>{
      el.style.backdropFilter = ''
    })
  })
})
</script>