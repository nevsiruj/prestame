<template>
    <div>
      <Panel></Panel>
      <main class="mt-30 mr-6 lg:ml-72 sm:ml-64">
        <NuxtPage></NuxtPage>
      </main>
    </div>
  </template>
  
  <script setup>
  import Panel from "./panel.vue";
  import { ref } from "vue";
  
  </script>