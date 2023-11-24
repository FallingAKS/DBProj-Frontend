<script lang="ts">
import axios from 'axios'

export default {
  emits: ['success','fail'],
  data: () => {
    return {
      input: ''
    }
  },
  methods: {
    trySearch():void {
      //空输入
      if (this.input === '') {
        this.$emit('fail')
        return
      }
      axios
            .get(`/api/Staff/ByName/${this.input}`)
            .then(res => {
              if (res.data.status === "4001") {
                console.log('查询影人失败')
                this.$emit('fail')
                return
              }
              else {
                console.log('查询影人成功')
                console.log(res.data)
                this.$emit('success', res.data.data)
                return
              }
            })
            .catch(err =>{
              console.log('执行错误')
              console.log(err)
              this.$emit('fail')
            })
    },
    changeCursor() {
      // 鼠标移入时，改变鼠标指针为手型
      document.body.style.cursor = 'pointer';
    },
    restoreCursor() {
      // 鼠标移出时，恢复默认鼠标指针
      document.body.style.cursor = 'auto';
    }
  }
}
</script>

<template>
  <div class="topbar">
    <el-input v-model="input" placeholder="输入影人名称进行搜索" @keyup.enter="trySearch" clearable size="large">
      <template #prepend>
        <el-icon for="searchIcon">
          <Search id="searchIcon" @click="trySearch" @mouseenter="changeCursor" @mouseleave="restoreCursor" />
        </el-icon>
      </template>
    </el-input>
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  height: 5vh;
  margin: 20px 0;
  /* border-bottom: 2px solid; */
}
</style>