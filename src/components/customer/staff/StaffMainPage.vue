<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElCard, ElMessage, ElMessageBox } from 'element-plus'
import { Staff } from '@/models/Staff'
import topBarForCus from './topBarForCus.vue'

const staffs = ref<Staff[]>([])
const router = useRouter()

const loading = ref(true)
const pageSize = ref(12)
const total = ref(12)
const currentPage = ref(1)
const paginationLoading = ref(false)

const handleCurrentChange = () => {
  updateTable()
}
const handleSizeChange = () => {
  currentPage.value = 1
  updateTable()
}
const handleStaffDetail = (staffId: string) => {
  router.push(`/staff/${staffId}`)
}

onMounted(() => {
  updateTable()
})

const updateTable = () => {
  paginationLoading.value = true
  axios
    .get('/api/Staff/length')
    .then((res) => {
      if (res.data && res.data.status && res.data.status === '10000') {
        total.value = res.data.data
      }
      paginationLoading.value = false
      loading.value = true
      axios
        .get(`/api/Staff?page_size=${pageSize.value}&page_number=${currentPage.value}`)
        .then((res) => {
          if (res.data && res.data.status && res.data.status === '10000') {
            staffs.value = res.data.data
            // console.log(staffs.value)
          }
          loading.value = false
        })
        .catch((err) => {
          loading.value = false
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
    })
    .catch((err) => {
      paginationLoading.value = false
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
const topbarHandleSuccess = (data: Staff[]) => {
  // 搜索结果不分页
  total.value = data.length
  pageSize.value = data.length
  currentPage.value = 1
  staffs.value = data
}
const topbarHandleFail = () => {
  ElMessage({
    message: `查询失败或结果不存在`,
    type: 'warning'
  })
  pageSize.value = 12
  currentPage.value = 1
  updateTable()
}
</script>

<template>
  <div class="content">
    <div class="flex">
      <div class="grow" />
      <div class="m-5" style="width: 1024px">
        <el-card class="w-full">
          <el-row align="middle" justify="space-between">
            <el-col :span="20">
              <topBarForCus @success="topbarHandleSuccess" @fail="topbarHandleFail" />
            </el-col>
          </el-row>
          <main class="w-full m-0">
            <!-- 加载时的骨架屏 -->
            <el-skeleton :loading="loading" animated>
              <template #template>
                <el-row :gutter="10">
                  <el-col :span="4" v-for="n in pageSize" :key="n">
                    <div class="skeleton">
                      <el-skeleton-item variant="rect" class="w-full mb-5" style="height: 280px;"/>
                    </div>
                  </el-col>
                </el-row>
              </template>
              <template #default>
                <el-row :gutter="10">
                  <el-col :span="4" v-for="staff in staffs" :key="staff">
                    <el-card
                      shadow="hover"
                      class="p-0 mb-5 cursor-pointer"
                      style="height: 280px;"
                      @click="handleStaffDetail(staff.staffId)"
                    >
                      <el-image
                        :src="staff.imageUrl"
                        fit="cover"
                        style="height: 160px; width: 100%; margin: 0; padding: 0"
                      />
                      <div
                        class="staffInfo"
                        style="
                          padding: 2px;
                          height: 90px;
                          display: flex;
                          flex-direction: column;
                          justify-content: space-between;
                          align-items: center;
                        "
                      >
                        <div class="flex justify-around w-4/5">
                          <span class="text-lg text-gray-400">{{
                            staff.gender == '1' ? '女' : '男'
                          }}</span>
                        </div>
                        <div class="staffName">
                          <span class="staffName" style="font-size: 1.2em">{{ staff.name }}</span>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
                <!-- 分页栏 -->
                <el-pagination
                  background
                  layout="sizes, prev, pager, next"
                  :page-sizes="[12, 18, 24, 30]"
                  class="mx-0 py-5 justify-center"
                  v-model:total="total"
                  v-model:page-size="pageSize"
                  v-model:current-page="currentPage"
                  v-loading="paginationLoading"
                  @current-change="handleCurrentChange"
                  @size-change="handleSizeChange"
                />
              </template>
            </el-skeleton>
          </main>
        </el-card>
      </div>
      <div class="grow" />
    </div>
  </div>
</template>
