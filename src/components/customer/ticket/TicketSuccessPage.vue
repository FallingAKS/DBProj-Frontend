<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const gotoTicket = () => {
  router.push('/tickets')
}

const gotoHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="content py-10">
    <div class="flex w-full">
      <div class="grow" />
      <div style="min-width: 900px">
        <el-card>
          <el-result
            icon="success"
            title="购票成功"
            sub-title="您可以在【订单】页面查看自己的电影票"
          >
            <template #extra>
              <el-button type="primary" @click="gotoTicket">前往订单</el-button>
              <el-button type="primary" @click="gotoHome">返回主页</el-button>
            </template>
          </el-result>
        </el-card>
      </div>
      <div class="grow" />
    </div>
  </div>
</template>

<style scoped></style>