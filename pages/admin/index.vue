<template> 

  <div class="grid grid-cols-1 gap-4 mt-5">
    <Task />
  </div>
</template>
<script setup>

import Task from '../../components/bandejaTarea/task.vue'
import { useAuthStore } from "@/stores/auth";

const lineChartRef = ref(null)

definePageMeta({
  requiresAuth: true,
  layout: "admin",
});
</script>
