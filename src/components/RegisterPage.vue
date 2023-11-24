<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()

const registerForm = ref({
  username: '',
  password: '',
  email: ''
})

const loginForm = ref({
  email: '',
  password: ''
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


const register =async () => {
  if(!formRef.value){
    return
  }
  await formRef.value.validate((valid, fields) => {
    if(valid){
      let form = registerForm.value
      if (form.username.length === 0 || form.password.length === 0) {
        ElMessage({
          message: '用户名或密码为空',
          type: 'warning'
        })
        return
      }

      if (form.email.length === 0) {
        ElMessage({
          message: '邮箱为空',
          type: 'warning'
        })
        return
      }

      let apiPath = '/api/Customer'
      let login = loginForm.value

      login.email = form.email
      login.password = form.password

      axios.put(apiPath, form).then((r) => {
        if (r.data && r.data.status && r.data.status === '10000') {
          ElMessage({
            message: `注册成功,即将自动登录`,
            type: 'success'
          })

          let loginApiPath = '/api/Customer/login'
          axios.post(loginApiPath, login).then((r) => {
            if (!(r.data && r.data.status && r.data.status === '10000')) {
              ElMessage({
                message: `登录失败`,
                type: 'warning'
              })
              console.log(r.data)
              return
            } else {
              window.localStorage.setItem('token', `Bearer ${r.data.token}`)
              router.push('/').then(() => {
                window.location.reload()
              })
            }
          })
        } else {
          if (r.data&&r.data.status&&r.data.status!='10000'){
            ElMessage({
              message: `注册失败,${r.data.message}`,
              type: 'warning'
            })
            return
          }
        }
      })
      formRef.value?.clearValidate()
    }else {
        ElMessage({
          message: '表单不合法',
          type: 'warning'
        })
      }
  })
}
</script>

<template>
  <main>
    <div class="content">
      <transition name="el-zoom-in-top">
        <div class="center">
          <h1 class="text-left text-4xl">注册</h1>
          <h1 class="text-left text-3xl font-light">Register</h1>
          <el-form :model="registerForm" label-width="80px" class="mt-10" :rules="rules" ref="formRef">
            <el-form-item label="用户名">
              <el-input v-model="registerForm.username" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input type="email" v-model="registerForm.email" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input show-password v-model="registerForm.password" />
            </el-form-item>
            <el-form-item style="min-width: 100%">
              <el-button class="w-auto" type="primary" @click="register">注册</el-button>
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