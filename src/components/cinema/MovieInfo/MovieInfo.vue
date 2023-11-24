<script setup lang="ts">
import axios from 'axios';
import { ElMessageBox, ElMessage } from 'element-plus'
import { onMounted, ref,computed } from 'vue'
import { useStore } from 'vuex'
import MovieInHall from '@/models/MovieInHall'
import Movie from '@/models/Movie';
import Hall from '@/models/Hall';
import Cinema from '@/models/Cinema';
import Session from '@/models/Session';

const store = useStore()
const dialogTitle = ref('电影排片')
let movieInHall = ref(new Array<MovieInHall>())
let movieDetail = ref(new Movie)
let selectedMovieId = ref('')
let valueTime = ref('')
let currentHall = ref('')
let price = ref(0)
let language = ref('')
let dimension = ref('')
let halls = ref(new Array<Hall>())
let cinema = ref(new Cinema())
let sessions = ref(new Array<Session>())

const languages = [
  {
    value: '国语',
  },
  {
    value: '英语',
  },
  {
    value: '日语',
  },
  {
    value: '韩语',
  },
  {
    value: '法语',
  },
]
const dimensions = [
  {
    value: '2D',
  },
  {
    value: '3D',
  },
  {
    value: '4D',
  },
  {
    value: '5D',
  },
]

const updateSession = () => {
  axios
    .get(`/api/Session?cinema_id=${cinema.value.cinemaId}&hall_id=${currentHall.value}`)
    .then((res) => {
      if (res.data && res.data.status && res.data.status === '10000') {
        sessions.value = res.data.data
        // console.log(res.data.data)
        // console.log(sessions.value)
      }
      else if (res.data && res.data.status && res.data.status === '40004') {
        sessions.value = res.data.data
        ElMessage({
          type: 'warning',
          message: '当前影厅下无排片！'
        })
      }
      else {
        console.log(res.data)
        ElMessage({
          type: 'error',
          message: '获取排片信息失败'
        })
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessageBox.alert('数据加载失败！', '错误', {
        // if you want to disable its autofocus
        // autofocus: false,
        confirmButtonText: 'OK',
        callback: () => {
          ElMessage.error('数据加载错误')
        }
      })
    })
}
const updateMoviesInHall = () => {
  axios
    .get(`/api/Movies/noremoval`)
    .then((res) => {
      if (res.data && res.data.status && res.data.status === '10000') {
        movieInHall.value = res.data.data
      }
      else {
        console.log(res.data)
        ElMessage({
          type: 'error',
          message: '获取影院内所有电影信息失败'
        })
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessageBox.alert('数据加载失败！', '错误', {
        // if you want to disable its autofocus
        // autofocus: false,
        confirmButtonText: 'OK',
        callback: () => {
          ElMessage.error('数据加载错误')
        }
      })
    })
}
const GetHallsByMID = function (ManagerID: string) {
  return new Promise((resolve, reject) => {
    axios
      .get('/api/Hall/manager/' + ManagerID + '/halls', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(
        res => {
          if (res.data && res.data.status && res.data.status == '10000') {
            halls.value = res.data.data
            console.log(halls.value)
          }
          else {
            console.log(res.data)
            ElMessage({
              type: 'error',
              message: '获取影厅信息失败'
            })
          }
          resolve(res.data)
        }
      )
      .catch((err) => {
        console.log(err)
        ElMessage({
          type: 'error',
          message: '获取影厅信息失败'
        })
        reject(err)
      })
  })
}
const GetCinemaByMID = function (ManagerID: string) {
  return new Promise((resolve, reject) => {
    axios
      .get('/api/Hall/manager/' + ManagerID + '/cinemas', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(
        res => {
          if (res.data && res.data.status && res.data.status == '10000') {
            cinema.value = res.data.data[0]
            console.log(cinema.value)
          }
          else {
            console.log(res.data)
            ElMessage({
              type: 'error',
              message: '获取影院信息失败'
            })
          }
          resolve(res.data)
        }
      )
      .catch((err) => {
        console.log(err)
        ElMessage({
          type: 'error',
          message: '获取影院信息失败'
        })
        reject(err)
      })
  })
}
const updateMovieDetail = (id: string) => {
  selectedMovieId.value = id;
  axios
    .get(`/api/Movies/detail/${id}`)
    .then((res) => {
      if (res.data && res.data.status && res.data.status === '10000') {
        movieDetail.value = res.data.data
        console.log(res.data.data)
        console.log(movieInHall.value)
      }
      else {
        console.log(res.data)
        ElMessage({
          type: 'error',
          message: '获取影院内所有电影信息失败'
        })
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessageBox.alert('数据加载失败！', '错误', {
        // if you want to disable its autofocus
        // autofocus: false,
        confirmButtonText: 'OK',
        callback: () => {
          ElMessage.error('数据加载错误')
        }
      })
    })
}
const sessionAdd = async function () {
  if (cinema.value && cinema.value.cinemaId == '') {
    ElMessage({
      type: 'error',
      message: '影院信息不存在'
    })
    return
  }
  if (selectedMovieId.value == '') {
    ElMessage({
      type: 'error',
      message: '请在左侧栏选中要排片的电影'
    })
    return
  }
  if (currentHall.value == '') {
    ElMessage({
      type: 'error',
      message: '请选择影厅'
    })
    return
  }
  if (valueTime.value == '') {
    ElMessage({
      type: 'error',
      message: '请选择电影放映时间'
    })
    return
  }
  if (language.value == '') {
    ElMessage({
      type: 'error',
      message: '请输入语言'
    })
    return
  }
  if (dimension.value == '') {
    ElMessage({
      type: 'error',
      message: '请输入电影维度'
    })
    return
  }
  const date = new Date(valueTime.value);
  date.setUTCHours(date.getUTCHours() + 8); // 将小时增加8个小时
  const updatedDateString = date.toISOString();

  let jsonObject = {
    movieId: selectedMovieId.value,
    cinemaId: cinema.value.cinemaId,
    hallId: currentHall.value,
    startTime: updatedDateString,
    attendence: 0,
    price: price.value,
    language: language.value,
    dimesion: dimension.value
  }
  const newSession = new Session(JSON.parse(JSON.stringify(jsonObject)))
  console.log(newSession)
  axios
    .put('/api/Session', newSession)
    .then((res) => {
      if (res.data && res.data.status && res.data.status == '10000') {
        updateSession()
        ElMessage({
          type: 'success',
          message: dialogTitle.value.slice(4) + '成功'
        })
      }
      else if (res.data && res.data.status && res.data.status == '40001') {
        updateSession()
        ElMessage({
          type: 'error',
          message: '影厅不存在'
        })
      }
      else if (res.data && res.data.status && res.data.status == '40002') {
        updateSession()
        ElMessage({
          type: 'error',
          message: '电影不存在'
        })
      }
      else if (res.data && res.data.status && res.data.status == '40003') {
        updateSession()
        ElMessage({
          type: 'error',
          message: '排片时间不在电影上映时间内或在过去时间段内'
        })
      }
      else if (res.data && res.data.status && res.data.status == '40004') {
        updateSession()
        ElMessage({
          type: 'error',
          message: '该时间段已被排片'
        })
      }
      else {
        console.log(res.data)
        ElMessage({
          type: 'error',
          message: dialogTitle.value.slice(4) + '失败'
        })
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessage({
        type: 'error',
        message: dialogTitle.value.slice(4) + '失败'
      })
    })
}
const filterPictureData = computed(() => {
  return (movieId: string) => {
    for (let i = 0; i < movieInHall.value.length; i++) {
      if (movieInHall.value[i].movieId === movieId) {
        return movieInHall.value[i].postUrl!;
      }
    }
    return '';
  };
});
const filterNameData = computed(() => {
  return (movieId: string) => {
    for (let i = 0; i < movieInHall.value.length; i++) {
      if (movieInHall.value[i].movieId === movieId) {
        return movieInHall.value[i].name!;
      }
    }
    return '';
  };
});
const filterDurationData = computed(() => {
  return (movieId: string, startTime: Date) => {
    for (let i = 0; i < movieInHall.value.length; i++) {
      if (movieInHall.value[i].movieId === movieId) {
        const duration = parseInt(movieInHall.value[i].duration, 10);
        const endTime = new Date(startTime);
        endTime.setUTCMinutes(endTime.getUTCMinutes() + duration);
        return endTime.toLocaleString();
      }
    }
    return 0;
  };
});

const updateCurrentHall = () => {
  console.log(currentHall.value)
  updateSession()
}

onMounted(() => {
  updateMoviesInHall()
  // selectedMovieId.value=movieInHall.value[0].movieId
  // updateMovieDetail(selectedMovieId.value)
  GetHallsByMID(store.state.currentUser.id)
  GetCinemaByMID(store.state.currentUser.id)
});
</script>

<template>
  <h1 class="text-2xl font-bold">排片管理</h1>
  <el-divider />

  <el-container style="height: 80vh">

    <el-aside width="250px">
      <el-scrollbar>
        <el-menu>
          <el-menu-item-group>
            <template #title>
              <span style="font-size: 18px;">电影列表</span>
            </template>
            <el-menu-item v-for="movie in movieInHall" :key="movie.movieId"
              :class="{ 'highlighted': selectedMovieId === movie.movieId }" @click="updateMovieDetail(movie.movieId)">
              <div class="movie-item">
                <img :src="movie.postUrl" />
                <div class="movie-name">{{ movie.name }}</div>
              </div>
            </el-menu-item>
          </el-menu-item-group>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-container>
        <el-aside style="width: auto;margin-left: 20px;">
          <h3 class="text-xl">电影排片</h3>
          <div class="demo-datetime-picker">
            <div class="block">
              电影开始时间&nbsp;&nbsp;
              <el-date-picker v-model="valueTime" type="datetime" placeholder="请选择日期和时间" size="large"
                style="width: 200px;" />
              <br>
              &nbsp;&nbsp;电影影厅选择
              <el-select v-model="currentHall" class="m-2" placeholder="请选择影厅" size="large" style="width: 200px;"
                @change="updateCurrentHall">
                <el-option v-for="item in halls" :key="item.hallID" :label="parseInt(item.hallID, 10)+' 号影厅'" :value="item.hallID" />
              </el-select>
              <br>

              &nbsp;&nbsp;&nbsp;电影价格
              <el-input-number v-model="price" :precision="2" :step="0.1" :min="1" :max="1000" style="width: 146px;"
                size="large" class="m-2" />
              &nbsp;元
              <br>

              &nbsp;&nbsp;&nbsp;&nbsp;电影语言
              <el-select v-model="language" class="m-2" placeholder="请选择语言" size="large" style="width: 120px;">
                <el-option v-for="item in languages" :key="item.value" :label="item.value" :value="item.value" />
              </el-select>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <br>
              &nbsp;&nbsp;&nbsp;&nbsp;电影维度
              <el-select v-model="dimension" class="m-2" placeholder="请选择维度" size="large" style="width: 120px;">
                <el-option v-for="item in dimensions" :key="item.value" :label="item.value" :value="item.value" />
              </el-select>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <br>
              <div style="text-align: right;">
                <el-button type="primary" @click="sessionAdd">确定</el-button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
            </div>
          </div>
        </el-aside>        
        <el-divider direction="vertical" />
        <el-container>
          <el-header style="height: 200px;">
            <h3 class="text-xl">&nbsp;&nbsp;&nbsp;&nbsp;电影相关数据</h3>
            <br>
            <el-row justify="center">
              <el-col :span="10" class="statistic_bgcolor">
                <el-statistic title="电影名" :value="movieDetail.name" size="small" />
              </el-col>
              <el-col :span="4" class="statistic_bgcolor">
                <el-statistic title="时长" :value="movieDetail.duration + ' 分钟'" />
              </el-col>
              <el-col :span="6" class="statistic_bgcolor">
                <el-statistic title="标签" :value="movieDetail.tags" />
              </el-col>
            </el-row>
            <br>
            <el-row justify="center">
                <el-col :span="4" class="statistic_bgcolor">
                  <el-statistic title="评分" :value="movieDetail.score? movieDetail.score:'暂无评分'" />
                </el-col>
                <el-col :span="8" class="statistic_bgcolor">
                  <el-statistic title="上映日期" :value="movieDetail.releaseDate?new Date(movieDetail.releaseDate).toLocaleString():''" />
                </el-col>
                <el-col :span="8" class="statistic_bgcolor">
                  <el-statistic title="下映日期" :value="movieDetail.removalDate?new Date(movieDetail.removalDate).toLocaleString():''" />
                </el-col>
            </el-row>
            <br>
          </el-header>
          <el-main style="width: auto;margin-left: 24px;height: 8px;">
            <h3 class="text-xl">电影简介</h3>
            <div style="margin: 10px;">{{ movieDetail.instruction }}</div>

          </el-main>
        </el-container>
      </el-container>
      <el-divider />
      <el-footer style=" height: 290px;">
        <span style="font-size: 2.2ch;">影厅排片情况&nbsp;&nbsp;&nbsp;</span>
        <el-select v-model="currentHall" class="m-2" placeholder="请选择影厅" @change="updateCurrentHall">
          <el-option v-for="item in halls" :key="item.hallID" :label="parseInt(item.hallID, 10) + ' 号影厅'" :value="item.hallID" />
        </el-select>
        <el-scrollbar>
          <div class="scrollbar-flex-content">
            <div v-for="session in sessions" :key="session.movieId" class="scrollbar-item">
              <el-image style="height: 140px;object-fit: scale-down;" :src="filterPictureData(session.movieId)" />              
              <div><b>{{ filterNameData(session.movieId) }}</b></div>
              <div style="font-size: small;">{{ new Date(session.startTime).toLocaleString() }}<br>至</div>
              <div style="font-size: small;">{{ filterDurationData(session.movieId, session.startTime) }}</div>
            </div>
            </div>
        </el-scrollbar>
      </el-footer>
    </el-container>
  </el-container>
</template>

<style>
.scrollbar-flex-content {
  display: flex;
}

.scrollbar-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: auto;
  text-align: center;
  margin: 10px;
}

.scrollbar-item img {
  height: 17vh;
}

/* 侧边栏 */
.el-menu--vertical:not(.el-menu--collapse):not(.el-menu--popup-container) .el-menu-item {
  padding: 0;
  margin-left: 12px;
  margin-right: 18px;
  height: auto;
}

.movie-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.movie-item img {
  width: 100%;
  margin-bottom: 5px;
}

.movie-name {
  line-height: normal;
  text-align: center;
}

.disabled-el-menu-item {
  pointer-events: none;
  /* 禁用鼠标事件 */
  cursor: default;
  /* 修改鼠标样式为默认 */
}

.disabled-el-menu-item a {
  color: inherit;
  /* 保持原本的颜色 */
  text-decoration: none;
  /* 去掉链接下划线样式 */
}

.highlighted {
  background-color: #c7deed;
  /* 自定义被选中项的背景颜色 */
}
</style>

<style scoped>
.demo-datetime-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}

.demo-datetime-picker .block {
  padding-top: 20px;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
}

.demo-datetime-picker .block:last-child {
  border-right: none;
}

.demo-datetime-picker .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}
</style>