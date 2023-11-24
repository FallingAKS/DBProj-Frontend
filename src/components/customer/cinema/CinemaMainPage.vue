<script setup lang="ts">
import {onMounted, ref, computed} from "vue";
import tagSelect from "@/components/customer/movie/AttributeSelect.vue"
import axios from "axios";
import type Cinema from "@/models/Cinema";
import CinemaCard from "./CinemaCard.vue";
import AreaSelect from "@/helpers/AreaSelect.vue";
const tags=ref<string[]>([])
const selectedTags=ref([])

const cinemas=ref<Cinema[]>([])
const allCinemas=ref<Cinema[]>([])
const currentPage=ref(1)
const pageSize=ref(12) //一页展示的影院数量
const start = computed(() => (currentPage.value - 1) * pageSize.value);
const paginatedCinemas = computed(() => cinemas.value.slice(start.value, start.value + pageSize.value));
const AreaSelected=ref('')
const searchText=ref('')

const tagSelected=(t)=>{
  selectedTags.value=t
  updateCinemasByTag()
}

const getAllTags=()=>{
  axios.get('/api/Cinema/features').then((r)=>{
    if (r.data&&r.data.status==='10000'){
      tags.value=r.data.data
    }
  })
}

const initCinemas=()=>{
  axios.get('/api/Cinema/all').then((r)=>{
     if(r.data&&r.data.status&&r.data.status==='10000'){
       cinemas.value=r.data.data
       allCinemas.value=r.data.data
       console.log(allCinemas.value[0])
     }
  })
}


const updateCinemasByTag=()=>{
  console.log(cinemas.value)
  cinemas.value=allCinemas.value.filter((cinema)=>{
    let flag=true
    selectedTags.value.forEach((tag)=>{
      if(!cinema.feature.includes(tag)){
        flag=false
      }
    })
    return flag
  })
  cinemas.value = cinemas.value.filter((cinema) => {
    return cinema.location.includes(AreaSelected.value)
  })
  cinemas.value=cinemas.value.filter((cinema)=>{
    return cinema.name.includes(searchText.value)
  })
}




const updateCinemasBySearch=()=>{
  cinemas.value=allCinemas.value.filter((cinema)=>{
    return cinema.name.includes(searchText.value)
  })
  cinemas.value=cinemas.value.filter((cinema)=>{
    let flag=true
    selectedTags.value.forEach((tag)=>{
      if(!cinema.feature.includes(tag)){
        flag=false
      }
    })
    return flag
  })
  cinemas.value = cinemas.value.filter((cinema) => {
    return cinema.location.includes(AreaSelected.value)
  })
}

const areaSelected = (selectedOptions:  string) => {
  AreaSelected.value = selectedOptions
  console.log('所选地区为', AreaSelected)
  //AreaSelected.value = AreaSelected.value.slice(0, 3)//由于地区设置问题只保留省份
  cinemas.value = allCinemas.value.filter((cinema) => {
    return cinema.location.includes(AreaSelected.value)
  })
  cinemas.value = cinemas.value.filter((cinema) => {
    let flag = true
    selectedTags.value.forEach((tag) => {
      if (!cinema.feature.includes(tag)) {
        flag = false
      }
    })
    return flag
  })
  cinemas.value=cinemas.value.filter((cinema)=>{
    return cinema.name.includes(searchText.value)
  })
}

onMounted(()=>{
  initCinemas()
  getAllTags()
})
</script>

<template>
  <div class="content">
    <div class="py-10" style="">
      <div style="flex-grow: 1" />
      <div class="mx-5" style="">
        <el-row >
          <el-col :span="4"/>
          <el-col :span="16" class="translucent-card">
            <el-card>
              <el-row>
                <div style="display: flex; align-items: center;">
                  <div style="display: flex; align-items:center;">
                    <label for="area-select" class="mx-5" style="color: darkblue;">地区</label>
                    <AreaSelect id="area-select" @selected="areaSelected" style="margin-right: 350px;"></AreaSelect>
                  </div>
                  <div style="display: flex; align-items: center;">
                    <!-- 搜索框 -->
                    <el-input placeholder="请搜索影院名称" v-model="searchText" class="ml-10">
                      <template #prefix>
                        <el-icon class="el-input__icon"><search /></el-icon>
                      </template>
                    </el-input>
                    <el-button type="primary" class="mx-2.5" @click="updateCinemasBySearch">搜索</el-button>
                  </div>
                </div>
              </el-row>
              <tagSelect @selected="tagSelected" :label="'类型'" :tags="tags"></tagSelect>
            </el-card>
          </el-col>
          <el-col :span="4"/>
        </el-row>
      </div>
      <div class="m-5 ">
        <el-row>
          <el-col :span="4"/>
          <el-col :span="16">
            <el-card class="translucent-card">
              <el-space wrap>
                <div v-for="(cinema, index) in paginatedCinemas" :key="index">
                  <div class="my-3">
                    <CinemaCard :cinema="cinema" />
                    <div class="mt-3 text-center">{{ cinema.name }}</div>
                  </div>
                </div>
              </el-space>
              <el-col style="display:flex;justify-content:center;">
                <el-pagination
                    layout="prev,pager,next"
                    :total="cinemas.length"
                    v-model:page-size="pageSize"
                    v-model:current-page="currentPage"
                    background
                />
              </el-col>
            </el-card>
          </el-col>

          <el-col :span="4"/>
        </el-row>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>