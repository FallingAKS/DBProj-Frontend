<script setup lang="ts">
import Cinema, { CinemaCreator } from '@/models/Cinema'
import { onMounted, computed, ref, nextTick } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox, ElInput } from 'element-plus'
import type { FormInstance } from 'element-plus'
import TopBar from '@/components/admin/TopBar.vue'
import CinemaInfo from '@/components/admin/CinemaManage/CinemaInfo.vue'
import UploadImage from '@/helpers/UploadImage.vue'
import AreaSelect from '@/helpers/AreaSelect.vue'

let currentTags = computed({
  get(): string[] {
    if (newCinema.value.feature) {
      return newCinema.value.feature.split(',')
    } else {
      return []
    }
  },
  set(newValue: string[]) {
    newCinema.value.feature = newValue.join(',')
    console.log('set', newCinema.value.feature)
  }
})

const removeTag = (tag: string) => {
  currentTags.value = currentTags.value.splice(currentTags.value.indexOf(tag), 1)
  currentTags.value.splice(currentTags.value.indexOf(tag), 1)
  let tmp = currentTags.value
  console.log(tmp)
  currentTags.value = tmp
  /*下面的代码不能删：用来刷新标签用的，虽然我也不知道为什么，但是它就是有用*/
  tagInputVisible.value = true
  tagInputVisible.value = false
  formStatus.value = true
}

const tagInputVisible = ref(false)
const tagInputValue = ref('')
const InputRef = ref<InstanceType<typeof ElInput>>()

const tagHandleInputConfirm = () => {
  if (tagInputValue.value) {
    let tags = currentTags.value
    tags.push(tagInputValue.value)
    currentTags.value = tags
    formStatus.value = true
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const tagShowInput = async () => {
  tagInputVisible.value = true
  await nextTick()
  InputRef.value?.focus()
}
// const emailRules = ref([
//   {
//     required: true,
//     message: '请输入邮箱',
//     trigger: 'blur'
//   },
//   {
//     validator: function (rule, value, callback) {
//       //邮箱校验
//       // console.log("邮箱通过！");
//       // return callback()
//       const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
//       if (regEmail.test(value)) {
//         // 合法的邮箱
//         return callback()
//       }
//       callback(new Error('请输入合法的邮箱'))
//     },
//     trigger: 'blur'
//   }
// ])
const newCinema = ref(new CinemaCreator())
const cinemas = ref<Cinema[]>([])

const loading = ref(true)
const pageSize = ref(10)
const total = ref(10)
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
    .get('/api/Cinema/length')
    .then((res) => {
      if (res.data && res.data.status && res.data.status === '10000') {
        total.value = res.data.data
      }
      paginationLoading.value = false
      loading.value = true
      axios
        .get(`/api/Cinema?page_size=${pageSize.value}&page_number=${currentPage.value}`)
        .then((res) => {
          if (res.data && res.data.status && res.data.status === '10000') {
            cinemas.value = res.data.data
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

const cinemaDelete = (name: string, id: string) => {
  //删除对应ID的影院
  ElMessageBox.confirm(`确定要删除${name}吗`, 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      loading.value = true
      axios
        .delete('/api/Cinema/' + id)
        .then((res) => {
          if (res.data && res.data.status && res.data.status === '10000') {
            let targetIndex = cinemas.value.findIndex((cinema) => cinema.cinemaId == id)
            cinemas.value.splice(targetIndex, 1) //同时维护前端电影数组
            // console.log(movies.value)
            loading.value = false
            ElMessage({
              type: 'success',
              message: '删除成功'
            })
            } else {
              loading.value = false
              ElMessage({
              type: 'warning',
              message: '删除失败！'
            })
            }

        })
        .catch((err) => {
          console.log(err)
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

const editCinemaEnter = (cinemaId: string) => {
  editingCinemaId.value = cinemaId
  editShow.value = true
}
const handleUpdateCinema = (cinema: Cinema) => {
  // 修改前端数据
  let index = cinemas.value.findIndex((item: Cinema) => {
    return item.cinemaId == cinema.cinemaId
  })
  cinemas.value.splice(index, 1, cinema)
}

const drawer = ref(false)
const formStatus = ref(false)
const formRef = ref<FormInstance>()
const formReset = () => {
  formStatus.value = false
  newCinema.value = new CinemaCreator()
  formRef.value?.resetFields()
}

const handleClose = () => {
  if (!formStatus.value) {
    drawer.value = false
    formReset()
    return
  }
  ElMessageBox.confirm('表单中还有填写的数据，要丢弃吗', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    drawer.value = false
    formReset()
  })
}

const handleUploadSuccess = (Url: string) => {
  newCinema.value.cinemaImageUrl = Url
  formStatus.value = true
}

const confirmForm = async function () {
  //表单确认函数
  if (!formRef.value) {
    console.log('form is NULL！')
    return
  }
  console.log('开始进行表单检查！')
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      // console.log('表单合法！')
      //...前后端交互数据
      loading.value = true
      console.log(newCinema.value)
      axios
        .put('/api/Cinema', newCinema.value)
        .then((res) => {
          if (res.data.status == '10000') {
            let newC = new Cinema()
            // Object.assign(newC, newCinema.value)
            newC = res.data.data
            cinemas.value.push(newC)

            ElMessage({
              type: 'success',
              message: '添加成功！'
            })

            total.value += 1
            drawer.value = false
            formReset()
          } else if (res.data.status == '10001') {
            console.log(res.data.message)
            ElMessage({
              type: 'error',
              message: '添加失败！'
            })
          }
        })
        .catch((err) => {
          console.log(err)
          ElMessage({
            type: 'error',
            message: '添加失败！'
          })
        })

      loading.value = false
    } else {
      //表单提交失败
      console.log('表单不合法！', fields)
    }
  })
}

const cancelForm = () => {
  if (!formStatus.value) {
    drawer.value = false
    formReset()
    return
  }
  ElMessageBox.confirm('表单中还有填写的数据，要丢弃吗', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    drawer.value = false
    formReset()
    //退出表单，放弃提交，丢弃数据
  })
  // .catch(() => {
  //     //点击取消，返回表单继续填写
  // })
}

const editingCinemaId = ref('')
const editShow = ref(false)
const editRef = ref<typeof CinemaInfo>()
const handleEditClose = () => {
  editRef.value?.cancelForm()
}

const topbarHandleSuccess = (data: Cinema[]) => {
  // 搜索结果不分页
  total.value = data.length
  pageSize.value = data.length
  currentPage.value = 1
  cinemas.value = data
  // console.log(data)
  // console.log(movies.value)
}
const topbarHandleFail = () => {
  ElMessage({
    message: `查询失败或结果不存在`,
    type: 'warning'
  })
  pageSize.value = 10
  currentPage.value = 1
  updateTable()
}

const handleSelected = (selectedOptions: string) => {
  newCinema.value.location = selectedOptions
  console.log(newCinema.value.location)
  }
</script>

<template>
  <h1 class="text-2xl font-bold">影院管理</h1>
  <el-divider />
  <topBar currentItem="2" @success="topbarHandleSuccess" @fail="topbarHandleFail" />
  <el-table v-loading="loading" :data="cinemas" style="width: 100%"
    :header-cell-style="{ backgroundColor: 'purple', color: 'white' }">
    <el-table-column prop="cinemaId" label="影院id" align="left" min-width="10%"></el-table-column>
    <el-table-column prop="name" label="影院名" align="left" min-width="20%"></el-table-column>
    <el-table-column prop="location" label="地址" align="center" min-width="25%"></el-table-column>
    <el-table-column label="标签" align="center" min-width="30%">
      <template #default="scope">
        <el-space wrap size="small" direction="horizontal">
          <el-tag v-for="tag in cinemas[scope.$index].feature.split(',')" :key="tag" size="small" color="rgba(90,0,90,.4)"
            effect="dark" disable-transitions>{{ tag }}
          </el-tag>
        </el-space>
      </template>
    </el-table-column>
    <el-table-column align="right" min-width="15%">
      <template #header>
        <el-button size="small" type="success" @click="drawer = true">添加影院</el-button>
      </template>
      <template #default="scope">
        <el-button size="small" @click="editCinemaEnter(scope.row.cinemaId)">编辑</el-button>
        <el-button size="small" type="danger" @click="cinemaDelete(scope.row.name, scope.row.cinemaId)">删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页栏 -->
  <el-pagination background layout="sizes, prev, pager, next" v-model:total="total" v-model:page-size="pageSize"
    v-model:current-page="currentPage" :page-sizes="[10, 15, 20, 25, 30]" @current-change="handleCurrentChange"
    @size-change="handleSizeChange" />

  <!-- 添加电影的弹框表单 -->
  <el-drawer v-model="drawer" title="添加影院" direction="rtl" :before-close="handleClose" size="50%">
    <!-- 表单 -->
    <el-form :model="newCinema" label-width="120px" class="newCinemaForm" ref="formRef" status-icon>
      <el-form-item label="影院Id" prop="cinemaId">
        <el-input v-model="newCinema.cinemaId" @change="formStatus = true" placeholder="系统自动生成" trigger="blur" disabled />
      </el-form-item>
      <!-- 电影海报上传 -->
      <el-form-item label="影院图片">
        <el-space direction="vertical" alignment="normal" wrap>
          <el-input v-model="newCinema.cinemaImageUrl" @change="formStatus = true" placeholder="请输入电影海报URL">
            <template #append>URL</template>
          </el-input>
          <!-- <img v-if="newCinema.cinemaImageUrl" :src="newCinema.cinemaImageUrl" alt="" height="300" width="300"
          style="object-fit: contain; margin: 5px 0" /> -->
          <el-image :src="newCinema.cinemaImageUrl" :fit="'contain'" style="height: 300px; width: 300px">
          </el-image>
          <UploadImage prefix="cinema" @Success="handleUploadSuccess" />
        </el-space>
      </el-form-item>

      <el-form-item label="影院名称" prop="name" :rules="{ required: true, message: '影院名称不能为空', trigger: 'blur' }">
        <el-input v-model="newCinema.name" @change="formStatus = true" placeholder="请输入影院名称" trigger="blur" />
      </el-form-item>

      <el-form-item label="影院地址" prop="location" :rules="{ required: true, message: '影院地址不能为空', trigger: 'blur' }">
        <AreaSelect :defaultPlace="newCinema.location" @selected="handleSelected"></AreaSelect>
        <el-input v-model="newCinema.location" type="textarea" @change="formStatus = true" maxlength="25"
                show-word-limit :autosize="{ minRows: 2, maxRows: 3 }" placeholder="请输入详情地址" />
      </el-form-item>

      <el-form-item label="影院标签">
        <el-space wrap>
          <el-tag v-for="tag in currentTags" :key="tag" closable :disable-transitions="false" @close="removeTag(tag)">{{
            tag }}
          </el-tag>
          <el-input v-if="tagInputVisible" ref="InputRef" v-model="tagInputValue" class="ml-1 w-20" size="small"
            @keyup.enter="tagHandleInputConfirm" @blur="tagHandleInputConfirm" />
          <el-button v-else class="button-new-tag ml-1" size="small" @click="tagShowInput">
            + 新标签
          </el-button>
        </el-space>
      </el-form-item>

      <!-- <el-form-item label="管理员名称" prop="managerName" :rules="{ required: true, message: '管理员名称不能为空', trigger: 'blur' }">
        <el-input v-model="newCinema.managerName" @change="formStatus = true" placeholder="请输入管理员名称" />
      </el-form-item>

      <el-form-item label="管理员邮箱" prop="managerEmail" :rules="emailRules">
        <el-input v-model="newCinema.managerEmail" @change="formStatus = true" placeholder="请输入管理员邮箱" clearable />
      </el-form-item> -->
      <el-form-item label="管理密码" prop="managerPassword" :rules="{ required: true, message: '管理密码不能为空', trigger: 'blur' }">
        <el-input v-model="newCinema.managerPassword" @change="formStatus = true" placeholder="请输入管理密码" show-password />
      </el-form-item>
    </el-form>

    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelForm">取消</el-button>
        <el-button type="success" @click="confirmForm()">添加</el-button>
      </div>
    </template>
  </el-drawer>

  <el-drawer v-model="editShow" title="编辑影院" direction="rtl" :before-close="handleEditClose" destroy-on-close
    style="min-width: 800px">
    <CinemaInfo :cinemaId="editingCinemaId" v-model="editShow" ref="editRef" @update:cinema="handleUpdateCinema" />
  </el-drawer>
</template>

<style scoped>
.el-pagination {
  margin: 20px 0;
  justify-content: center;
}
</style>
