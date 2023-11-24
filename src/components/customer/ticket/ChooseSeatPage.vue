<script setup lang="ts">
import type { SessionDetail } from '@/models/QuickType/SessionDetail'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import Movie from '@/models/Movie'
import moment from 'moment'
import ChooseSeatView from '@/components/customer/ticket/ChooseSeatView.vue'
import SeatComponent from '@/components/customer/ticket/SeatComponent.vue'
import type { TicketDetail } from '@/models/QuickType/TicketDetail'
import SeatNumberComponent from '@/components/customer/ticket/SeatNumberComponent.vue'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()

const store = useStore()

const session = ref<SessionDetail>()
const movie = ref<Movie>(new Movie())
const seatStatus = ref<{ [key: number]: 'free' | 'sold' | 'selected' }>({})
const selectedSeat = ref<Set<number>>(new Set<number>())

onMounted(() => {
  axios
    .get('/api/Session/detail', {
      params: {
        movieId: route.params['movieId'],
        cinemaId: route.params['cinemaId'],
        hallId: route.params['hallId'],
        rawStartTime: route.params['startTime']
      }
    })
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        let result: {
          session: SessionDetail
          movie: Movie
        } = res.data.data
        session.value = result.session
        movie.value = result.movie
      } else {
        ElMessage({
          message: `请求场次信息失败：${res.data.message}`,
          type: 'warning'
        })
      }
    })
    .catch(() => {
      ElMessage({
        message: `请求场次信息失败：网络错误`,
        type: 'warning'
      })
    })

  axios
    .get('/api/Ticket/session', {
      params: {
        movieId: route.params['movieId'],
        cinemaId: route.params['cinemaId'],
        hallId: route.params['hallId'],
        rawStartTime: route.params['startTime']
      }
    })
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        let result: TicketDetail[] = res.data.data
        result.forEach((ticket) => {
          seatStatus.value[(ticket.row << 7) + ticket.col] = 'sold'
        })
      } else {
        ElMessage({
          message: `请求售票信息失败：${res.data.message}`,
          type: 'warning'
        })
      }
    })
    .catch(() => {
      ElMessage({
        message: `请求售票信息失败：网络错误`,
        type: 'warning'
      })
    })
})

const seatSelected = (row: number, col: number) => {
  seatStatus.value[(row << 7) + col] = 'selected'
  selectedSeat.value.add((row << 7) + col)
}

const seatCanceled = (row: number, col: number) => {
  delete seatStatus.value[(row << 7) + col]
  selectedSeat.value.delete((row << 7) + col)
}

const handleBuy = () => {
  if (selectedSeat.value.size === 0) {
    ElMessage({
      message: '您没有选择座位',
      type: 'warning'
    })
  }

  let form = new FormData()
  form.append('movieId', route.params['movieId'] as string)
  form.append('cinemaId', route.params['cinemaId'] as string)
  form.append('hallId', route.params['hallId'] as string)
  form.append('rawStartTime', route.params['startTime'] as string)
  selectedSeat.value.forEach((v) => form.append('seats', v.toString()))

  axios
    .post('/api/Ticket/buy', form)
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        router.push('/buy/success')
      } else {
        ElMessage({
          message: `购票失败：${res.data.message}`,
          type: 'warning'
        })
      }
    })
    .catch(() => {
      ElMessage({
        message: `购票失败：网络错误`,
        type: 'warning'
      })
    })
}
</script>

<template>
  <div class="content py-10">
    <div class="flex w-full">
      <div class="grow" />
      <div style="min-width: 900px">
        <el-card>
          <div class="flex items-center">
            <h2 class="text-red-500 text-2xl font-bold">场次信息</h2>
            <span class="ml-4 text-sm text-gray-400">请仔细核对场次的时间和地点信息</span>
          </div>
          <div class="mt-5 mb-3" v-if="session">
            <div class="flex items-center">
              <el-image
                :src="movie.postUrl"
                fit="contain"
                style="max-width: 80px; max-height: 150px"
              />
              <div class="ml-4">
                <div class="flex items-center">
                  <h2 class="text-xl font-bold">{{ movie.name }}</h2>
                  <h3 class="ml-3 text-sm">{{ session.language }}</h3>
                  <h3 class="ml-3 text-sm">{{ session.dimesion }}</h3>
                </div>
                <div class="flex mt-3">
                  <h2>{{ moment(session.startTime).format('LL') }}</h2>
                  <h2 class="ml-3">{{ session.hallLocatedAt.cinemaBelongTo.name }}</h2>
                  <h2 class="ml-3">{{ parseInt(session.hallLocatedAt.id) }}号厅</h2>
                </div>
                <div class="flex items-center mt-3">
                  <h2 class="text-2xl">
                    {{ moment(session.startTime).format('LT') }}-{{
                      moment(session.startTime).add(parseInt(movie.duration), 'm').format('LT')
                    }}
                  </h2>
                </div>
              </div>
              <div class="grow" />
              <div>
                <div class="text-right mr-5">
                  <h3 v-if="store.state.currentUser.vip">
                    <span v-if="selectedSeat.size > 0" class="text-sm text-gray-400 line-through">
                      {{ session.price * selectedSeat.size }}
                    </span>
                    <span class="ml-1 text-2xl">{{ session.price * selectedSeat.size * 0.5 }}</span>
                    元
                  </h3>
                  <h3 v-else>
                    <span class="text-2xl">{{ session.price * selectedSeat.size }}</span>
                    元
                  </h3>
                </div>
                <el-button
                  type="primary"
                  class="mr-5 mt-1"
                  :disabled="selectedSeat.size === 0"
                  @click="handleBuy"
                >
                  <span class="mx-6">立即购票</span>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
        <el-card
          class="mt-5"
          style="
            background-color: rgb(35, 40, 52);
            color: rgb(255 255 255);
            border: 0;
            transition-duration: 500ms;
          "
          v-if="session"
        >
          <div class="flex items-center">
            <h2 class="text-red-500 text-2xl font-bold">选择座位</h2>
          </div>
          <div class="mt-5 mb-3">
            <div class="text-center text-sm text-gray-400 my-5">荧幕</div>
            <div class="flex">
              <div class="grow" />
              <ChooseSeatView
                :session="session"
                :seats="seatStatus"
                @selected="seatSelected"
                @canceled="seatCanceled"
              />
              <div class="grow" />
            </div>
            <div class="text-center text-sm text-gray-400 mb-5">中轴线</div>
            <div class="mx-5 flex">
              <div class="flex items-center">
                <SeatComponent disabled />
                <span class="ml-2 text-sm text-gray-400">可选座位</span>
              </div>
              <div class="ml-5 flex items-center">
                <SeatComponent disabled status="selected" />
                <span class="ml-2 text-sm text-gray-400">已选座位</span>
              </div>
              <div class="ml-5 flex items-center">
                <SeatComponent disabled status="sold" />
                <span class="ml-2 text-sm text-gray-400">已售座位</span>
              </div>
            </div>
            <div class="mx-5 mt-8 flex" v-if="selectedSeat.size > 0">
              <div class="flex items-center">
                <span class="text-sm text-gray-400">已选座位</span>
                <el-space class="ml-5" wrap>
                  <SeatNumberComponent
                    v-for="s in selectedSeat"
                    :key="s"
                    :col="s & 127"
                    :row="s >> 7"
                  />
                </el-space>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="grow" />
    </div>
  </div>
</template>

<style scoped></style>
