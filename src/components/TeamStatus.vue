<script setup>
import { computed } from 'vue'

// Properties
const props = defineProps({
  result: String,
  tries: Number,
  frozenTries: Number,
  penalty: Number
});

// Computed
const tagClass = computed(()=>{
  switch (props.result) {
    case 'none':
      return ['bg-black']
    case 'first_blood':
      return ['bg-blue-500']
    case 'accepted':
      return ['bg-green-500']
    case 'wrong_answer':
      return ['bg-red-500']
    case 'frozen':
      return ['bg-gray-500']
    case 'pending':
      return ['bg-yellow-500']
  }
})
const tagText = computed(()=>{
  switch (props.result) {
    case 'none':
      return '\u2003'
    case 'first_blood':
    case 'accepted':
      return `${props.tries}/${Math.round(props.penalty / 60000)}`
    case 'wrong_answer':
      return props.tries
    case 'frozen':
    case 'pending':
      return `${props.tries}+${props.frozenTries}`
  }
})
</script>

<template>
  <div class="m-2 py-1 rounded-lg text-center text-white" :class="tagClass">{{ tagText }}</div>
</template>
