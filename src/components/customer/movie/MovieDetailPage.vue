<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { type MovieDetail } from '@/models/QuickType/MovieDetail'
import { useRoute, useRouter } from 'vue-router'
import { ElCard, ElLoading, ElMessage } from 'element-plus'
import ColorThief from 'color-thief-ts'
import tinygradient from 'tinygradient'
import type { SessionDetail } from '@/models/QuickType/SessionDetail'
import CommentCard from '@/components/customer/comment/CommentCard.vue'
import type { Comment, CommentData } from '@/models/QuickType/CommentData'
import { useStore } from 'vuex'
import Interaction from '@/models/interaction'
import MovieSessionsCard from '@/components/customer/movie/MovieSessionsCard.vue'

const route = useRoute()
const store = useStore()
const movie = ref<MovieDetail>({
  movieId: '',
  name: '',
  duration: '',
  instruction: '',
  score: 0,
  postUrl: '',
  tags: '',
  releaseDate: new Date(),
  removalDate: new Date(),
  acts: [],
  comments: [],
  sessions: []
})
const sessions = ref<{ [key: string]: SessionDetail[] }>({})
const comments = ref<{ [key: string]: Comment }>({})
const commentIndex = ref<{ hotComments: string[]; newComments: string[] }>({
  hotComments: [],
  newComments: []
})
const interactions = ref<{ [key: string]: Interaction }>({})

onMounted(async () => {
  let domImg = document.querySelector('#poster') as HTMLImageElement
  domImg.crossOrigin = ''

  const loading = ElLoading.service({
    lock: true,
    text: '加载中',
    fullscreen: true
  })

  let finished = 0
  const callFinish = () => {
    finished += 1
    if (finished >= 3) {
      loading.close()
    }
  }

  axios
    .get(`/api/Movies/detail/${route.params.movieId}`)
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        movie.value = res.data.data

        // 预处理数据，把导演移到最前
        let directorIndex = movie.value.acts.findIndex((a) => a.role == '1')
        if (directorIndex >= 0) {
          let director = movie.value.acts.splice(directorIndex, 1)
          movie.value.acts.unshift(director[0])
        }
        callFinish()
      } else {
        ElMessage({
          message: `请求电影信息失败：${res.data.message}`,
          type: 'warning'
        })
      }
    })
    .catch(() => {
      ElMessage({
        message: `请求电影信息失败：网络错误`,
        type: 'warning'
      })
    })

  axios
    .get(`/api/Session/movie/${route.params.movieId}`)
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        sessions.value = res.data.data
        activeSessionDate.value = Object.keys(sessions.value)[0]
        callFinish()
      } else {
        ElMessage({
          message: `请求排片信息失败：${res.data.message}`,
          type: 'warning'
        })
      }
    })
    .catch(() => {
      ElMessage({
        message: `请求排片信息失败：网络错误`,
        type: 'warning'
      })
    })

  axios
    .get(`/api/Comment/inMovieDetail/${route.params.movieId}`)
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        let rawComments: CommentData = res.data.data
        rawComments.hotComments.forEach((v) => {
          if (!comments.value[v.commentId]) {
            comments.value[v.commentId] = v
          }
          commentIndex.value.hotComments.push(v.commentId)
        })
        rawComments.newComments.forEach((v) => {
          if (!comments.value[v.commentId]) {
            comments.value[v.commentId] = v
          }
          commentIndex.value.newComments.push(v.commentId)
        })

        if (store.state.currentUser.type === 'Customer') {
          let commentIdSet = Object.keys(comments.value)
          axios
            .post(`/api/Interaction/get`, Array.from(commentIdSet))
            .then((res) => {
              if (res.data.status && res.data.status === '10000') {
                let result: Interaction[] = res.data.data
                result.forEach((v) => {
                  if (!interactions.value[v.commentId]) {
                    interactions.value[v.commentId] = v
                  }
                })
              } else {
                ElMessage({
                  message: `请求评论交互信息失败：${res.data.message}`,
                  type: 'warning'
                })
              }
            })
            .catch(() => {
              ElMessage({
                message: `请求评论交互信息失败：网络错误`,
                type: 'warning'
              })
            })
        }
        callFinish()
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
})

function getImageBrightness(imgElement: HTMLImageElement, callback: (brightness: number) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = imgElement.width
  canvas.height = imgElement.height

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(imgElement, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  let r, g, b, avg

  let colorSum = 0
  for (let x = 0, len = data.length; x < len; x += 4) {
    r = data[x]
    g = data[x + 1]
    b = data[x + 2]

    avg = Math.floor((r + g + b) / 3)
    colorSum += avg
  }

  const brightness = Math.floor(colorSum / (imgElement.width * imgElement.height))
  callback(brightness)
}

const posterCardBackground = ref('white')
const posterCardFontColor = ref('white')

const posterLoaded = () => {
  let domImg = document.querySelector('#poster') as HTMLImageElement
  let colorThief = new ColorThief()
  let colors = colorThief.getPalette(domImg, 2)
  colors = [colors[0], colors[1]]
  let gradients = tinygradient(colors.map((v) => v.toString()))
  posterCardBackground.value = gradients.css()
  getImageBrightness(domImg, (brightness) => {
    if (brightness > 155) {
      posterCardFontColor.value = 'black'
    }
  })
}

const activeSessionDate = ref('0')

const router = useRouter()
const handleStaffDetail = (staffId: string) => {
  console.log("test")
  router.push(`/staff/${staffId}`)
}
const commentInteraction = (commentId: string, type: number) => {
  let backup: [Comment, Interaction | undefined] = [
    comments.value[commentId],
    interactions.value[commentId]
  ]
  if (!interactions.value[commentId]) {
    interactions.value[commentId] = new Interaction(commentId)
  }
  if (backup[1] && backup[1]?.type >= 0) {
    if (backup[1] && backup[1]?.type === 0) {
      comments.value[commentId].dislikeCount -= 1
    } else {
      comments.value[commentId].likeCount -= 1
    }
  }
  if (type === 1) {
    comments.value[commentId].likeCount += 1
  } else if (type === 0) {
    comments.value[commentId].dislikeCount += 1
  }
  interactions.value[commentId].type = type
  axios
    .post('/api/Interaction', interactions.value[commentId])
    .then((res) => {
      if (res.data.status && res.data.status === '10000') {
        /* empty */
      } else {
        ElMessage({
          message: `评论交互操作失败：${res.data.message}`,
          type: 'warning'
        })
        comments.value[commentId] = backup[0]
        if (backup[1]) {
          interactions.value[commentId] = backup[1]!
        } else {
          delete interactions.value[commentId]
        }
      }
    })
    .catch(() => {
      ElMessage({
        message: `评论交互操作失败：网络错误`,
        type: 'warning'
      })
      comments.value[commentId] = backup[0]
      if (backup[1]) {
        interactions.value[commentId] = backup[1]!
      } else {
        delete interactions.value[commentId]
      }
    })
}

const pickSessionsDialogOpen = ref(false)
</script>

<template>
  <div class="content py-10" >
    <div class="flex w-full">
      <div class="grow" />
      <div style="width: 1200px;">
          <el-card class="mx-10 my-5 poster-card">
            <div class="poster-card-background" :style="`background: ${posterCardBackground};`" />
            <div class="poster-card-content flex">
              <div class="movie-poster basis-3/10">
                <img id="poster" class="w-full" :src="movie.postUrl ?? ''" :alt="movie.name" object-fit="cover" @load="posterLoaded" />
              </div>
              <div class="ml-5 py-5" :style="`color: ${posterCardFontColor}`">
                <h1 class="text-4xl font-extrabold">{{ movie.name }}</h1>
                <h2 class="mt-5">时长：{{ movie.duration }}分钟</h2>
                <h2 class="mt-1 mb-5" v-if="movie.acts.length > 0 && movie.acts[0].role === '1'">
                  导演：{{ movie.acts[0].staff.name }}
                </h2>
                <h2
                  class="my-3"
                  v-html="`简介：<br> ${movie.instruction?.replace('\n', '<br/>')} `"
                />
                <h2 class="my-3">观众评分：{{ movie.score ?? '暂无评分' }}</h2>
                <div class="my-10">
                  <el-button color="#FFA500" @click="pickSessionsDialogOpen = true">
                    <span class="m-5">选座购票</span>
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
          <div>
            <el-card class="mx-10 my-5 px-5" >
              <div class="flex items-center">
                <h2 class="text-red-500 text-2xl font-bold">演职员</h2>
              </div>
              <div class="my-5 pt-1">
                <el-space size="large" wrap>
                  <div v-for="act in movie.acts" :key="act.staffId" 
                  @click="handleStaffDetail(act.staffId)" class="cursor-pointer">
                    <el-image
                      :src="act.staff.imageUrl"
                      fit="contain"
                      style="height: 200px; width: 140px"
                    />
                    <div class="text-center">
                      <h3>{{ act.staff.name }}</h3>
                      <h3 class="text-gray-400">{{ act.role === '1' ? '导演' : '演员' }}</h3>
                    </div>
                  </div>
                </el-space>
              </div>
            </el-card>
          </div>
          <el-card class="mx-10 my-5 px-5" >
            <div class="flex items-center">
              <h2 class="text-red-500 text-2xl font-bold">近期场次</h2>
              <div class="grow" />
              <!-- <el-button link>全部</el-button> -->
              <!--这个是假按钮-->
            </div>
            <MovieSessionsCard
              v-model:active-session-date="activeSessionDate"
              :sessions="sessions"
            />
          </el-card>
          <el-card class="mx-10 my-5 px-5">
            <div class="flex items-center">
              <h2 class="text-red-500 text-2xl font-bold">评论</h2>
            </div>
            <div class="my-5">
              <div>
                <h3 class="text-xl font-bold">最热评论</h3>
                <div class="w-full my-5">
                  <CommentCard
                    class="mb-5"
                    v-for="c in commentIndex.hotComments"
                    :key="comments[c]"
                    :comment="comments[c]"
                    :interaction="interactions[c]"
                    @Interact="commentInteraction"
                  />
                </div>
              </div>
            </div>
            <div class="my-5">
              <div>
                <h3 class="text-xl font-bold">最新评论</h3>
                <div class="w-full my-5">
                  <CommentCard
                    class="mb-5"
                    v-for="c in commentIndex.newComments"
                    :key="comments[c]"
                    :comment="comments[c]"
                    :interaction="interactions[c]"
                    @Interact="commentInteraction"
                  />
                </div>
              </div>
            </div>
          </el-card>
      </div>
      <div class="grow" />
    </div>
  </div>
  <el-dialog v-model="pickSessionsDialogOpen" title="选择场次" width="800px" align-center>
    <MovieSessionsCard :sessions="sessions" v-model:active-session-date="activeSessionDate" />
  </el-dialog>
</template>

<style scoped lang="scss">
.movie-poster {
  max-width: 300px;
  min-width: 280px;
}

.poster-card {
  position: relative;
  border: 0;
}

.poster-card-background {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
}

.poster-card-content {
  position: relative;
  z-index: 1;
}
</style>
