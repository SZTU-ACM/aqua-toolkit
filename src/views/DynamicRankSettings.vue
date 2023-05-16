<script setup>
import { ref } from 'vue'
import { useContestStore } from '../stores/contest'
import { useRemoteStore } from '../stores/remote'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Stores
const remote = useRemoteStore()
const contest = useContestStore()

// Reactive
const userId = ref('')
const passwd = ref('')
const loginWarn = ref('')
const contestListWarn = ref('')

// Action
const login = async ()=>{
  loginWarn.value = ''

  if (userId.value.length === 0) {
    loginWarn.value = 'User ID cannot be empty'
    return
  }
  if (passwd.value.length === 0) {
    loginWarn.value = 'Password cannot be empty'
    return
  }

  const res = await remote.login(userId.value, passwd.value)
  userId.value = ''
  passwd.value = ''
  if (res.code !== 0)
    loginWarn.value = res.msg
}

const validateContestList = async ()=>{
  contestListWarn.value = ''

  if (/^(\d*)(,\d+)*$/.test(contest.contestList) === false) {
    contestListWarn.value = 'Invalid list'
    return
  }

  contestListWarn.value = 'Initializing...'
  const res = await contest.init()
  contestListWarn.value = (res.code !== 0 ? res.msg : '')
    console.log(res.data)
}
</script>

<template>
  <div class="px-8 py-4 text-white">
    <div class="flex flex-col mb-4">
      <router-link class="hover:font-bold" to="/">« Index</router-link>
      <a class="hover:font-bold" href="#" @click="router.go(-1)">« Rank</a>
    </div>

    <h1>Settings</h1>

    <h2>Service API</h2>
    <input v-model="remote.apiUrl" type="url"/>

    <h2>User</h2>
    <template v-if="remote.userId === null">
      <input v-model="userId" placeholder="User ID" type="text"/>
      <input v-model="passwd" placeholder="Password" type="password"/>
      <p class="font-bold text-red-500 mb-4">{{ loginWarn }}</p>
      <button @click="login">Login</button>
    </template>
    <template v-else>
      <p><b>Name: </b>{{ remote.userId }}</p>
      <p class="mb-2"><b>Last Refresh: </b>{{ new Date(remote.lastRefreshTime).toLocaleString() }}</p>
      <button @click="remote.logout">Logout</button>
    </template>

    <h2>Contest Merging</h2>
    <input @blur="validateContestList" v-model="contest.contestList" placeholder="1001,1002,1003,..." type="text"/>
    <p class="font-bold text-red-500 mb-4">{{ contestListWarn }}</p>

    <h2>Contest Title</h2>
    <input v-model="contest.title" type="text"/>

    <h2>Start Time</h2>
    <p>{{ contest.startTime }}</p>

    <h2>End Time</h2>
    <p>{{ contest.endTime }}</p>

    <h2>Filters</h2>
    <div class="flex">
      <input
        v-model="contest.unofficialFilter" 
        class="mr-2" 
        type="checkbox"
        :true-value="true"
        :false-value="false"
      />
      <b>Hide unofficial teams</b>
    </div>
    <p class="mt-2"><b>School hide filter: </b></p>
    <div class="grid grid-cols-4">
      <div v-for="(i, idx) in contest.schoolList" class="flex w-fit">
        <input 
          v-model="contest.schoolFilter[idx]" 
          class="mr-2" 
          type="checkbox"
          :true-value="i"
          :false-value="null"
        />
        <div>{{ i }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
h1 {
  @apply font-bold mb-4 select-none text-3xl
}

h2 {
  @apply font-bold mb-2 mt-4 select-none text-2xl
}

input:read-write {
  @apply bg-transparent block border border-solid border-white mb-4 outline-none p-2 rounded w-1/2 focus:border-red-500
}

button {
  @apply border-2 border-solid border-white px-4 py-2 rounded-lg hover:bg-white hover:font-bold hover:text-black
}
</style>
