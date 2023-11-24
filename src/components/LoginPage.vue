<script setup lang="ts">
import { ref } from 'vue'
import { ElInput, ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()

const isCustomer = ref(true)
const switchCustomer = () => {
  isCustomer.value = !isCustomer.value
}

const isAdmin = ref(false)

const userloginForm = ref({
  email: '',
  password: ''
})

const adminloginForm = ref({
  username: '',
  password:''
})

let formRef = ref<FormInstance | null>(null)
const rules = ref<FormRules<any>>({
    //表单检验规则
    email: [
        {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur',
        },
        {
            validator: function (rule, value, callback) {
                const regEmail = /^[A-Za-z0-9]+([-._][A-Za-z0-9]+)*@[A-Za-z0-9]+(-[A-Za-z0-9]+)*(\.[A-Za-z]{2,6}|[A-Za-z]{2,4}\.[A-Za-z]{2,3})$/

                if (regEmail.test(value)) {
                    // 合法的邮箱
                    return callback()
                }
                callback(new Error('请输入合法的邮箱'))
            },
        }
    ],
})

const adminAndManagerLogin=()=>{
  let apiPath = '/api/Administrator/login'
  if (isAdmin.value) apiPath = '/api/Administrator/login'
  else apiPath = '/api/Manager/login'
  let adminForm = adminloginForm.value
  if(isCustomer.value&&(adminForm.username.length===0||adminForm.password.length===0)){
    ElMessage({
      message:'用户名或密码为空',
      type:'warning'
    })
    return
  }else{
    axios.post(apiPath,adminForm).then((r)=>{
      if (r.data && r.data.status && r.data.status === '10000') {
        ElMessage({
          message: `登录成功`,
          type: 'success'
        })
        window.localStorage.setItem('token', `Bearer ${r.data.token}`)
        if (isAdmin.value){
          router.push('/admin').then(()=>{
            window.location.reload()
          })
        }else{
          router.push('/manager').then(()=>{
            window.location.reload()
          })
        }
      }else{
        if(r.data&&r.data.status&&r.data.status!='10000'){
          ElMessage({
            message:`登录失败,${r.data.message}`,
            type:'warning'
          })
          return
        }
      }
    })
  }
}

const customerLogin = async () => {
  if(!formRef.value){
    return
  }
  await formRef.value.validate((valid, fields) => {
    // 表单检验
    console.log(valid, fields)
    if (valid) {
      let userForm = userloginForm.value
      if (isCustomer.value&&(userForm.email.length===0||userForm.password.length===0)){
        ElMessage({
          message:'邮箱或密码为空',
          type:'warning'
        })
        return
      }
      let apiPath = '/api/Customer/login'
      if (isCustomer.value){
        axios.post(apiPath,userForm).then((r)=>{
          if (r.data && r.data.status && r.data.status==='10000'){
            ElMessage({
              message: `登录成功`,
              type:'success'
            })
            window.localStorage.setItem('token',`Bearer ${r.data.token}`)
            router.push('/').then(()=>{
              window.location.reload()
            })
          }else{
            if(r.data&&r.data.status&&r.data.status!='10000'){
              ElMessage({
                message:`登录失败,${r.data.message}`,
                type:'warning'
              })
              return
            }
          }
        })
      }
      formRef.value?.clearValidate()
    } else {
        ElMessage({
          message: '表单不合法',
          type: 'warning'
        })
      }
  })
}

const register = () => {
  router.push('/register').then(()=>{
    window.location.reload()
  })
}
</script>

<template>
  <main>
    <div class="content">
      <transition name="el-zoom-in-top">
        <div class="center">
          <h1 class="text-left text-4xl">登录</h1>
          <h1 class="text-left text-3xl font-light">Login</h1>
          <el-form :model="userloginForm" label-width="80px" class="mt-10" :rules="rules" ref="formRef" v-if="isCustomer">
            <el-form-item label="邮箱" prop="email">
              <el-input type="email" v-model="userloginForm.email"/>
            </el-form-item>
            <el-form-item label="密码">
              <el-input show-password v-model="userloginForm.password"/>
            </el-form-item>
            <el-button class="w-auto" type="primary" @click="customerLogin">登录</el-button>
              <el-button class="w-auto" @click="register">注册</el-button>
              <el-button class="w-auto" link @click="switchCustomer">
                管理员登录
            </el-button>
          </el-form>
          <el-form :model="adminloginForm" label-width="80px" class="mt-10" v-if="!isCustomer">
            <el-form-item label="角色" v-if="!isCustomer">
              <el-radio-group v-model="isAdmin" class="ml-4">
                <el-radio :label="false">影厅经理</el-radio>
                <el-radio :label="true">院线管理员</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="adminloginForm.username" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input show-password v-model="adminloginForm.password" />
            </el-form-item>
            <el-form-item style="min-width: 100%">
              <el-button class="w-auto" type="primary" v-if="isCustomer" @click="customerLogin">登录</el-button>
              <el-button class="w-auto" type="primary" v-if="!isCustomer" @click="adminAndManagerLogin">登录</el-button>
              <el-button class="w-auto" v-if="!isCustomer" link @click="switchCustomer">客户登录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </transition>
    </div>
  </main>
</template>

<style scoped>
.center {
  text-align: center;
  padding: 40px 80px;
  min-width: 500px;
  position: absolute;
  top: 50%; /* 垂直定位在 50% 的位置 */
  left: 50%; /* 水平定位在 50% 的位置 */
  transform: translate(-50%, -50%); /* 使用 transform 进行位移来居中 */
  backdrop-filter: blur(11px) saturate(180%) brightness(105%);
  -webkit-backdrop-filter: blur(11px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.45);
  border-radius: 20px;
  border: 1px solid rgba(209, 213, 219, 0.3);
}
</style>