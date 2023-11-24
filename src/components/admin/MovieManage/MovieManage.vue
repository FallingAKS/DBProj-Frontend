<script setup lang="ts">
import actorSelector from './actorSetting.vue'
import { computed, nextTick, onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import Movie from '@/models/Movie'
import axios from 'axios'
//import { ElInput, ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { copyTextToClipboard } from '@/helpers/clipboard'
import UploadImage from '@/helpers/UploadImage.vue'
import type { eStaff } from '@/models/Staff'
import Comment from '@/components/admin/MovieManage/Comment.vue'
// import { Message } from '@element-plus/icons-vue/dist/types'

let movies: Ref<Movie[]> = ref([])
let moviesLoading = ref(false)

let currentPage = ref(1)
let pageSize = ref(10)
let itemTotal = ref(1)
let paginationLoading = ref(false)

const handleCurrentChange = () => {
  updateTable()
}
const handleSizeChange = () => {
  currentPage.value = 1
  updateTable()
}

let currentMovie: Ref<Movie> = ref(new Movie(undefined))

onMounted(() => {
  updateTable()
})

const updateTable = () => {
  paginationLoading.value = true
  axios
    .get('/api/Movies/length')
    .then((res) => {
      if (res.data && res.data.status && res.data.status === '10000') {
        itemTotal.value = res.data.data
      }
      paginationLoading.value = false
      moviesLoading.value = true
      axios
        .get(`/api/Movies?page_size=${pageSize.value}&page_number=${currentPage.value}`)
        .then((res) => {
          if (res.data && res.data.status && res.data.status === '10000') {
            movies.value = res.data.data
          }
          moviesLoading.value = false
        })
        .catch((err) => {
          moviesLoading.value = false
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

const truncateString = (str: string, maxLength: number = 30): string => {
  if (!str || !str.length || str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength - 3) + '...'
}

const changeCurrentIndex = (row: Movie) => {
  Object.assign(currentMovie.value, row)
  // console.log(currentMovie.value)
}

let detailView = ref(false)
let detailEdit = ref(false)
let editStatus = ref(false)
let formRef = ref<FormInstance | null>(null)
const handleDrawerClose = () => {
  if (detailEdit.value && editStatus.value) {
    ElMessageBox.confirm('有未保存的数据，确定要退出编辑吗？', 'Warning', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        formRef.value?.clearValidate()
        detailView.value = false
        editStatus.value = false
      })
      .catch(() => {
        // catch error
      })
  } else {
    detailView.value = false
    editStatus.value = false
  }
}

let showImage = ref(false)

const copyPosterUrl = () => {
  copyTextToClipboard(<string>currentMovie.value?.postUrl)
  ElMessage({
    message: '已复制到剪贴板',
    type: 'success'
  })
}

let currentTags = computed({
  get(): string[] {
    if (currentMovie.value.tags) {
      return currentMovie.value.tags.split(',')
    } else {
      return []
    }
  },
  set(newValue: string[]) {
    currentMovie.value.tags = newValue.join(',')
    console.log('set', currentMovie.value.tags)
  }
})

const removeTag = (tag: string) => {
  if (detailEdit.value) {
    currentTags.value.splice(currentTags.value.indexOf(tag), 1)
    let tmp = currentTags.value
    console.log(tmp)
    currentTags.value = tmp
    // console.log(currentMovie.value.tags)
    /*下面的代码不能删：用来刷新标签用的，虽然我也不知道为什么，但是它就是有用*/
    tagInputVisible.value = true
    tagInputVisible.value = false
    editStatus.value = true
  }
}

const tagInputVisible = ref(false)
const tagInputValue = ref('')
const InputRef = ref<InstanceType<typeof ElInput>>()

const tagHandleInputConfirm = () => {
  if (tagInputValue.value) {
    let tags = currentTags.value
    tags.push(tagInputValue.value)
    currentTags.value = tags
    editStatus.value = true
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const tagShowInput = async () => {
  if (detailEdit.value) {
    tagInputVisible.value = true
    await nextTick()
    InputRef.value?.focus()
  }
}

const savingDetail = ref(false)
const rules = ref<FormRules<typeof currentMovie>>({
  //表单检验规则
  name: [
    {
      required: true,
      message: '请输入电影名称',
      trigger: 'blur'
    }
  ],
  postUrl: [
    {
      required: true,
      message: '请输入电影海报URL',
      trigger: 'blur'
    }
  ],
  releaseDate: [
    {
      required: true,
      message: '请设置发行档期',
      trigger: 'blur'
    }
  ],
  removalDate: [
    {
      required: true,
      message: '请设置发行档期',
      trigger: 'blur'
    }
  ],
  duration: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入电影时长'))
        } else {
          callback()
        }
      },
      required: true,
      trigger: 'blur'
    }
  ]
})
const disableDateforStart = (time: any) => {
  if (currentMovie.value.removalDate != null) {
    return time.getTime() >= new Date(currentMovie.value.removalDate).getTime()
  }
}
const disableDateforEnd = (time: any) => {
  if (currentMovie.value.releaseDate != null) {
    return time.getTime() <= new Date(currentMovie.value.releaseDate).getTime()
  }
}

const updateDirector = (newDirector: eStaff[]) => {
  editStatus.value = true
  if (newDirector.length > 0) currentMovie.value.director = newDirector[0]
  else currentMovie.value.director = null
}
const updateActors = (newActors: eStaff[]) => {
  editStatus.value = true
  if (newActors.length > 0) currentMovie.value.actors = newActors.slice(0)
  else currentMovie.value.actors = null
}
const transformer = (selecte: eStaff[] | eStaff | null): eStaff[] => {
  let ret: eStaff[] = []
  if (selecte instanceof Array) ret = selecte.slice(0)
  else if (selecte != null) ret = [selecte]
  else ret = []

  return ret
}

const saveDetail = async () => {
  if (!formRef.value || !editStatus.value) {
    console.log('表单无改动内容')
    return
  }
  await formRef.value.validate((valid, fields) => {
    // 表单检验
    let actorTest = currentMovie.value.actors?.find(
      (actor) => actor.staffId == currentMovie.value.director?.staffId
    )
    if (actorTest != undefined) {
      ElMessage({
        message: `${actorTest.name} 不能既是导演又是演员`,
        type: 'warning'
      })
      return
    }

    if (valid) {
      // console.log(currentMovie.value)
      if (addingMovie.value) {
        addSaveMovie()
        return
      }
      savingDetail.value = true
      // console.log(currentMovie.value)

      axios
        .post('/api/Movies', currentMovie.value)
        .then((res) => {
          savingDetail.value = false
          if (res.data && res.data.status && res.data.status === '10000') {
            ElMessage({
              message: '修改成功',
              type: 'success'
            })
            detailView.value = false
            
            //同时维护前端数组
            let targetIndex = movies.value.findIndex((movie) => movie.movieId == currentMovie.value.movieId)
            Object.assign(movies.value[targetIndex], currentMovie.value)

            // updateTable()
          } else {
            ElMessage({
              message: `修改失败：${res.data.message}`,
              type: 'warning'
            })
          }
        })
        .catch(() => {
          savingDetail.value = false
        })
      formRef.value?.clearValidate()
      editStatus.value = false
    } else {
      console.log('表单不合法', fields)
    }
  })
}

const addingMovie = ref(false)

const addMovie = () => {
  currentMovie.value = new Movie(undefined)
  currentMovie.value.movieId = '自动生成'
  detailView.value = true
  detailEdit.value = true
  addingMovie.value = true
}

const addSaveMovie = () => {
  savingDetail.value = true
  // console.log(currentMovie.value)
  axios
    .put('/api/Movies', currentMovie.value)
    .then((res) => {
      // console.log(currentMovie.value)
      savingDetail.value = false
      if (res.data && res.data.status && res.data.status === '10000') {
        ElMessage({
          message: '添加成功',
          type: 'success'
        })
        detailView.value = false
        updateTable()
      } else {
        ElMessage({
          message: `添加失败：${res.data.message}`,
          type: 'warning'
        })
      }
    })
    .catch(() => {
      savingDetail.value = false
    })
}

const deletingMovie = ref(false)
const deleteMovie = () => {
  if (currentMovie.value && currentMovie.value.movieId) {
    ElMessageBox.confirm(`确定要删除影片 ${currentMovie.value.name} 吗？`, 'Warning', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      deletingMovie.value = true
      axios
        .delete(
          `/api/Movies/${currentMovie.value.movieId}`
          // {params: { movieId: currentMovie.value.movieId }}
        )
        .then((res) => {
          deletingMovie.value = false
          if (res.data && res.data.status && res.data.status === '10000') {
            ElMessage({
              message: '删除成功',
              type: 'success'
            })
            // updateTable()
            let targetIndex = movies.value.findIndex((movie) => movie.movieId == currentMovie.value.movieId)
            movies.value.splice(targetIndex, 1)

          } else {
            ElMessage({
              message: `删除失败：${res.data.message}`,
              type: 'warning'
            })
          }
        })
        .catch(() => {
          deletingMovie.value = false
        })
    })
  }
}

const topbarHandleSuccess = (data: Movie[]) => {
  // 搜索结果不分页
  itemTotal.value = data.length
  pageSize.value = data.length
  currentPage.value = 1
  movies.value = data
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

const searchInfo = ref('')
const dialogVisible = ref(false)
const handleSearch = (movieId: string) => {
  searchInfo.value = movieId
  dialogVisible.value = true
}

const handleUploadSuccess = (Url: string) => {
  currentMovie.value.postUrl = Url
  editStatus.value = true
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">电影管理</h1>
    <el-divider />
    <el-dialog v-model="dialogVisible" title="评论管理" width="1400px">
      <Comment :initialSearchInfo="searchInfo" />
    </el-dialog>
    <el-space>
      <el-button type="primary" @click="addMovie">添加电影</el-button>
      <topBar currentItem="0" @success="topbarHandleSuccess" @fail="topbarHandleFail" />
    </el-space>
    <div class="table-container my-5">
      <el-table
        :data="movies"
        style="width: 100%"
        :stripe="true"
        v-loading="moviesLoading"
        @cell-mouse-enter="changeCurrentIndex"
      >
        <el-table-column prop="movieId" label="电影Id" width="80">
          <template #default="{ $index }">
            {{ movies[$index]['movieId'] }}
            <el-button
              link
              type="primary"
              size="small"
              @click="
                () => {
                  Object.assign(currentMovie, movies[$index])
                  handleSearch(movies[$index]['movieId'])
                }
              "
              >查看评论
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="电影名称" width="150">
          <template #default="{ $index }">
            <strong>{{ movies[$index]['name'] }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="80" />
        <el-table-column prop="instruction" label="简介" width="200">
          <template #default="{ $index }">
            {{ truncateString(movies[$index]['instruction'] as string, 150) }}
          </template>
        </el-table-column>

        <el-table-column prop="postUrl" label="海报链接" width="200">
          <template #default="{ $index }">
            <el-space>
              <span>{{ truncateString(movies[$index]['postUrl'] as string) }}</span>
              <el-tooltip effect="dark" content="查看海报" placement="bottom">
                <el-button
                  link
                  type="primary"
                  size="small"
                  icon="Picture"
                  @click="showImage = true"
                />
              </el-tooltip>
              <el-tooltip effect="dark" content="复制链接" placement="bottom">
                <el-button
                  link
                  type="primary"
                  size="small"
                  icon="CopyDocument"
                  @click="copyPosterUrl"
                />
              </el-tooltip>
            </el-space>
          </template>
        </el-table-column>

        <el-table-column prop="tags" label="标签" width="200">
          <template #default="{ $index }">
            <el-space wrap>
              <el-tag v-for="tag in movies[$index]['tags']?.split(',')" :key="tag"
                >{{ tag }}
              </el-tag>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="评分" />
        <el-table-column prop="releaseDate" label="上映日期" width="200" />
        <el-table-column prop="removalDate" label="到期日期" width="200" />

        <el-table-column fixed="right" prop="operation" label="操作" width="130">
          <template #default="{ $index }">
            <el-button
              link
              type="primary"
              size="small"
              @click="
                () => {
                  detailEdit = false
                  detailView = true
                }
              "
              >查看
            </el-button>

            <el-button
              link
              type="primary"
              size="small"
              @click="
                () => {
                  Object.assign(currentMovie, movies[$index])
                  detailEdit = true
                  detailView = true
                  addingMovie = false
                }
              "
              >编辑
            </el-button>

            <el-button
              link
              type="danger"
              size="small"
              v-loading="deletingMovie"
              @click="deleteMovie"
              >删除
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>
    <div style="display: flex">
      <div style="flex-grow: 1" />
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        v-loading="paginationLoading"
        :page-sizes="[10, 20, 50, 100]"
        :background="true"
        layout="sizes, prev, pager, next"
        :total="itemTotal"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
  <el-dialog v-model="showImage" title="海报查看">
    <div>
      <img
        class="mx-auto"
        :src="(currentMovie['postUrl'] as string)"
        alt="Movie Poster"
        style="max-height: 600px; max-width: 600px"
      />
    </div>
  </el-dialog>
  <el-drawer
    v-model="detailView"
    title="电影详情"
    direction="rtl"
    :before-close="handleDrawerClose"
    style="min-width: 600px"
  >
    <el-form
      :model="currentMovie"
      label-width="120px"
      :disabled="!detailEdit"
      :rules="rules"
      ref="formRef"
    >
      <el-form-item label="电影id">
        <el-input v-model="currentMovie.movieId" disabled />
      </el-form-item>
      <el-form-item label="电影名称" prop="name">
        <el-input v-model="currentMovie.name" @change="editStatus = true" />
      </el-form-item>
      <el-form-item label="电影简介">
        <el-input
          v-model="currentMovie.instruction"
          :rows="5"
          type="textarea"
          @change="editStatus = true"
        />
      </el-form-item>
      <el-form-item label="电影海报" class="w-full" prop="postUrl">
        <el-space direction="vertical" alignment="normal" wrap>
          <el-input
            v-model="currentMovie.postUrl"
            :rows="3"
            type="textarea"
            style="width: 350px"
            @change="editStatus = true"
          />
          <el-image
            :src="currentMovie.postUrl"
            :fit="'contain'"
            style="height: 300px; width: 300px"
          >
            <template #error>
              <el-icon>
                <Picture />
              </el-icon>
            </template>
          </el-image>
          <!--          <el-button-group>-->
          <!--            <el-button @click="uploadPoster" v-loading="uploadingPoster">上传图片</el-button>-->
          <!--            <input-->
          <!--              type="file"-->
          <!--              style="display: none"-->
          <!--              id="upload-poster"-->
          <!--              accept="image/*"-->
          <!--              :onchange="uploaderHandleChange"-->
          <!--            />-->
          <!--          </el-button-group>-->
          <UploadImage
            api-path="/api/Movies/poster"
            @Success="handleUploadSuccess"
          />
        </el-space>
      </el-form-item>
      <el-form-item label="上映日期" prop="releaseDate">
        <el-date-picker
          v-model="currentMovie.releaseDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="editStatus = true"
          :disabled-date="disableDateforStart"
        />
      </el-form-item>
      <el-form-item label="结束日期" prop="removalDate">
        <el-date-picker
          v-model="currentMovie.removalDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="editStatus = true"
          :disabled-date="disableDateforEnd"
        />
      </el-form-item>

      <el-form-item label="导演:">
        <actorSelector
          :selected="transformer(currentMovie.director)"
          :mode="true"
          title="设置导演"
          @update:actor="updateDirector"
        />
      </el-form-item>
      <el-form-item label="演员:">
        <actorSelector
          :selected="transformer(currentMovie.actors)"
          :mode="false"
          title="设置演员"
          @update:actor="updateActors"
        />
      </el-form-item>

      <el-form-item label="时长" prop="duration">
        <el-input v-model="currentMovie.duration" @change="editStatus = true">
          <template #append>分钟</template>
        </el-input>
      </el-form-item>
      <el-form-item label="标签">
        <el-space wrap>
          <el-tag
            v-for="tag in currentTags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="removeTag(tag)"
            >{{ tag }}
          </el-tag>
          <el-input
            v-if="tagInputVisible"
            ref="InputRef"
            v-model="tagInputValue"
            class="ml-1 w-20"
            size="small"
            @keyup.enter="tagHandleInputConfirm"
            @blur="tagHandleInputConfirm"
          />
          <el-button v-else class="button-new-tag ml-1" size="small" @click="tagShowInput">
            + New Tag
          </el-button>
        </el-space>
      </el-form-item>
      <el-form-item v-if="detailEdit">
        <el-button type="primary" @click="saveDetail" v-loading="savingDetail">保存</el-button>
        <el-button @click="handleDrawerClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<style scoped>
.table-container {
  padding: 5px;
  border: solid 1px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.spacer {
  flex-grow: 1;
}
</style>