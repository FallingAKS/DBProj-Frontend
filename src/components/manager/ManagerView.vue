<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const settingItems: {
  component: any
  name: string
  icon: any
  needCard: boolean // 默认为true，无特殊需要保持true即可。
}[] = [
  {
    name: '电影管理',
    icon: defineAsyncComponent(() =>
      import('@element-plus/icons-vue').then((module) => module.Film)
    ),
    component: defineAsyncComponent(
      () => import('@/components/admin/MovieManage/MovieManage.vue')
    ),
    needCard: true
  },
  {
    name: '影人信息管理',
    icon: defineAsyncComponent(() =>
      import('@element-plus/icons-vue').then((module) => module.UserFilled)
    ),
    component: defineAsyncComponent(
      () => import('@/components/admin/StaffManage/StaffManage.vue')
    ),
    needCard: true
  },
  {
    name: '电影院管理',
    icon: defineAsyncComponent(() =>
      import('@element-plus/icons-vue').then((module) => module.HomeFilled)
    ),
    component: defineAsyncComponent(
      () => import('@/components/admin/CinemaManage/CinemaManage.vue')
    ),
    needCard: true
  }
]

let currentItem = ref(0)
let isCollapse = ref(false)
</script>

<template>
  <div class="mng-container">
    <div class="mng-sidebar">
      <el-menu
        default-active="0"
        style="height: 100%"
        background-color="rgba(255,255,255,0.9)"
        :collapse="isCollapse"
        @select="(index) => (currentItem = index)"
      >
        <h5 class="font-bold text-center py-4">影厅经理菜单</h5>
        <el-menu-item v-for="(item, i) in settingItems" :index="i.toString()" :key="i">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.name }}</span>
        </el-menu-item>
        <div style="width: 230px"></div>
      </el-menu>
    </div>
    <div class="collapse-btn" @click="isCollapse = !isCollapse.valueOf()">
      <el-icon class="my-auto">
        <ArrowRight v-if="isCollapse" />
        <ArrowLeft v-else />
      </el-icon>
    </div>
    <div class="mng-content">
      <el-card v-if="settingItems[currentItem].needCard" class="mng-content-card">
        <component :is="settingItems[currentItem].component" />
      </el-card>
      <component v-else :is="settingItems[currentItem].component" />
    </div>
  </div>
</template>

<style scoped>
.mng-container {
  display: flex;
  height: 100vh;
  background: rgb(9, 32, 63);
  background: linear-gradient(90deg, rgba(9, 32, 63, 1) 0%, rgba(83, 120, 149, 1) 100%);
}

.mng-sidebar {
  height: 100%;
}

.collapse-btn {
  display: flex;
  flex: 0;
  width: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  transition-duration: 100ms;
  height: 100%;
}

.collapse-btn:hover {
  background-color: rgba(200, 200, 200, 0.9);
  transition-duration: 100ms;
}

.mng-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto; /* This will ensure that content is scrollable if it exceeds the viewport height */
}

.mng-content-card {
  background-color: rgba(255, 255, 255, 1);
  border: none;
}
</style>