<template>
    <div>
      <Panel></Panel>
      <main class="mt-20 sm:ml-64">
        <NuxtPage></NuxtPage>
      </main>
    </div>
  </template>
  
  <script setup>
  import Panel from "./panel.vue";
  import { ref } from "vue";
  
  </script>