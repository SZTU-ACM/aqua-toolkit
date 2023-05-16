<script setup>
// Emits
const emits = defineEmits(['close'])
</script>

<template>
  <div class="backdrop-brightness-50 fixed flex inset-0 items-center justify-center z-50">
    <div class="fixed inset-0 z-40" @click="emits('close')"/>
    <slot/>
  </div>
</template>
