<template>
  <!-- Wrapper -->
  <div class="backdrop-brightness-50 fixed flex inset-0 items-center justify-center">
    <!-- Trigger -->
    <div @click="emits('trigger')" class="fixed h-full w-full z-40"></div>

    <!-- Contents -->
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
// Emits
const emits = defineEmits(['trigger'])
</script>