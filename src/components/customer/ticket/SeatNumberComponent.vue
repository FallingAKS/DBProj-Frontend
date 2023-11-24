<script setup lang="ts">
interface Props {
  row: number
  col: number
}

defineProps<Props>()
</script>

<template>
  <div class="border-4 border-red-500 rounded-lg overflow-hidden flex">
    <div class="bg-white text-black">
      <span class="ml-1 text-xl font-bold italic">{{ row }}</span>
      <span class="mx-1">排</span>
    </div>
    <div class="bg-red-500">
      <span class="ml-1 text-xl font-bold italic">{{ col }}</span>
      <span class="ml-1">列</span>
    </div>
  </div>
</template>

<style scoped></style>
