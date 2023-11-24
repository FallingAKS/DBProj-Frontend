<script setup lang="ts">
import type { SessionDetail } from '@/models/QuickType/SessionDetail'
import SeatComponent from '@/components/customer/ticket/SeatComponent.vue'

const props = defineProps<{
  session: SessionDetail
  seats: { [key: number]: 'free' | 'sold' | 'selected' }
}>()

const emits = defineEmits(['selected', 'canceled'])
</script>

<template>
  <div class="view-container p-5">
    <div class="center-axis">
      <div class="axis" />
    </div>
    <div class="mt-1" v-for="i in session.hallLocatedAt.seat.rows" :key="i">
      <div class="flex">
        <div class="grow" />
        <div class="ml-1" v-for="j in session.hallLocatedAt.seat.cols[i - 1]" :key="j">
          <SeatComponent
            :status="seats[(i << 7) + j] ? seats[(i << 7) + j] : undefined"
            @selected="emits('selected', i, j)"
            @canceled="emits('canceled', i, j)"
          />
        </div>
        <div class="grow" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  min-width: 500px;
  min-height: 300px;
  border: rgba(128, 128, 128, 0.35) 2px solid;
  border-radius: 24px;

  position: relative;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.center-axis {
  position: absolute;
  height: 100%;
  top: 0;
  left: 50%;
  z-index: 2;
}

.axis {
  height: 100%;
  border-left: 2px dashed rgba(128, 128, 128, 0.55); /* 使用虚线，并设置颜色 */
}
</style>
