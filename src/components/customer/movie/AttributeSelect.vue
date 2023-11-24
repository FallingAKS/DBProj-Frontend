<script setup lang="ts">
import { onMounted } from 'vue'
import ClickTag from '@/components/customer/movie/ClickTag.vue'
const emit = defineEmits(['selected'])

withDefaults(
  defineProps<{
    label: string
    tags: string[]
  }>(),
  {
    label: '标签',
    tags: () => new Array<string>()
  }
)

let selectedTags: string[] = []

function tagOnClicked(status: boolean, content: string) {
  if (status) {
    selectedTags.push(content)
  } else {
    selectedTags = selectedTags.filter((item) => item != content)
  }
  emit('selected', selectedTags)
}

onMounted(() => {})
</script>

<template>
  <div class="mx-5">
    <el-row style="align-items: center">
      <el-col :span="1">
        <label class="label" for="tags">{{ label }}</label>
      </el-col>
      <el-col id="tags" class="m-2" :span="22" style="align-items: center">
        <click-tag
          @change="tagOnClicked"
          v-for="(tag, index) in tags"
          :content="tag"
          :key="index"
          class="m-1.5"
        ></click-tag>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.label {
  color: darkblue;
}
</style>
