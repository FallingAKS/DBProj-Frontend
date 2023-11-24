<script setup lang="ts">
import { HeaderImage } from '@/models/HeaderImage'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import Interaction from '@/models/interaction'
import { ElDialog, ElMessage, ElMessageBox } from 'element-plus'
import UploadImage from '@/helpers/UploadImage.vue'

const data = ref<HeaderImage[]>()
const newData = ref(new HeaderImage())

const update = () => {
  axios
    .get('/api/HeaderImage')
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        data.value = res.data.data
      } else {
        ElMessage.warning(`请求头图信息失败：${res.data.message}`)
      }
    })
    .catch(() => {
      ElMessage.warning(`请求头图信息失败：网络错误`)
    })
}

onMounted(() => {
  update()
})

const showAdd = ref(false)
const submitAdd = () => {
  if (newData.value.url.length === 0 || newData.value.movieId.length === 0) {
    ElMessage.warning('表单填写不全')
    return
  }

  axios
    .put('/api/HeaderImage', newData.value)
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        showAdd.value = false
        newData.value = new HeaderImage()
        update()
      } else {
        ElMessage.warning(`提交头图信息失败：${res.data.message}`)
      }
    })
    .catch(() => {
      ElMessage.warning(`提交头图信息失败：网络错误`)
    })
}

const submitDelete = (row: HeaderImage) => {
  ElMessageBox.confirm('确认要删除这张头图吗？', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    axios
      .delete('/api/HeaderImage', {
        params: {
          headerImageId: row.id
        }
      })
      .then((res) => {
        if (res.data.status && res.data.status === '10000') {
          ElMessage.success('删除成功')
          update()
        } else {
          ElMessage.warning(`删除失败：${res.data.message}`)
        }
      })
      .catch(() => {
        ElMessage.warning(`删除失败：网络错误`)
      })
  })
}
</script>

<template>
  <h1 class="text-2xl font-bold">首页头图管理</h1>
  <el-divider />
  <div class="flex">
    <div class="grow" />
    <el-button type="primary" @click="showAdd = true">添加新头图</el-button>
  </div>
  <div class="mt-5 p-5 border-2 rounded-xl">
    <el-table :data="data" style="width: 100%">
      <el-table-column prop="id" label="头图ID" />
      <el-table-column prop="url" label="图片">
        <template #default="scope">
          <el-image :src="scope.row.url" />
        </template>
      </el-table-column>
      <el-table-column prop="movieId" label="电影ID" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="warning" @click="submitDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <el-dialog v-model="showAdd" title="添加头图" width="600px" align-center>
    <el-form v-model="newData" class="mx-5" label-width="100px">
      <el-form-item label="图片">
        <el-image style="max-height: 300px" :src="newData.url" />
        <el-input type="textarea" class="mt-3" placeholder="URL" v-model="newData.url" />
        <upload-image class="mt-3" prefix="headerImg" @success="(url) => (newData.url = url)" />
      </el-form-item>
      <el-form-item label="绑定电影">
        <el-input placeholder="电影ID" v-model="newData.movieId" />
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="submitAdd">提交</el-button>
        <el-button type="warning" @click="newData = new HeaderImage()">清除已填内容</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped></style>
