<template>
  <!-- Wrapper -->
  <div class="mx-2 py-1 rounded-lg text-center" :class="bgClass">{{ txt }}</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// Properties
const props = defineProps({
  status: String,
  tries: Number,
  frozenTries: Number,
  penalty: Number
})

// Computed
const bgClass = computed(()=>{
  switch (props.status) {
    case 'first_blood':
      return 'bg-blue-500'
    case 'accepted':
      return 'bg-green-500'
    case 'wrong_answer':
      return 'bg-red-500'
    case 'frozen':
      return 'bg-gray-500'
    case 'pending':
      return 'bg-yellow-500'
    default:
      return 'bg-black'
  }
})
const txt = computed(()=>{
  switch (props.status) {
    case 'first_blood':
    case 'accepted':
      return `${(props.tries as number) + (props.frozenTries as number)}/${Math.floor(props.penalty as number / 60000)}`
    case 'wrong_answer':
    case 'pending':
      return `${(props.tries as number) + (props.frozenTries as number)}`
    case 'frozen':
      return `${(props.tries as number)}+${(props.frozenTries as number)}`
    default:
      return '\u2003'
  }
})
</script>