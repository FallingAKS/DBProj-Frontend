<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { CommentCreator } from '@/models/QuickType/CommentCreator'
import { ElLoading, ElMessage } from 'element-plus'
import axios from 'axios'

const emits = defineEmits(['success'])
const props = defineProps<{
  movieId: string
}>()

const comment = ref<CommentCreator>({
  score: 0
})

onMounted(() => {
  let loading = ElLoading.service({ lock: true, text: '请稍候' })

  axios
    .get('/api/Comment/edit', {
      params: {
        movieId: props.movieId
      }
    })
    .then((res) => {
      loading.close()
      if (res.data.status && res.data.status === '10000') {
        comment.value = res.data.data
      } else {
        ElMessage({
          message: `请求评论详情失败：${res.data.message}`,
          type: 'warning'
        })
      }
    })
    .catch(() => {
      loading.close()
      ElMessage({
        message: `请求评论详情失败：网络错误`,
        type: 'warning'
      })
    })
})

const onSubmit = () => {
  let loading = ElLoading.service({ lock: true, text: '请稍候' })

  axios
    .post('/api/Comment', comment.value)
    .then((res) => {
      loading.close()
      if (res.data.status && res.data.status === '10000') {
        ElMessage.success('评论成功')
        emits('success')
      } else {
        ElMessage({
          message: `评论失败：${res.data.message}`,
          type: 'warning'
        })
      }
    })
    .catch(() => {
      loading.close()
      ElMessage({
        message: `评论失败：网络错误`,
        type: 'warning'
      })
    })
}
</script>

<template>
  <el-form :model="comment" class="mx-3">
    <el-form-item label="评分">
      <el-rate v-model="comment.score" :max="10" />
    </el-form-item>
    <el-form-item label="评论">
      <el-input type="textarea" :rows="5" v-model="comment.content" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped></style>
