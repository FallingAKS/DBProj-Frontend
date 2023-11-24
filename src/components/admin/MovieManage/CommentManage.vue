<template>
  <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <el-select v-model="searchWay" placeholder="请选择搜索方式" >
      <el-option label="电影 ID" value="MovieId"></el-option>
      <el-option label="用户 ID" value="CustomerId"></el-option>
      <el-option label="评论 ID" value="CommentId"></el-option>
      <el-option label="电影 Name" value="MovieName"></el-option>
    </el-select>
    <el-input v-model="searchIforInput" :placeholder="`请输入需要查询的 ${searchWay}`"></el-input>
    <el-button type="primary" @click="fetchComments()">获取评论</el-button>
  </div>
  <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <el-input v-model="contendInclude" :placeholder="`请输入需要查询的评论信息`"></el-input>
  </div>

  <div style="display: flex; justify-content: flex-end; align-items: center;">
    <el-tooltip content="查看所有评价" placement="top">
      <template #default>
        <el-switch v-model="isShowAll" />
      </template>
    </el-tooltip>
  </div>
  

  <div>
    <el-table :data="pagedComments" style="width: 100%" >
      <el-table-column prop="commentId" label="评论Id" sortable width="100px"> </el-table-column>

      <el-table-column prop="customerId" label="用户Id" sortable width="90px"></el-table-column>
      <!-- <el-table-column prop="avatarUrl" label="用户头像" >
        <template v-slot="{ row }">
          <img :src="row.avatarUrl" alt="avatar" style="width: 50px; height: 50px; border-radius: 50%" />
        </template>
      </el-table-column> -->

      <el-table-column prop="movieName" label="电影名称" sortable></el-table-column>

      <el-table-column label="点赞数" prop="likeCount"  sortable width="90px" >
        <template v-slot="{ row }">
          {{ row.likeCount }}
        </template>
      </el-table-column>
      <el-table-column label="点踩数" prop="dislikeCount" sortable  width="90px">
        <template v-slot="{ row }">
          {{ row.dislikeCount }}
        </template>
      </el-table-column>
      <el-table-column label="用户评级" prop="rating" sortable>
        <template v-slot="{ row }">
          <el-rate v-model="row.rating"  :disabled="true" size="small"></el-rate>
        </template>
      </el-table-column>

      <el-table-column prop="publishDate" label="发表时间" sortable></el-table-column>
      
      <el-table-column label="评论内容" min-width="130px">
        <template v-slot="{ row }">
          <div class="comment-content" :class="{ 'comment-content-expanded': row.isOpen }" @click="toggleContent(row)">
            {{ getContent(row) }}
          </div>
        </template>
      </el-table-column>


      <el-table-column label="操作" min-width="140px">
        <template v-slot="{ row }">
          <el-button type="danger" size="small" @click="banComment(row)" :disabled="row.display === '0'" >屏蔽</el-button>
          <el-button type="primary" size="small" @click="unbanComment(row)" :disabled="row.display === '1'">恢复</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background v-model="currentPage" :page-size="pageSize" :total="pageLength" @current-change="handlePageChange"></el-pagination>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'


export default {
  props: {
    initialSearchInfo: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showedComments: [],//用来展示的评论
      allCommentData: [],//用来存储所有的评论
      currentPage: 1,
      pageSize: 10,
      pageLength: 0,
      searchIforInput: this.initialSearchInfo,//规定搜索的信息
      searchWay: 'MovieId',//规定搜索的方式，是按照用户id，电影id还是评论id, 默认是电影id
      contentThreshold: 50,//评论内容的阈值
      isShowAll: false,//是否显示所有评论
      contendInclude: '',//评论内容包含的内容
    }
  },
  created() {
    this.fetchComments()
  },
  methods: {
    async fetchComments() {
      try {
        const response = await axios.get(`/api/Comment/by${this.searchWay}(Admin)/${this.searchIforInput}`);//动态构建API
        if (response.data.status !== '10000') {
          this.$message.error('获取评论失败')
          return
        }
        this.allCommentData = response.data;
        this.handleData();
      } catch (error) {
        console.error(error)
      }
    },
    handleData() {
      this.showedComments = this.allCommentData.data
        .map(comment => ({
          ...comment,
          isOpen: false,
          rating: comment.score / 2,
          publishDate: new Date(comment.publishDate).toLocaleString(),
        }))
    },

    getContent(row) {
      if (row.isOpen) {
        return row.content
      } else if (row.content.length > this.contentThreshold) {
        return row.content.slice(0, this.contentThreshold) + '...'
      } else {
        return row.content
      }
    },

    toggleContent(row) {
      row.isOpen = !row.isOpen
    },



  handlePageChange(currentPage) {
    this.currentPage = currentPage
  },

  banComment(row) {
    const index = this.showedComments.indexOf(row) // 获取该评论在 showedComments 中的索引
    ElMessageBox.confirm('确认屏蔽该评论？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 确认屏蔽评论
      axios.post(`/api/Comment/ban/${row.commentId}`)
        .then(() => {
          ElMessage({
            message: 'Congrats, 评论屏蔽成功.',
            type: 'success',
          })
          this.showedComments[index].display = '0'
        })
        .catch(() => {
          ElMessage.error('评论屏蔽失败')
        })
    }).catch(() => {
      // 取消屏蔽评论
      return
    })
  },
  unbanComment(row) {
    ElMessageBox.confirm('确认恢复该评论？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 确认恢复评论
      axios.post(`/api/Comment/unban/${row.commentId}`)
        .then(() => {
          ElMessage({
            message: 'Congrats, 评论恢复成功.',
            type: 'success',
          })
          const index = this.showedComments.indexOf(row) // 获取该评论在 showedComments 中的索引
          this.showedComments[index].display = '1'
        })
        .catch(() => {
          ElMessage.error('评论恢复失败')
        })
    }).catch(() => {
      // 取消恢复评论
    })
  },
},
  computed: {
    pagedComments() {
      const startIndex = (this.currentPage - 1) * this.pageSize//计算起始索引
      const endIndex = startIndex + this.pageSize//计算结束索引
      return this.showedComments
        .filter(comment => ((comment.display === '1' || this.isShowAll) && (this.contendInclude == '' || comment.content.includes(this.contendInclude))))
        .slice(startIndex, endIndex)
    }
  },
  //如果searchInfoInput变化了，就重新获取评论
  watch: {
    searchIforInput() {
      this.fetchComments()
    },
    //如果initialSearchInfo变化了，searchIforInput需要变化
    initialSearchInfo() {
      this.searchIforInput = this.initialSearchInfo
    },
    pagedComments() {
      this.pageLength = this.showedComments
        .filter(comment => ((comment.display === '1' || this.isShowAll) && (this.contendInclude == '' || comment.content.includes(this.contendInclude))))
        .length//计算总的评论数
    }
  }
}
</script>

<style>
.comment-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.comment-content-expanded {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}

</style>