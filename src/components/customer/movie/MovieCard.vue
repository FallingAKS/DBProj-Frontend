<script setup lang="ts">
import moment from 'moment'
import { useRouter } from 'vue-router'
import Movie from '@/models/Movie'

defineProps({
  movie: {
    type: Movie,
    required: true
  }
})

const router = useRouter()

const handleMovieClick = (movie: Movie) => {
  router.push(`/movie/${movie.movieId}`)
}
</script>

<template>
  <div class="movie-card">
    <div class="movie-card-image mx-auto">
      <el-image
        :src="movie.postUrl"
        fit="scale-down"
        style="width: 100%; height: 100%; vertical-align: middle"
      />
      <div class="movie-card-info">
        <h3 class="movie-card-title">{{ movie.name }}</h3>
        <!--        <p class="movie-card-duration">{{ movie.duration }}</p>-->
        <p class="movie-card-score">得分：{{ movie.score }}</p>
        <p class="movie-card-releaseDate">
          上映日期：{{ moment(movie.releaseDate).format('MM-DD') }}
        </p>
        <p class="movie-card-relmovalDate">
          下架日期：{{ moment(movie.removalDate).format('MM-DD') }}
        </p>
        <el-row>
          <el-tag v-for="(tag, index) in movie.tags?.split(',')" :key="index" class="movie-card-tag">
            {{ tag }}
          </el-tag>
        </el-row>
        <el-button type="primary" class="movie-card-button" @click="handleMovieClick(movie)"
          >查看详情
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.movie-card {
  display: flex;
  align-items: center;
}

.movie-card-image {
  position: relative;
  width: 200px;
  height: 280px;
}

.movie-card-info {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.movie-card-image:hover .movie-card-info {
  opacity: 1;
}

.movie-card-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}

.movie-card-duration {
  font-size: 16px;
  margin-bottom: 8px;
}

.movie-card-score {
  font-size: 16px;
  margin-bottom: 8px;
}
.movie-card-releaseDate {
  font-size: 15px;
  margin-bottom: 12px;
}

.movie-card-relmovalDate {
  font-size: 15px;
  margin-bottom: 12px;
}

.movie-card-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
.movie-card-button {
  margin-top: 16px;
  margin-bottom: 0px;
}
</style>