<script setup lang="ts">
import axios from 'axios'
import { ref, computed} from 'vue'
import UploadImage from '@/helpers/UploadImage.vue'
import type { FormInstance, FormRules } from 'element-plus'
import User from '@/models/User'
import { ElMessage, ElMessageBox, affixProps } from 'element-plus'

const props = defineProps({
    user: {
        type: User,
        required: true
    },
    detailPerson: {
        type: Boolean,
        required: true
    },
})

const tempUser = ref<User>({
    id: props.user.id,
    avatarUrl: props.user.avatarUrl,
    displayName: props.user.displayName,
    email: props.user.email,
    vip: props.user.vip,
    type: props.user.type,
})

const handleOpen=()=>{
    tempUser.value = {
        id: props.user.id,
        avatarUrl: props.user.avatarUrl,
        displayName: props.user.displayName,
        email: props.user.email,
        vip: props.user.vip,
        type: props.user.type,
    }
}

const emit = defineEmits(['update:detailPerson'])
const detailPerson = computed({
    get: () => props.detailPerson,
    set: val => emit('update:detailPerson', val)
})

let editStatus = ref(false)
const savingDetail = ref(false)
const modifyPassword = ref(false)
const originPassword = ref('')
const newPassword = ref('')
let formRef = ref<FormInstance | null>(null)
let saving = ref(false)

const rules = ref<FormRules<any>>({
    //表单检验规则
    avatarUrl: [
        {
            required: true,
            message: '请输入头像URL',
            trigger: 'blur'
        }
    ],
    displayName: [
        {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
        }
    ],
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

const handleDrawerClose = () => {
    modifyPassword.value = false
    if (editStatus.value) {
        console.log("have change")
        console.log(detailPerson.value)
        ElMessageBox.confirm('有未保存的数据，确定要退出编辑吗？', 'Warning', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
        })
            .then(() => {
                formRef.value?.clearValidate()
                detailPerson.value = false
                editStatus.value = false
                tempUser.value = {
                    id: props.user.id,
                    avatarUrl: props.user.avatarUrl,
                    displayName: props.user.displayName,
                    email: props.user.email,
                    vip: props.user.vip,
                    type: props.user.type,
                }
            })
            .catch(() => {
            })
    } else {
        console.log("no change")
        console.log(detailPerson.value)

        detailPerson.value = false
        editStatus.value = false
    }
}

const handleModifyPassword = () => {
    ElMessageBox.confirm('确定要修改密码吗？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
    })
    .then(() => {
        if(!originPassword.value || !newPassword.value){
            ElMessage({
                message: '密码不能为空',
                type: 'warning'
            })
            return
        }
        console.log("修改密码")
        axios.post('/api/Customer/ChangePwd', {
             customerId: tempUser.value.id,
             oldPwd: originPassword.value,
             newPwd: newPassword.value
            }).then((r)=>{
                if(r.data && r.data.status && r.data.status === '10000'){
                    ElMessage({
                        message: '修改成功',
                        type: 'success'
                    })
                    modifyPassword.value = false
                }else if(r.data && r.data.status && r.data.status != '10000'){
                    ElMessage({
                        message: `修改失败,${r.data.message}`,
                        type: 'warning'
                    })
                    modifyPassword.value = false
                }
            }).catch(()=>{
                ElMessage({
                    message: '修改失败,网络错误',
                    type: 'warning'
                })
                modifyPassword.value = false
            })
    })
}

const saveDetail = async () => {
    if (!formRef.value || !editStatus.value) {
        console.log('表单无改动内容')
        return
    }
    //内容有改动
    await formRef.value.validate((valid, fields) => {
        // 表单检验
        console.log(valid, fields)
        if (valid) {
            saving.value = true
            console.log('表单合法')

            console.log(tempUser.value.email)
            axios
                .post('/api/Customer', {
                    customerId: tempUser.value.id,
                    avatarUrl: tempUser.value.avatarUrl,
                    name: tempUser.value.displayName,
                    email: tempUser.value.email,
                })
                .then((res) => {
                    console.log("处理post返回")
                    savingDetail.value = false
                    console.log(res.data)
                    if (res.data && res.data.status && res.data.status === '10000') {
                        ElMessage({
                            message: '修改成功',
                            type: 'success'
                        })
                        detailPerson.value = false
                        location.reload()
                    } else {
                        ElMessage({
                            message: `修改失败：${res.data.message}`,
                            type: 'warning'
                        })
                    }
                })
                .catch(() => {
                    savingDetail.value = false
                    ElMessage({
                        message: '修改失败',
                        type: 'warning'
                    })
                })
            formRef.value?.clearValidate()
            editStatus.value = false
        } else {
            console.log('表单不合法', fields)
        }
    })
}

</script>



<template>
    <el-dialog @open="handleOpen" v-model="detailPerson" :before-close="handleDrawerClose"
         width="40%">
         <template #header>
            <h2 class="text-red-500 text-2xl font-bold">个人信息</h2>
        </template>

        <el-form :model="tempUser" label-width="120px" :rules="rules" ref="formRef">

            <el-form-item label="头像" class="w-full" prop="avatarUrl">
                <el-space direction="vertical" alignment="normal" wrap>
                    <!-- <el-input v-model="tempUser.avatarUrl" :rows="3" type="textarea" style="width: 350px" -->
                        <!-- @change="editStatus = true" /> -->
                    <div style="display: flex; flex-direction:column; align-items: center;">
                        <el-image :src="tempUser.avatarUrl" :fit="'cover'" style="height: 250px; width: 250px; border-radius: 50%;" >
                            <template #error>
                                <el-icon>
                                    <Picture />
                                </el-icon>
                            </template>
                        </el-image>
                        <UploadImage class="mt-5" api-path="/api/Movies/poster" @Success="(Url: string) => {
                            tempUser.avatarUrl = Url
                            editStatus = true
                        }" />
                    </div>
                    
                </el-space>
            </el-form-item>
            <el-form-item label="用户名" prop="displayName">
                <el-input v-model="tempUser.displayName" @change="() => { editStatus = true }" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
                <el-input v-model="tempUser.email" @change="() => { editStatus = true }" />
            </el-form-item>

            <el-form-item label="修改密码">
                <el-input v-if="modifyPassword" v-model="originPassword" show-password placeholder="请输入原密码" class="mb-2.5"/>
                <el-input v-if="modifyPassword" v-model="newPassword" show-password placeholder="请输入新密码" class="mb-2.5" />
                <el-button v-if="!modifyPassword" type="primary" @click="()=>modifyPassword=true">修改密码</el-button>
                <el-button v-if="modifyPassword" type="primary" @click="handleModifyPassword">确认修改</el-button>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="saveDetail" v-loading="savingDetail">保存</el-button>
                <el-button @click="handleDrawerClose">取消</el-button>
            </el-form-item>

        </el-form>
    </el-dialog>
</template>

<style scoped>
</style>