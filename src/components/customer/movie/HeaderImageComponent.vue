<script setup lang="ts">
import type { HeaderImageDetail } from '@/models/QuickType/HeaderImageDetail'
import { useRouter } from 'vue-router'

const props = defineProps<{
  info: HeaderImageDetail
}>()

const router = useRouter()

const handleClick = () => {
  router.push(`/movie/${props.info.movieId}`)
}

const truncateString = (str: string, maxLength: number = 30): string => {
  if (!str || !str.length || str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength - 3) + '...'
}
</script>

<template>
  <div class="card-layer" @click="handleClick">
    <div class="image-layer">
      <el-image :src="info.url" class="headerImage" />
    </div>
    <div class="info-layer">
      <div class="flex flex-col h-full">
        <div class="grow" />
        <div class="text-white m-2">
          <h2 class="text-2xl font-bold">{{ info.movie.name }}</h2>
          <h3 class="">{{ truncateString(info.movie.instruction, 60) }}</h3>
        </div>
        <div class="grow" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-layer {
  position: relative;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.image-layer {
  position: relative;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
}

.info-layer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition-duration: 200ms;
}

.info-layer:hover {
  opacity: 1;
  transition-duration: 200ms;
}
</style>
