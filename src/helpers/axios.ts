// 配置axios
import axios, { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

if (import.meta.env.MODE === 'development') axios.defaults.baseURL = 'http://localhost:5212/'
else axios.defaults.baseURL = 'https://cinema.cinea.com.cn/'

axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    if (window.localStorage.getItem('token')) {
      config.headers['Authorization'] = window.localStorage.getItem('token')
    }
    return config
  },
  function (error) {
    // 对请求错误做些什么
    ElMessage({
      message: '连接失败，请检查网络连接或询管理员',
      type: 'warning'
    })
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response
  },
  function (error: AxiosError) {
    console.log("ERROR", error.message)
    // 对请求错误做些什么
    if (error.response && error.response.status && error.response.status == 401) {
      ElMessage({
        message: '您还未登录',
        type: 'warning'
      })
      router.push('/login')
    } else if (error.response && error.response.status && error.response.status == 403) {
      ElMessage({
        message: '您不能使用此接口，如有疑问请询管理员。',
        type: 'warning'
      })
    }
    return Promise.reject(error)
  }
)
