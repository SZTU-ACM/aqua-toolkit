<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResolverStore } from '../stores/resolver'

// Components
import AquaButton from '../components/AquaButton.vue'
import AquaFooter from '../components/AquaFooter.vue'
import MultiSelect from 'vue-multiselect'
import Soj from '../components/interface/Soj.vue'

// Router
const router = useRouter()

// Stores
const main = useResolverStore()

// Life cycle
onMounted(()=>{
  main.stop = true
  main.resume()
})
</script>

<template>
  <div class="flex flex-col items-center pt-32 w-full">
    <!-- Title -->
    <div class="flex items-center">
      <img class="h-16 mr-4 w-16" src="/imgs/resolver.svg"/>
      <h1 class="font-bold text-4xl">Aqua Resolver</h1>
    </div>

    <!-- Back AquaButton -->
    <AquaButton class="flex items-center mt-20" @click="router.push('/')">
      <img class="h-8 mr-4 w-8" src="/imgs/return.svg"/>
      <div>Back</div>
    </AquaButton>

    <!-- Interface -->
    <div class="mt-8" style="width:33vw">
      <h1 class="font-bold text-3xl text-center">Interface</h1>

      <!-- Your interface component below -->
      <Soj/>
      <!-- Your interface component above -->
    </div>

    <!-- Fetch meta data AquaButton -->
    <div class="mt-8">
      <AquaButton @click="main.fetchMetaData">Fetch Meta Data</AquaButton>
    </div>

    <!-- Interface message -->
    <div v-html="main.interfaceMsg" class="font-bold mt-4 text-center text-lg"/>

    <!-- Settings -->
    <div class="mt-8" style="width:33vw">
      <h1 class="font-bold text-3xl text-center">Settings</h1>

      <!-- Contest name -->
      <h2 class="mt-4">Contest name</h2>
      <input
        v-model="main.contestName"
        placeholder="Input contest name"
        type="text"
      />

      <!-- Start time -->
      <h2 class="mt-4">Start time</h2>
      <input v-model="main.startTime" type="datetime-local"/>

      <!-- End time -->
      <h2 class="mt-4">End time</h2>
      <input v-model="main.endTime" type="datetime-local"/>

      <!-- Frozen start time -->
      <h2 class="mt-4">Frozen start time</h2>
      <input v-model="main.frozenStartTime" type="datetime-local"/>

      <!-- Gold medal count -->
      <h2 class="mt-4">Gold medal count</h2>
      <input v-model="main.goldNum" type="number"/>

      <!-- Silver medal count -->
      <h2 class="mt-4">Silver medal count</h2>
      <input v-model="main.silverNum" type="number"/>

      <!-- Bronze medal count -->
      <h2 class="mt-4">Bronze medal count</h2>
      <input v-model="main.bronzeNum" type="number"/>

      <!-- Team filter -->
      <h2 class="mt-4">Team Filter</h2>
      <MultiSelect
        v-model="main.teamFilter"
        :clear-on-select="false"
        :close-on-select="false"
        :multiple="true"
        :options="['Official', 'Unofficial', 'Girl']"
        :searchable="false"
        :show-labels="true"
        :taggable="true"
        class="w-full"
        open-direction="bottom"
      />

      <!-- School filter -->
      <h2 class="mt-4">School Filter</h2>
      <MultiSelect
        v-model="main.schoolFilter"
        :clear-on-select="false"
        :close-on-select="false"
        :hide-selected="true"
        :multiple="true"
        :options="main.schoolOptions"
        :searchable="false"
        :show-labels="true"
        :taggable="true"
        class="w-full"
        open-direction="bottom"
      />

      <!-- Mode -->
      <h2 class="mt-4">Mode</h2>
      <MultiSelect
        v-model="main.mode"
        :allow-empty="false"
        :close-on-select="true"
        :options="['Regular', 'Global']"
        :searchable="false"
        :show-labels="false"
        class="w-full"
        open-direction="bottom"
      />

      <!-- Buttons -->
      <div class="mt-4 text-center">
        <AquaButton 
          @click="main.preprocess"
          :disabled="main.preprocessDisable"
        >Start Preprocessing</AquaButton>
        <AquaButton
          class="ml-4"
          @click="router.push('/resolver-rank')"
          :disabled="main.resolveDisable"
        >Start Resolving</AquaButton>
      </div>

      <!-- Message -->
      <div v-html="main.settingsMsg" class="font-bold mt-4 text-center text-lg"/>
    </div>

    <!-- Footer -->
    <AquaFooter/>  
  </div>
</template>

<style lang="postcss" scoped>
input {
  @apply outline-none p-2 rounded-md text-black w-full
}
</style>
