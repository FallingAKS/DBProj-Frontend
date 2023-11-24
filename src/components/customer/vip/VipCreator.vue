<script setup lang="ts">
import axios from 'axios';
import { ref, computed, onMounted, } from 'vue'
import { useStore, } from 'vuex'
import { ElCard, ElMessage, ElLoading, } from 'element-plus'
import moment from 'moment';

interface VipInfo {
    customerId: string | null,
    endDate: string | null,
}

let customerVid = ref<VipInfo>({
    customerId: null,
    endDate: null,
})

let userVipStatus = ref(false)
let userVipColor = ref('')

interface VipSet {
    mode: 1 | 2 | 3,
    color: string,
    length: string,
    status: boolean,
}
let vipSets: VipSet[] = [
    {
        mode: 1,
        color: 'green',
        length: '一个月',
        status: false,
    },
    {
        mode: 2,
        color: 'blue',
        length: '三个月',
        status: false,
    },
    {
        mode: 3,
        color: 'red',
        length: '一年',
        status: false,
    },
]
const bgColorTransformer = (mainColor: string, secondColor: string, direction: string) => {
    let ret = `linear-gradient(to ${direction}, ${mainColor} , ${secondColor})`
    // console.log(ret)
    return ret;
}
const store = useStore()
const props = defineProps({
    dialogVisible: { type: Boolean, required: true }
})
const emit = defineEmits(['update:dialogVisible'])
const dialogVisible = computed({
    get: () => props.dialogVisible,
    set: val => emit('update:dialogVisible', val)
})

const handleOpen = () => {
    customerVid.value.customerId = store.state.currentUser.id
    axios.get(`/api/Vip/${customerVid.value.customerId}`)
        .then((res) => {
            if (res.data.status && res.data.status === '10000') {
                if (res.data.data) {
                    customerVid.value.endDate = res.data.data.endDate
                }
                // console.log(customerVid.value)
                let today = moment(new Date()).format('x')
                let endTime = moment(customerVid.value.endDate).format('x')
                if (customerVid.value.endDate == null || endTime < today) {
                    //用户VIP过期或者从未开通
                    userVipStatus.value = false
                    userVipColor.value = 'rgb(150,150,150)'
                }
                else {
                    //用户是VIP
                    userVipStatus.value = true
                    userVipColor.value = 'rgb(255,10,0)'
                }
            }
            else {
                console.log(res.data)
                ElMessage.error("数据加载错误");
            }
        })
        .catch((err) => {
            console.log(err)
            ElMessage.error("数据加载错误");
        })
}

let currentMode = ref(1)
const handleSelect = (index: number) => {
    currentMode.value = index
    // console.log(currentMode.value)
}
const handleConfirm = () => {
    axios.put(`/api/Vip/byMode?customerId=${customerVid.value.customerId}&mode=${currentMode.value}`)
        .then((res) => {
            if (res.data.status && res.data.status === '10000') {
                ElMessage({
                    message: '开通成功',
                    type: 'success'
                })
                dialogVisible.value = false
            }
            else {
                console.log(res.data)
                ElMessage({
                    message: '开通失败',
                    type: 'error'
                })
            }
        })
        .catch((err) => {
            console.log(err)
            ElMessage({
                message: '开通失败',
                type: 'error'
            })
        })
}

</script>

<template>
    <el-dialog v-model="dialogVisible" width="30%" @open="handleOpen">
        <template #header>
            <h2 class="text-red-500 text-2xl font-bold">同济院线VIP</h2>
        </template>

        <div class="w-full h-40 mx-auto py-2">
            <el-card class="h-full w-full" shadow="never"
                v-bind:style="{ background: bgColorTransformer(userVipColor, 'white', 'right bottom') }">
                <div v-if="userVipStatus">
                    <h2 class="text-white font-bold text-lg italic">您已经是同济院线的VIP会员了哦</h2>
                    <h3 class="text-gray-200">———到期时间 {{ moment(customerVid.endDate).format('YYYY-MM-DD') }}</h3>
                </div>
                <div v-else-if="customerVid.endDate != null">
                    <h2 class="text-white font-bold text-lg italic">您的同济院线VIP已经到期了哦</h2>
                    <h3 class="text-gray-200">———到期时间 {{ moment(customerVid.endDate).format('YYYY-MM-DD') }}</h3>
                </div>
                <div v-else>
                    <h2 class="text-white font-bold text-lg italic">您还不是同济院线的VIP会员哦</h2>
                    <h3 class="text-gray-200">———快加入同济院线会员享受折扣优惠吧！</h3>
                </div>
            </el-card>
        </div>
        <div class="main w-full h-45 py-0 flex flex-col grow">
            <el-card v-for="vipSet, index in vipSets" :key="index" class="vipSet w-1/3 h-full mx-1"
                @click="handleSelect(vipSet.mode)"
                v-bind:style="{ background: bgColorTransformer(vipSet.color, 'white', 'bottom'), border: (currentMode == vipSet.mode ? '2px ' : '0px ') + 'solid orange' }">
                <h1 class="mx-auto my-auto text-white font-extrabold text-2xl italic text-right select-none ">
                    {{ (userVipStatus ? '续费' : '开通') + vipSet.length }}</h1>
            </el-card>
        </div>

        <template #footer>
            <el-row>
                <el-col :span="6">
                    <el-button>
                        价格：<p style="color: red;">￥{{vipSets[currentMode - 1].mode * vipSets[currentMode - 1].mode * 10 }}</p>
                    </el-button>
                </el-col>
                <el-col :span="8"/>
                <el-col :span="10">
                    <span class="dialog-footer">
                        <el-button @click="dialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="handleConfirm">
                            {{ userVipStatus ? '续费' : '开通' }}
                        </el-button>
                    </span>
                </el-col>
            </el-row>


        </template>
    </el-dialog>
</template>

<style scoped>
.main {
    writing-mode: vertical-lr;
}
</style>