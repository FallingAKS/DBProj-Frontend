<script setup lang="ts">
interface Props {
  disabled?: boolean
  status?: 'free' | 'sold' | 'selected'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  status: 'free'
})

const emits = defineEmits(['selected', 'canceled'])

const handleClick = () => {
  if (!props.disabled) {
    if (props.status === 'free') {
      emits('selected')
    } else if (props.status === 'selected') {
      emits('canceled')
    }
  }
}
</script>

<template>
  <div class="button" @click="handleClick">
    <div class="seat" v-if="status === 'free'" />
    <div class="seat-sold" v-else-if="status === 'sold'">
      <el-image src="/img/sold_out.png" class="sold-out-img"></el-image>
    </div>
    <div class="seat-select" v-else>
      <el-image src="/img/check.png" class="sold-out-img"></el-image>
    </div>
  </div>
</template>

<style scoped>
.button {
  transition-duration: 150ms;
  user-select: none;
}

.button:hover {
  filter: brightness(1.2);
  transition-duration: 150ms;
}

.seat {
  width: 25px;
  height: 25px;
  border: rgba(128, 128, 128, 0.73) 2px solid;
  border-radius: 8px;
}

.seat-sold {
  width: 25px;
  height: 25px;
  border: rgba(128, 128, 128, 0.73) 2px solid;
  border-radius: 8px;
  background: rgb(255, 0, 0);
  background: linear-gradient(0deg, rgba(255, 0, 0, 1) 0%, rgba(255, 138, 138, 1) 100%);
}

.sold-out-img {
  transform: scale(0.8);
  opacity: 0.6;
}

.seat-select {
  width: 25px;
  height: 25px;
  border: rgba(128, 128, 128, 0.73) 2px solid;
  border-radius: 8px;
  background: rgb(50, 152, 182);
  background: linear-gradient(0deg, rgba(50, 152, 182, 1) 0%, rgba(190, 240, 255, 1) 100%);
}
</style>
