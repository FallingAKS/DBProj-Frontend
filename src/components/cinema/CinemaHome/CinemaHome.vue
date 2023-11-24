<script setup lang="ts">
import axios from 'axios';
import {ref, onMounted} from 'vue'
import MovieData from '@/models/MHData';
import Cinema from "@/models/Cinema";
import User from "@/models/User";
import { ElMessage } from 'element-plus';

let user = new User()
const cinema = ref(new Cinema())

let TotalCinemaBoxOffice = ref(0)
let TotalCinemaAudiNumber = ref(0)
let CinemaData = ref(new Array<MovieData>())

const getUserInfo = function () {
    return new Promise((resolve, reject) => {
        axios
            .get('/api/manager', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then((res) => {
                console.log(`Bearer ${localStorage.getItem('token')}`)
                user = res.data;
                console.log('已登录用户信息-:', res.data);
                resolve(res.data)
            })
            .catch((err) => {
                console.log(err)
                reject(err)
            });
    })
}

const fetchOverviewData = function() {
    console.log(cinema.value.cinemaId)
    axios
        .get('/api/CinemaOverview/' + cinema.value.cinemaId)
        .then((res) => {
            if (res.data && res.data.status && res.data.status === '10000') {
                TotalCinemaBoxOffice.value = res.data.data.globalData.totalBoxOfficeToday;
                TotalCinemaAudiNumber.value = res.data.data.globalData.audienceNumberToday
                CinemaData.value = res.data.data.movieDatas;
                console.log(TotalCinemaBoxOffice)
            }
            else {
                TotalCinemaBoxOffice.value = 0;
                TotalCinemaAudiNumber.value = 0
                CinemaData.value = [];
            }
        })
        .catch((err) => {
            console.log(err)
        });
}

const GetCinemaByMID = function () {
    return new Promise((resolve, reject) => {
        axios
            .get('/api/Hall/manager/' + user.id + '/cinemas', { 
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(
                res => {
                    if (res.data && res.data.status && res.data.status == '10000') {
                        cinema.value = res.data.data[0]
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

onMounted(async () => {
    await getUserInfo()
    await GetCinemaByMID()
    console.log(cinema.value)
    fetchOverviewData()
})

</script>

<template>
    <!-- <div class="content"> -->
    <h1 class="text-2xl font-bold">数据总览</h1>
    <div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid;" />

    <el-row justify="center">
        <el-col :span="6" class="statistic_bgcolor">
            <el-statistic class="pt10 pb10 pl10 pr10" title="今日影院总票房" :value="TotalCinemaBoxOffice" />
        </el-col>
        
        <el-col :span="6" class="statistic_bgcolor">
            <el-statistic class="pt10 pb10 pl10 pr10" title="今日影院总观影人次" :value="TotalCinemaAudiNumber" />
        </el-col>
    </el-row>

    <div class="el-divider el-divider--horizontal" role="separator" style="--el-border-style: solid;" />
    <!-- <el-divider border-style="double" /> -->
    <el-table :data="CinemaData" style="width:100%;">
        <el-table-column label="电影名" prop="movieName" sortable>
            <template #default="scope">
                <el-button style="border: none;">{{ scope.row.movieName }}</el-button>
            </template>
        </el-table-column>
        <el-table-column label="总票房（当前影院）" prop="totalBoxOffice" sortable/>
            
        <el-table-column label="影院上座率" prop="attendance" sortable>
            <template #default="scope">
                <span>{{ (scope.row.attendance * 100).toFixed(2) }}%</span>
            </template>
        </el-table-column>
            
        <el-table-column label="观影人次" prop="audienceNumber" sortable/>
            
        <el-table-column label="首映日期" prop="premiereDate" sortable>
            <template #default="scope">
                <span>{{ formattedPremiereDate(scope.row.premiereDate) }}</span>
            </template>
        </el-table-column>
    </el-table>
    <!-- </div> -->
</template>

<script lang="ts">
export default {
    methods: {
        formattedPremiereDate(value: string) {
            if (!value)
                return "";
            return new Date(value).toLocaleString();
        },
    },
}
</script>

<style scoped>
.el-col {
  text-align: center;
}

.statistic_bgcolor{
    background-color: rgb(138, 231, 235);
}

.pt10{
    padding-top: 10px;
}

.pb10{
    padding-bottom: 10px;
}

.pl10{
    padding-left: 10px;
}

.pr10{
    padding-right: 10px;
}
</style>
