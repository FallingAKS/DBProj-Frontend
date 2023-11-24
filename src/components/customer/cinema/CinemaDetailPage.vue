<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import Cinema from '@/models/Cinema'
import type { SessionDetail } from '@/models/QuickType/SessionDetail'
import CinemaSessionCard from './CinemaSessionCard.vue'
import { ElCard, ElMessage, ElLoading } from 'element-plus'

const cinema = ref(new Cinema())
const sessions = ref<{ [key: string]: SessionDetail[] }>({})
const activeSessionDate = ref('0')
const route = useRoute()

onMounted(() => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中',
    fullscreen: true
  })

  let finished = 0
  const callFinish = () => {
    finished += 1
    if (finished >= 2) {
      loading.close()
    }
  }

  axios
    .get(`/api/Cinema/${route.params.cinemaId}`)
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        cinema.value = res.data.data
        callFinish()
      } else {
        ElMessage.error('影院加载错误')
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessage.error('影院加载错误')
    })

  axios
    .get(`/api/Session/cinema/${route.params.cinemaId}`)
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        sessions.value = res.data.data
        // console.log(sessions.value)
        callFinish()
      } else {
        ElMessage.error('影院加载错误')
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessage.error('影院排片加载错误')
    })
})
</script>

<template>
  <div class="content">
    <div class="flex">
      <div class="grow" />
      <div class="m-5 my-5" style="width: 1024px">
        <el-card class="w-full">
          <div class="flex items-center">
            <h2 class="text-red-500 text-2xl font-bold">影院信息</h2>
          </div>
          <div class="flex flex-row my-5 pt-1">
            <div class="grid place-item-center basis-1/3 mx-10">
              <el-space alignment="center" :fill="true">
                <el-image
                  style="width: 300px; height: 400px"
                  :src="cinema.cinemaImageUrl"
                  fit="contain"
                />
              </el-space>
            </div>
            <el-space direction="vertical" alignment="start" size="large" :fill="true">
              <div>
                <h2 class="text-lg font-extrabold">影院名称：</h2>
                <span class="text-gray-400">{{ cinema.name }}</span>
              </div>
              <div>
                <h2 class="text-lg font-extrabold">影院地址：</h2>
                <span class="text-gray-400">{{ cinema.location }}</span>
              </div>
              <div>
                <h2 class="text-lg font-extrabold">影院特色：</h2>
                <el-space wrap size="small" direction="horizontal">
                  <el-tag
                    v-for="tag in cinema.feature.split(',')"
                    :key="tag"
                    size="small"
                    color="rgba(90,0,90,.4)"
                    effect="dark"
                    disable-transitions
                    >{{ tag }}
                  </el-tag>
                </el-space>
              </div>
            </el-space>
          </div>
        </el-card>
        <el-card class="w-full my-5">
          <div class="flex items-center">
            <h2 class="text-red-500 text-2xl font-bold">近期场次</h2>
            <div class="grow" />
            <!-- <el-button link>全部</el-button> -->
            <!--这个是假按钮-->
          </div>
          <CinemaSessionCard
            v-model:active-session-date="activeSessionDate"
            :sessions="sessions"
            :is-movie="false"
          />
        </el-card>
      </div>
      <div class="grow" />
    </div>
  </div>
</template>
