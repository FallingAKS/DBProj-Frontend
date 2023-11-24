<script setup lang="ts">
import { ElCard, ElLoading, ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import type { TicketDetail } from '@/models/QuickType/TicketDetail'
import axios from 'axios'
import TicketComponent from '@/components/customer/orders/TicketComponent.vue'
import type { TicketSideInfo } from '@/models/QuickType/TicketSideInfo'

const loadFinished = ref(false)
const tickets = ref<{ [key: string]: TicketDetail[] }>({})
const ticketSideInfo = ref<{ [key: string]: TicketSideInfo }>({})
const commentedMovies = ref<Set<string>>(new Set<string>())

onMounted(() => {
  const loading = ElLoading.service({
    lock: true,
    text: '请稍候'
  })

  axios
    .get('/api/Ticket')
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        let result: TicketDetail[] = res.data.data
        let hashMap: { [key: string]: TicketDetail[] } = {}

        // 根据场次对result进行分类
        result.forEach((v) => {
          let session = `${new Date(v.startTime).getTime()} ${v.cinemaId} ${v.hallId} ${v.movieId}`
          if (hashMap[session]) {
            hashMap[session].push(v)
          } else {
            hashMap[session] = [v]
          }
        })

        tickets.value = hashMap

        // 获取SideInfo
        let keys = Object.keys(tickets.value)
        let params = new URLSearchParams()
        keys.forEach((v) => params.append('sessionStr', v))

        axios
          .get('/api/Ticket/info', { params: params })
          .then((res) => {
            if (res.data.status && res.data.status === '10000') {
              ticketSideInfo.value = res.data.data
              loadFinished.value = true
              loading.close()
            } else {
              ElMessage({
                message: `请求订单信息失败：${res.data.message}`,
                type: 'warning'
              })
            }
          })
          .catch(() => {
            ElMessage({
              message: `请求订单信息失败：网络错误`,
              type: 'warning'
            })
          })

        // 获取包含的电影
        let movieIdSet = new Set<string>()
        result.forEach((v) => movieIdSet.add(v.movieId))

        // 获取评论过的电影
        let movieIdParams = new URLSearchParams()
        movieIdSet.forEach((p) => movieIdParams.append('id', p))
        axios
          .get('/api/Comment/commented', { params: movieIdParams })
          .then((res) => {
            if (res.data.status && res.data.status === '10000') {
              let result: string[] = res.data.data
              result.forEach((v) => commentedMovies.value.add(v))
            } else {
              ElMessage({
                message: `请求评论信息失败：${res.data.message}`,
                type: 'warning'
              })
            }
          })
          .catch(() => {
            ElMessage({
              message: `请求评论信息失败：网络错误`,
              type: 'warning'
            })
          })
      } else {
        ElMessage({
          message: `请求订单信息失败：${res.data.message}`,
          type: 'warning'
        })
      }
    })
    .catch(() => {
      ElMessage({
        message: `请求订单信息失败：网络错误`,
        type: 'warning'
      })
    })
})

// const filters = ref(['open','closed'])
</script>

<template>
  <div class="content py-10">
    <div class="flex w-full">
      <div class="grow" />
      <div style="min-width: 900px">
        <el-card class="mx-10 px-5">
          <div class="flex items-center">
            <h2 class="text-red-500 text-2xl font-bold">订单列表</h2>
          </div>
          <!-- <div class="mt-4 mb-1 flex items-center">
            <span class="text-sm">筛选</span>
            <el-checkbox-group class="ml-3" v-model="filters">
              <el-checkbox-button label="open">未结束</el-checkbox-button>
              <el-checkbox-button label="closed">已结束</el-checkbox-button>
            </el-checkbox-group>
          </div> -->
        </el-card>
        <div v-if="loadFinished">
          <TicketComponent
            v-for="ts in Object.keys(tickets).sort().reverse()"
            :key="ts"
            :ticket="tickets[ts]"
            :sideInfo="ticketSideInfo[ts]"
            :commented="commentedMovies.has(tickets[ts][0].movieId)"
            class="mt-5"
          />
        </div>
      </div>
      <div class="grow" />
    </div>
  </div>
</template>

<style scoped></style>
