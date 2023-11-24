<script setup lang="ts">
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const handle_select = (path: string) => {
  switch (path) {
    case '0':
            if (store.state.currentUser.type === 'CinemaAdmin') {
                router.push('/manager')
                console.log(store.state.currentUser.type);
            }
            else if (store.state.currentUser.type === 'SysAdmin') {
                router.push('/admin')
                console.log(store.state.currentUser.type);
            }
            else { console.log(store.state.currentUser.type); }
      break
    case '2-1':
      window.localStorage.removeItem('token')
      store.commit('logout')
      router.push('/')
      break
  }
}

defineExpose({ handle_select })
</script>

<template>
  <el-menu-item index="0">
    <router-link to="/">
      <span style="font-weight: 600; font-size: 1.5em; color: red">同济院线</span>
      <span style="font-size: 1.4em">&nbsp;&nbsp;后台管理</span>
    </router-link>
  </el-menu-item>
  <el-sub-menu v-if="store.state.isLogged" index="3" class="el-sub-menu">
    <template #title>
      <span style="font-size: 1.3em">欢迎，{{ store.state.currentUser.displayName }}</span>
    </template>
    <el-menu-item index="2-1">登出</el-menu-item>
  </el-sub-menu>
</template>

<style scoped>
.el-sub-menu{
  float: right;
}
</style>