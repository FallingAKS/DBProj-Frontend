<script setup lang="ts">
import { ElLoading, ElMessage, ElMessageBox, ElInput } from 'element-plus'
import type { FormInstance } from 'element-plus';
import { computed, onMounted, ref, nextTick } from 'vue'
import Cinema from '@/models/Cinema'
import axios from 'axios'
import UploadImage from '@/helpers/UploadImage.vue'
import AreaSelect from '@/helpers/AreaSelect.vue'
const props = defineProps({
  cinemaId: String,
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue', 'update:cinema'])

const show = computed({
  get(): boolean {
    return props.modelValue
  },
  set(value: boolean) {
    emit('update:modelValue', value)
  }
})

const cinema = ref(new Cinema())
const formStatus = ref(false)
// const featureHint = ref(false)
let currentTags = computed({
  get(): string[] {
    if (cinema.value.feature) {
      return cinema.value.feature.split(',')
    } else {
      return []
    }
  },
  set(newValue: string[]) {
    cinema.value.feature = newValue.join(',')
    console.log('set', cinema.value.feature)
  }
})

const removeTag = (tag: string) => {
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


onMounted(() => {
  if (!props.cinemaId) {
    show.value = false
    return
  }
  cinema.value.cinemaId = props.cinemaId!

  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  axios
    .get(`/api/Cinema/${props.cinemaId}`)
    .then((res) => {
      if (res.data.status == '10000') {
        // console.log(res.data.cinema);
        cinema.value = res.data.data
        // console.log(obj.cinema);
      } else if (res.data.status == '4001') {
        ElMessage({
          type: 'error',
          message: '该影院不存在！'
        })
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessage({
        type: 'error',
        message: '数据获取失败'
      })
    })
  loading.close()
})

const cancelForm = () => {
  if (!formStatus.value) {
    show.value = false
  } else {
    ElMessageBox.confirm('表单中有修改过的数据，要丢弃吗', 'Warning', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      //退出表单，放弃提交，丢弃数据
      show.value = false
    })
  }
}

const handleUploadSuccess = (Url: string) => {
  cinema.value.cinemaImageUrl = Url
  formStatus.value = true
}

const formRef = ref<FormInstance>()
const confirmForm = async () => {
  if (!formStatus.value) {
    //未存在更改
    show.value = false
    return
  }

  await formRef.value?.validate((valid, field) => {
    if (valid) {
      // console.log(cinema.value)
      axios
        .post('/api/Cinema', cinema.value)
        .then((res) => {
          if (res.data.status == '10000') {
            ElMessage({
              type: 'success',
              message: '修改上传成功'
            })
            console.log('修改成功！')
            // console.log(res.data.data)
            // console.log(cinema.value)
            emit('update:cinema', cinema.value)
            show.value = false
            return
          } else {
            console.log(res.data.message)
            // console.log("here is cinema: \n")
            // console.log(obj.cinema)
            ElMessage({
              type: 'error',
              message: '修改上传失败'
            })
          }
        })
        .catch((error) => {
          console.log(error)
          // console.log(obj.cinema)
          ElMessage({
            type: 'error',
            message: '修改上传失败'
          })
        })
    } else {
      console.log('表单不合法', field)
    }
  })
}
const handleSelected = (selectedOptions: string) => {
  cinema.value.location = selectedOptions
  console.log(cinema.value.location)
  }
defineExpose({ cancelForm })
</script>

<template>
  <div class="page">
    <!-- 表单 -->
    <el-form :model="cinema" label-width="120px" class="cinemaForm" ref="formRef" status-icon>
      <el-col>
        <el-row align="middle">
          <el-col :span="10" :offset="2">
            <!-- 电影院预览 -->
            <el-image :src="cinema.cinemaImageUrl" fit="contain" style="height: 400px; width: 400px; margin: 10px" />
          </el-col>
          <el-col :span="12">
            <!-- 电影院Id查看 -->
            <el-form-item>
              <el-input v-model="cinema.cinemaId" disabled>
                <template #append>电影院ID</template>
              </el-input>
            </el-form-item>
            <!-- 管理员Id -->
            <el-form-item>
              <el-input v-model="cinema.managerId" disabled>
                <template #append>管理员ID</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <!-- 电影院名字修改 -->
            <el-form-item label="影院名" prop="name" :rules="{ required: true, message: '影院名称不能为空', trigger: 'blur' }">
              <el-input v-model="cinema.name" maxlength="20" @change="formStatus = true" show-word-limit
                placeholder="请输入影院名" />
            </el-form-item>
            <el-form-item label="影院地址" prop="location" :rules="{ required: true, message: '影院地址不能为空', trigger: 'blur' }">
              <AreaSelect :defaultPlace="cinema.location" @selected="handleSelected"></AreaSelect>
              <el-input v-model="cinema.location" type="textarea" @change="formStatus = true" maxlength="25"
                show-word-limit :autosize="{ minRows: 2, maxRows: 3 }" placeholder="请输入详情地址" />
            </el-form-item>
            <!-- 电影院特点 -->
            <el-form-item label="影院标签">
              <el-space wrap>
                <el-tag v-for="tag in currentTags" :key="tag" closable :disable-transitions="false"
                  @close="removeTag(tag)">{{
                    tag }}
                </el-tag>
                <el-input v-if="tagInputVisible" ref="InputRef" v-model="tagInputValue" class="ml-1 w-20" size="small"
                  @keyup.enter="tagHandleInputConfirm" @blur="tagHandleInputConfirm" />
                <el-button v-else class="button-new-tag ml-1" size="small" @click="tagShowInput">
                  + 新标签
                </el-button>
              </el-space>
            </el-form-item>
            <!-- 电影院图片URL -->
            <el-form-item label="图片URL">
              <el-input v-model="cinema.cinemaImageUrl" @change="formStatus = true" placeholder="请输入电影海报URL">
                <template #append>URL</template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <UploadImage prefix="cinema" @Success="handleUploadSuccess" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-col>
    </el-form>

    <div style="display: flex; justify-content: end">
      <el-button @click="cancelForm">取消</el-button>
      <el-button type="success" @click="confirmForm()">修改</el-button>
    </div>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  /* background-color: pink; */
}

.el-form-item {
  margin-bottom: 30px;
}
</style>