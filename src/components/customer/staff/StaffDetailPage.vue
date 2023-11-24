<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElCard, ElMessage, ElLoading } from 'element-plus'
import { StaffDetail } from '@/models/Staff'

const route = useRoute()
const router = useRouter()
const staff = ref(new StaffDetail())

onMounted(() => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中',
    fullscreen: true
  })

  axios
    .get(`/api/Staff/detail/${route.params.staffId}`)
    .then((res) => {
      console.log(res)
      staff.value = res.data.data
      console.log(staff.value)
      loading.close()
    })
    .catch((err) => {
      console.log(err)
      ElMessage.error('数据加载错误')
    })
})

const handleMovieDetail = (movieId: string) => {
  router.push(`/movie/${movieId}`)
}
</script>

<template>
  <div class="content">
    <div class="flex">
      <div class="grow" />
      <div class="m-5" style="width: 1024px">
        <el-card class="my-5">
          <div class="flex items-center">
            <h2 class="text-red-500 text-2xl font-bold">演员信息</h2>
          </div>
          <div class="flex flex-row my-5 pt-1">
            <div class="grid place-item-center basis-1/3 mx-10">
              <el-space alignment="center" :fill="true">
                <el-image style="width: 300px; height: 400px" :src="staff.imageUrl" fit="contain" />
              </el-space>
            </div>
            <el-space direction="vertical" alignment="start" size="large" :fill="true">
              <div>
                <h2 class="text-lg font-extrabold">影人名称：</h2>
                <span class="text-gray-400">{{ staff.name }}</span>
              </div>
              <div>
                <h2 class="text-lg font-extrabold">影人性别：</h2>
                <span class="text-gray-400">{{ staff.gender == 1 ? '女' : '男' }}</span>
              </div>
              <div>
                <h2 class="text-lg font-extrabold">影人介绍：</h2>
                <span class="text-gray-400">{{ staff.introduction }}</span>
              </div>
            </el-space>
          </div>
        </el-card>
        <el-card class="my-5">
          <div class="flex items-center">
            <h2 class="text-red-500 text-2xl font-bold">导演电影</h2>
          </div>
          <div
            class="my-5 pt-1 overflow-x-auto overflow-y-hidden"
            v-if="staff.directMovies?.length"
          >
            <el-space size="large" wrap>
              <div
                v-for="movie in staff.directMovies"
                :key="movie.movieId"
                @click="handleMovieDetail(movie.movieId)"
                class="cursor-pointer"
              >
                <el-image :src="movie.postUrl" fit="cover" style="height: 300px; width: 200px" />
                <div class="mt-3 text-center">{{ movie.name }}</div>
              </div>
            </el-space>
          </div>
          <div v-else>
            <h2>无</h2>
          </div>
        </el-card>
        <el-card class="my-5">
          <div class="flex items-center">
            <h2 class="text-red-500 text-2xl font-bold">参演电影</h2>
          </div>
          <div class="my-5 pt-1 overflow-x-auto overflow-y-hidden" v-if="staff.starMovies?.length">
            <el-space size="large" wrap>
              <div
                v-for="movie in staff.starMovies"
                :key="movie.movieId"
                @click="handleMovieDetail(movie.movieId)"
                class="cursor-pointer flex flex-col justify-center"
              >
                <el-image :src="movie.postUrl" fit="cover" class="mx-auto" style="height: 300px; width: 200px" />
                <div class="mt-3 text-center">{{ movie.name }}</div>
              </div>
            </el-space>
          </div>
          <div v-else>
            <h2>无</h2>
          </div>
        </el-card>
      </div>
      <div class="grow" />
    </div>
  </div>
</template>

<style scoped></style>
