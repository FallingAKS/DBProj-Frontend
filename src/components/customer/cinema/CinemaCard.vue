<script setup lang="ts">
import {useRouter} from "vue-router";
import Cinema from "@/models/Cinema";
import moment from "moment/moment";
defineProps({
  cinema:{
    type:Cinema,
    required:true
  }
})

const router = useRouter()

const handleCinemaClick=(cinema:Cinema)=>{
  router.push(`/cinema/${cinema.cinemaId}`)
}
</script>

<template>
  <div class="cinema-card">
    <div class="cinema-card-image mx-2.5">
      <el-image
        :src="cinema.cinemaImageUrl"
        fit="cover"
        style="width:100%;height: 100%;vertical-align: middle"
      />
      <div class="cinema-card-info">
        <h3 class="cinema-card-title">{{ cinema.name }}</h3>
        <p class="cinema-card-location">{{cinema.location}}</p>

        <el-row>
          <el-tag v-for="(tag, index) in cinema.feature.split(',')" :key="index" class="cinema-card-tag">
            {{ tag }}
          </el-tag>
        </el-row>
        <el-button type="primary" class="cinema-card-button" @click="handleCinemaClick(cinema)"
        >查看详情
        </el-button>
      </div>
    </div>
  </div>

</template>

<style scoped>
.cinema-card {
  display: flex;
  align-items: center;
}

.cinema-card-image {
  position: relative;
  width: 200px;
  height: 280px;
}

.cinema-card-info{
  position: absolute;
  top:0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  color: #fff;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.cinema-card-title {
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 16px;
}

.cinema-card-location{
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 50px;
}

.cinema-card-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
.cinema-card-image:hover .cinema-card-info{
  opacity: 1;
}

.cinema-card-button{
  margin-top:16px;
  margin-bottom: 0;
}

</style>