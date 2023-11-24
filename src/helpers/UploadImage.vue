<script setup lang="ts">
import { ref } from 'vue'
import { v4 as uuid } from 'uuid'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const props = defineProps({
  prefix: String,
  imageName: String,
  apiPath: {
    type: String,
    default: '/api/Image'
  }
})

const emit = defineEmits(['Success'])

const uid = ref(uuid())

const loading = ref(false)
const uploadImage = () => {
  document.getElementById(`uploader-${uid.value}`).click()
}

const uploaderHandleChange = (event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length !== 1) {
    return
  }

  loading.value = true

  const file = files[0]
  const formData = new FormData()
  formData.append('file', file)
  if (props.prefix) {
    formData.append('prefix', props.prefix)
  }
  if (props.imageName) {
    formData.append('imageName', props.imageName)
  }

  axios
    .put(props.apiPath!, formData)
    .then((res) => {
      loading.value = false
      if (res.data && res.data.status && res.data.status === '10000') {
        ElMessage({
          message: '上传成功',
          type: 'success'
        })
        emit('Success', res.data.data)
      } else {
        ElMessage({
          message: `上传失败：${res.data.message}`,
          type: 'warning'
        })
      }
    })
    .catch(() => {
      loading.value = false
    })
}
</script>

<template>
  <el-button-group>
    <el-button @click="uploadImage" v-loading="loading">上传图片</el-button>
    <input
      type="file"
      style="display: none"
      :id="`uploader-${uid}`"
      accept="image/*"
      :onchange="uploaderHandleChange"
    />
  </el-button-group>
</template>

<style scoped></style>
