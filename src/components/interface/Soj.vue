<script setup>
import { useResolverStore } from '../../stores/resolver'
import { useSojStore } from '../../stores/interface/soj'

// Stores
const main = useResolverStore()
const soj = useSojStore()

main.fetchMetaData = soj.fetchMetaData
</script>

<template>
  <h2 class="mt-4">API url</h2>
  <input v-model.trim="soj.api" placeholder="SOJ API url" type="url"/>

  <h2 class="mt-4">User ID</h2>
  <input v-model="soj.userId" placeholder="SOJ user ID" type="text"/>

  <h2 class="mt-4">Password</h2>
  <input v-model="soj.passwd" placeholder="SOJ password" type="password"/>

  <h2 class="mt-4">Contest ID list</h2>
  <input v-model.trim="soj.idList" placeholder="1001,1002,1003,..." type="text"/>
</template>

<style lang="postcss" scoped>
input {
  @apply outline-none p-2 rounded-md text-black w-full
}
</style>
