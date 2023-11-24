<script setup lang="ts">
import { computed } from 'vue'
import { type SessionDetail } from '@/models/QuickType/SessionDetail'
import moment from 'moment'
import { useRouter } from 'vue-router'

const props = defineProps<{
  isMovie: boolean  
  activeSessionDate: string
  sessions: { [key: string]: SessionDetail[] }
}>()
const emits = defineEmits(['update:activeSessionDate'])

const router = useRouter()

const activeSessionDate_ = computed({
  get: () => props.activeSessionDate,
  set: (v) => emits('update:activeSessionDate', v)
})

const handleBuyTicket = (session: SessionDetail) => {
  router.push(
    `/buy/${session.movieId}/${session.cinemaId}/${session.hallId}/${new Date(
      session.startTime
    ).getTime()}`
  )
}
</script>

<template>
  <div class="my-5">
    <el-tabs v-model="activeSessionDate_" v-if="Object.keys(sessions).length > 0">
      <el-tab-pane
        v-for="(dt, i) in sessions"
        :key="i"
        :label="moment(i).format('MM-DD')"
        :name="i"
      >
        <div v-for="(s, j) in dt" :key="j" class="pt-2">
          <div class="flex items-center ">
            <h3 class="text-xl">{{ moment(s.startTime).format('HH:mm') }}</h3>
            <h3 class="text-xl"> -- </h3>
            <h3 class="text-xl">{{ moment(s.endTime).format('HH:mm') }}</h3>
            <h3 class="ml-5">{{ s.movieName }}</h3>
            <h3 class="ml-5">{{ parseInt(s.hallLocatedAt.id) }}号厅</h3>
            <el-space wrap size="small">
              <el-tag v-for="tag,index in s.hallLocatedAt.hallType.split(',')" :key="index" >
                {{ tag }}
              </el-tag>
            </el-space>
            <h3 class="ml-5">{{ s.language }}</h3>
            <h3 class="ml-5">{{ s.dimesion }}</h3>
            <div class="grow" />
            <h3 class="text-xl">￥{{ s.price }}</h3>
            <el-button class="ml-5" type="primary" @click="handleBuyTicket(s)">购票</el-button>
          </div>
          <el-divider />
        </div>
      </el-tab-pane>
    </el-tabs>
    <div v-else class="my-28 text-center">
      <h3 v-if="isMovie">很抱歉，该影片当前暂无排片</h3>
      <h3 v-else>很抱歉，影院当前暂无排片</h3>
    </div>
  </div>
</template>
