<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import tagSelect from '@/components/customer/movie/AttributeSelect.vue'
import type Movie from '@/models/Movie'
import axios from 'axios'
import MovieCard from '@/components/customer/movie/MovieCard.vue'
import { ElCard, ElLoading, ElMessage } from 'element-plus'

const tags = ref<string[]>([])
const selectedTags = ref<string[]>([])

const movies = ref<Movie[]>([])
const currentClass = ref('1') //表示当前处于正在热映还是即将上映,1表示正在热映，2表示即将上映
const onPlayMovies = ref<Movie[]>([])
const commingSoonMovies = ref<Movie[]>([])
const currentPage = ref(1)
const pageSize = ref(12) //一页展示的电影数量

const start = computed(() => (currentPage.value - 1) * pageSize.value)
const paginatedMovies = computed(() =>
  movies.value.slice(start.value, start.value + pageSize.value)
)

const orderType = ref('1') //电影排列按照什么排序,1为按照评分排序，2为按照时间排序

const searchText = ref('')

const tagSelected = (t: string[]) => {
  selectedTags.value = t
  updateMovies()
}





const orderMovie = () => {
  currentPage.value = 1
  if (orderType.value === '1') {
    //按评分排序
    movies.value = movies.value.sort((a, b) => {
      if (a.score === null) {
        return 1
      } else if (b.score === null) {
        return -1
      } else {
        return b.score - a.score
      }
    })
  } else if (orderType.value === '2') {
    //按时间排序
    movies.value = movies.value.sort((a, b) => {
      if (a.releaseDate === null) {
        return -1
      } else if (b.releaseDate === null) {
        return 1
      } else {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      }
    })
  }
}

const updateMoviesByTag = () => {
  // let params=new URLSearchParams()
  // selectedTags.value.forEach((v)=>{
  //   params.append('tags',v)
  // })
  // axios.get('/api/Movies/tags',{
  //   params: params
  // }).then((r)=>{
  //   if(r.data&&r.data.status==='10000'){
  //     movies.value=r.data.data
  //   }
  // })
  if (currentClass.value === '1') {
    movies.value = onPlayMovies.value.filter((movie) => {
      let flag = true
      selectedTags.value.forEach((tag) => {
        if (!movie.tags?.includes(tag)) {
          flag = false
        }
      })
      return flag
    })
  } else if (currentClass.value === '2') {
    movies.value = commingSoonMovies.value.filter((movie) => {
      let flag = true
      selectedTags.value.forEach((tag) => {
        if (!movie.tags?.includes(tag)) {
          flag = false
        }
      })
      return flag
    })
  }
  orderMovie()
}

const isOnPlay = (releaseDate: string | null, removalDate: string | null) => {
  if (releaseDate === null || removalDate === null) {
    return false
  }
  let now = new Date()
  let release = new Date(releaseDate)
  let removal = new Date(removalDate)
  return now.getTime() > release.getTime() && now.getTime() < removal.getTime()
}

const isCommingSoon = (releaseDate: string | null) => {
  if (releaseDate === null) {
    return false
  }
  let now = new Date()
  let release = new Date(releaseDate)
  return now.getTime() < release.getTime()
}

const handleSelect = (index: string) => {
  if (index === '1') {
    movies.value = onPlayMovies.value
    currentPage.value = 1
  } else if (index === '2') {
    movies.value = commingSoonMovies.value
    currentPage.value = 1
  }
  currentClass.value = index
  updateMoviesByTag()
}



const updateMoviesBySearch = () => {
  movies.value = movies.value.filter((movie) => {
    return movie.name.includes(searchText.value)
  })
}

const updateMovies = () => {
  updateMoviesByTag()
  // updateMoviesByYear()
  updateMoviesBySearch()
}

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

  const getAllTags = () => {
    axios.get('/api/Movies/tags/getAllTags').then((r) => {
      if (r.data && r.data.status === '10000') {
        tags.value = r.data.data
        callFinish()
      }else{
        callFinish()
        ElMessage({
          message:'获取标签失败',
          type:'error'
        })
      }
    }).catch(()=>{
      callFinish()
      ElMessage({
        message:`获取标签失败:网络错误`,
        type:'error'
      })
    })
  }

  const initMovies = () => {
    let allMovies = new Array<Movie>()
    axios.get('/api/Movies/tags').then((r) => {
      if (r.data && r.data.status === '10000') {
        allMovies = r.data.data
        if (allMovies.length) {
          allMovies.forEach((movie) => {
            if (isOnPlay(movie.releaseDate, movie.removalDate)) {
              onPlayMovies.value.push(movie)
            } else if (isCommingSoon(movie.releaseDate)) {
              commingSoonMovies.value.push(movie)
            }
          })
          if (currentClass.value === '1') {
            movies.value = onPlayMovies.value
          } else if (currentClass.value === '2') {
            movies.value = commingSoonMovies.value
          }
          orderMovie()
          callFinish()
        }
      }else{
        callFinish()
        ElMessage({
          message:'获取电影信息失败',
          type:'error'
        })
      }
    }).catch(()=>{
      callFinish()
      ElMessage({
        message:`获取电影信息失败:网络错误`,
        type:'error'
      })
    })
  }

  getAllTags()
  initMovies()
})
</script>

<template>
  <div class="content">
    <div class="flex">
      <div class="grow" />
      <div class="m-5" style="width: 1024px;">
        <el-card class="w-full my-5">
          <el-menu mode="horizontal" @select="handleSelect" default-active="1">
            <el-menu-item index="1">正在热映</el-menu-item>
            <el-menu-item index="2">即将上映</el-menu-item>
          </el-menu>
          <tagSelect @selected="tagSelected" :label="'类型'" :tags="tags"></tagSelect>
          <!-- <tagSelect @selected="yearSelected" :label="'年份'" :tags="years" ></tagSelect> -->
        </el-card>

        <el-card class="translucent-card w-full my-5">
          <el-row>
            <el-col :span="6">
              <el-radio-group v-model="orderType" class="ml-4" @change="orderMovie">
                <el-radio label="1">按评分排序</el-radio>
                <el-radio label="2">按时间排序</el-radio>
              </el-radio-group>
            </el-col>
            <el-col :span="8" />
            <el-col :span="7">
              <!-- 搜索框 -->
              <el-input placeholder="请搜索电影名称" v-model="searchText" class="mx-4">
                <template #prefix>
                  <el-icon class="el-input__icon"><search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="2">
              <el-button type="primary" class="ml-10" @click="updateMovies">搜索</el-button>
            </el-col>
          </el-row>
          <el-space class="mt-4" wrap style="display: flex; flex-wrap: wrap;">
            <div v-for="(movie, index) in paginatedMovies" :key="index" style="flex: 1 0 25%;">
              <div class="my-3">
                <MovieCard :movie="movie" />
                <div class="mt-3 text-center">{{ movie.name }}</div>
              </div>
            </div>
          </el-space>
          <el-col style="display: flex; justify-content: center">
            <el-pagination
              layout="prev,pager,next"
              :total="movies.length"
              v-model:page-size="pageSize"
              v-model:current-page="currentPage"
              background
            />
          </el-col>
        </el-card>
      </div>
      <div class="grow" />
    </div>
  </div>
</template>

<style scoped></style>
