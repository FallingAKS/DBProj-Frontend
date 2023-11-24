<script setup lang="ts">
import axios from 'axios'
import { ElMessage, ElMessageBox, } from 'element-plus'
import type { FormInstance } from 'element-plus'
import Staff from '@/models/Staff'
import { onMounted, ref } from 'vue'
import type { Ref } from 'vue';
import topBar from '@/components/admin/TopBar.vue'
import UploadImage from '@/helpers/UploadImage.vue'
import { Male, Female } from '@element-plus/icons-vue'
const targetIndex = ref(0)
const staff = ref(new Staff())
const staffs = ref<Staff[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('修改演员')
const formStatus = ref(false)
const idInputDisabled = ref(true)

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
            console.log(staffs.value)
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

const staffDelete = function (name: string, id: string) {
  ElMessageBox.confirm(`确定要删除 ${name} 吗`, 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      loading.value = true
      axios
        .delete(`/api/Staff/${id}`)
        .then((res) => {
          loading.value = false
          if (res.data && res.data.status && res.data.status === '4001') {
            console.log(id)
            ElMessage({
              type: 'error',
              message: '该影人不存在'
            })
          } else if (res.data && res.data.status && res.data.status === '10000') {
            // 维护前端
            let targetIndex = staffs.value.findIndex((staff) => staff.staffId == id)
            staffs.value.splice(targetIndex, 1)
            ElMessage({
              type: 'success',
              message: '删除成功'
            })
          } else {
            ElMessage({
              type: 'warning',
              message: '删除失败'
            })
          }
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: '删除失败！'
          })
        })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除'
      })
    })
}

const formRef: Ref<FormInstance | null> = ref(null)
const formReset = function () {
  formRef.value?.resetFields()
  formStatus.value = false
}

const staffUpdate = function () {
  //影人修改确认的前后端交互
  if (!formStatus.value) {
    //影人数据未被修改
    formReset()
    dialogVisible.value = false
    return
  }
  let newStaff = {}
  Object.assign(newStaff, staff.value)
  // console.log(newStaff);
  axios
    .post('/api/Staff', staff.value)
    .then((res) => {
      if (res.data.status == '10000') {
        formReset()
        dialogVisible.value = false

        Object.assign(staffs.value[targetIndex.value], newStaff)
        // console.log(obj.staffs[obj.targetIndex]);
        ElMessage({
          type: 'success',
          message: dialogTitle.value.slice(2) + '成功'
        })
      } else if (res.data.status == '10001') {
        console.log(res.data)
        ElMessage({
          type: 'error',
          message: dialogTitle.value.slice(2) + '失败'
        })
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessage({
        type: 'error',
        message: dialogTitle.value.slice(2) + '失败'
      })
    })
  // console.log(newStaff);
}

const staffAdd = function () {
  //影人添加的前后端交互
  let newStaff: Staff = new Staff()
  Object.assign(newStaff, staff.value)
  // console.log(newStaff);
  axios
    .put('/api/Staff', staff.value)
    .then((res) => {
      if (res.data && res.data.status && res.data.status == '10000') {
        formReset()
        dialogVisible.value = false
        staffs.value.push(res.data.data)
        total.value += 1
        // console.log(obj.staffs[obj.targetIndex]);

        ElMessage({
          type: 'success',
          message: dialogTitle.value.slice(2) + '成功'
        })
      } else if (res.data.status == '10001') {
        console.log(res.data)
        ElMessage({
          type: 'error',
          message: dialogTitle.value.slice(2) + '失败'
        })
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessage({
        type: 'error',
        message: dialogTitle.value.slice(2) + '失败'
      })
    })
  console.log(newStaff)
}

const updateForm = function (id: string) {
  //影人修改的表单初始化
  // console.log(id);
  targetIndex.value = staffs.value.findIndex((staff) => staff.staffId == id)
  Object.assign(staff.value, staffs.value[targetIndex.value])
 // staff.value.gender = staff.value.gender.toString()
  idInputDisabled.value = true
  dialogTitle.value = '影人修改'
  dialogVisible.value = true
}

const addForm = function () {
  //添加影人的表单初始化
  staff.value = new Staff()
  staff.value.staffId = 'ID由系统自动设置'
  idInputDisabled.value = false
  dialogTitle.value = '影人添加'
  dialogVisible.value = true
}

const dialogConfirm = async function () {
  if (!formRef.value) {
    console.log('form is NULL')
    return
  }
  console.log('开始进行表单检查！')
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      if (dialogTitle.value == '影人修改') staffUpdate()
      else if (dialogTitle.value == '影人添加') staffAdd()
    } else {
      console.log('表单不合法', fields)
    }
  })
}

const dialogClose = function () {
  if (!formStatus.value) {
    dialogVisible.value = false
    formReset()
    return
  }
  ElMessageBox.confirm('表单中还有填写的数据，要丢弃吗', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dialogVisible.value = false
    formReset()
  })
}

const topbarHandleSuccess = (data: Staff[]) => {
  // 搜索结果不分页
  total.value = data.length
  pageSize.value = data.length
  currentPage.value = 1
  staffs.value = data
  console.log(data)
  // console.log(movies.value)
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

const handleUploadSuccess = (Url: string) => {
  staff.value.imageUrl = Url
  formStatus.value = true
}
</script>

<template>
  <h1 class="text-2xl font-bold">影人信息管理</h1>
  <el-divider />
  <!-- 顶栏 -->
  <el-row align="middle" justify="space-between">
    <el-col :span="20">
      <topBar currentItem="1" @success="topbarHandleSuccess" @fail="topbarHandleFail" />
    </el-col>
    <el-col :span="2" :offset="2">
      <el-button size="large" type="success" @click="addForm()">添加</el-button>
    </el-col>
  </el-row>
  <main style="width: 100%; margin: 0">
    <!-- 加载时的骨架屏 -->
    <el-skeleton :loading="loading" animated>
      <template #template>
        <el-row :gutter="10">
          <el-col :span="4" v-for="n in pageSize" :key="n">
            <div class="skeleton" style="height: 280px">
              <el-skeleton-item variant="image" style="width: 100%; height: 160px" />
              <div style="padding: 2px; height: 90px">
                <div class="idAndGen_Ske" style="margin: 5px; display: flex; justify-content: space-between; width: 80%">
                  <el-skeleton-item variant="p" style="width: 65%" />
                  <el-skeleton-item variant="p" style="width: 25%; margin-left: 10px" />
                </div>
                <el-skeleton-item variant="h1" style="width: 90%; margin: 5px" />
              </div>
            </div>
          </el-col>
        </el-row>
      </template>
      <template #default>
        <el-row :gutter="10">
          <el-col :span="4" v-for="staff in staffs" :key="staff">
            <el-card shadow="hover" style="padding: 0; margin-bottom: 20px; height: 280px">
              <el-image :src="staff.imageUrl" fit="cover" style="height: 160px; width: 100%; margin: 0; padding: 0" />
              <div class="staffInfo" style="
                  padding: 2px;
                  height: 90px;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  align-items: center;
                ">
                <div class="idAndGen" style="display: flex; justify-content: space-around; width: 80%">
                  <span class="staffId" style="color: rgba(90, 90, 90, 0.5)">{{
                    staff.staffId
                  }}</span>
                  <span class="gender">{{ staff.gender == 1 ? '女' : '男' }}</span>
                </div>
                <div class="staffName">
                  <span class="staffName" style="font-size: 1.2em">{{ staff.name }}</span>
                </div>
                <div class="bottoms" style="display: flex; justify-content: center">
                  <el-button size="small" type="info" @click="updateForm(staff.staffId)">修改
                  </el-button>
                  <el-button size="small" type="danger" @click="staffDelete(staff.name, staff.staffId)">删除
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <!-- 分页栏 -->
        <el-pagination background layout="sizes, prev, pager, next" :page-sizes="[12, 18, 24, 30]" v-model:total="total"
          v-model:page-size="pageSize" v-model:current-page="currentPage" v-loading="paginationLoading"
          @current-change="handleCurrentChange" @size-change="handleSizeChange" />
      </template>
    </el-skeleton>
  </main>

  <!-- 弹出框 -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle" :before-close="dialogClose" width="1000px">
    <!-- 表单 -->
    <el-form :model="staff" label-width="80px" class="staffForm" ref="formRef" status-icon style="margin-right: 30px">
      <el-col>
        <el-row align="middle">
          <el-col :span="12">
            <!-- 影人海报预览 -->
            <el-image :src="staff.imageUrl" fit="cover" style="height: 350px; width: 300px; margin: 5px 0 20px 65px" />
          </el-col>
          <el-col :span="12">
            <!-- 影人Id查看 -->
            <el-form-item label="影人ID">
              <el-input v-model="staff.staffId" disabled placeholder="请输入影人ID"></el-input>
            </el-form-item>
            <!-- 影人名字 -->
            <el-form-item label="影人名称" prop="name" :rules="{ required: true, message: '影人名称不能为空', trigger: 'blur' }">
              <el-input v-model="staff.name" maxlength="20" @change="formStatus = true" show-word-limit
                placeholder="请输入影人姓名" />
            </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-switch v-model="staff.gender" 
            :active-value=1 :inactive-value=0 
            :inactive-icon="Male" :active-icon="Female" 
            @change="formStatus = true"
            style="--el-switch-on-color:  #e94062; --el-switch-off-color: #3182df" />
          </el-form-item>

          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <!-- 影人简介修改 -->
            <el-form-item label="影人简介" prop="introduction"
              :rules="{ required: true, message: '影人简介不能为空', trigger: 'blur' }">
              <el-input v-model="staff.introduction" type="textarea" @change="formStatus = true" maxlength="200"
                show-word-limit :autosize="{ minRows: 3, maxRows: 5 }" placeholder="请输入影人简介" />
            </el-form-item>
            <!-- 影人图片URL -->
            <el-form-item label="图片URL">
              <el-input v-model="staff.imageUrl" @change="formStatus = true" placeholder="请输入影人海报URL">
                <template #append>URL</template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <UploadImage prefix="staff" @Success="handleUploadSuccess" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-col>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogClose">取消</el-button>
        <el-button type="primary" @click="dialogConfirm"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.el-pagination {
  margin: 20px 0;
  justify-content: center;
}
</style>