<script setup lang="ts">
//import Hall from '@/models/Hall'
import User from "@/models/User";
import axios from "axios"
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Ref } from 'vue';
import type { FormInstance } from 'element-plus'
import { VueElement, ref, watch, defineExpose, onMounted, computed } from 'vue';
import Hall from "@/models/Hall";
import Cinema from "@/models/Cinema";

const store = useStore()
const formStatus = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加影厅')
const hall = ref(new Hall())
const hallTypes = ref([])
let _hallTypes = ref('')
let halls = ref(new Array<Hall>())
let search = ref('')
let flag = ref(false)
const formRef: Ref<FormInstance | null> = ref(null)
let cinema = ref(new Cinema())

const addForm = function () {
    dialogTitle.value = '添加影厅'
    hall.value = new Hall()
    dialogVisible.value = true
}
const updateForm = function (index: number, data: any) {
    dialogTitle.value = '修改影厅'
    console.log("原来的hall.hallID: " + hall.value.hallID)
    console.log("data.hallID: " + data.hallID)
    flag.value = true
    hall.value = new Hall()
    hall.value.hallID = data.hallID
    hall.value.seat.rows = data.seat.rows
    hall.value.seat.cols = data.seat.cols
    hall.value.hallType = data.hallType
    dialogVisible.value = true

}
const formReset = function () {
    formRef.value?.resetFields()
    formStatus.value = false
}

const dialogClose = function () {
    if (formStatus.value === false) {// 数据未被修改
        dialogVisible.value = false
        formReset()
        return
    }
    ElMessageBox.confirm('表单中还有填写的数据，要丢弃吗', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        GetHallsByMID(store.state.currentUser.id)
        dialogVisible.value = false
        formReset()
    }).catch(() => {
        return
    })

}
const dialogConfirm = async function () {
    if (!formRef.value) {
        console.log('form is NULL')
        return
    }
    console.log('开始进行表单检查！')
    await formRef.value.validate((valid, fields) => {
        if (valid) {
            console.log(':+ ' + hallTypes.value)
            if (hallTypes.value.length == 0) {
                // ElMessage({
                //     type: 'error',
                //     message: '影厅类型不能为空'
                // })
                // return
                hall.value.hallType = '普通2D'
            }
            else {
                hall.value.hallType = ''
                let _map = function (s: string): boolean {
                    // 如果字串s包含了D，则返回true
                    return s.includes('D')
                }
                // 级联选择器选择了多个，需要根据选择的值进行拼接，用,进行拼接
                // hallTypes.value是一个数组，里面存放了选择的值，我们需要对数组每个元素进行处理
                // 如果字串s包含了D，则进行拼接
                // 数组元素格式为 【VIP影厅,VIP 2D】，我们只需要【,】后面的字串
                hallTypes.value.forEach(item => {
                    let it = JSON.stringify(item)
                    if (_map(it)) {
                        console.log('it= ' + it)
                        //去除引号和中括号
                        it = it.replace(/\"/g, '').replace(/\[/g, '').replace(/\]/g, '')
                        hall.value.hallType += it.split(',')[1] + ','
                    }
                }
                )
                // 删除最后一个逗号
                hall.value.hallType = hall.value.hallType.substring(0, hall.value.hallType.length - 1)

            }
            console.log('hall.value.hallType= ' + hall.value.hallType)
            if (dialogTitle.value == '修改影厅') hallUpdate()
            else if (dialogTitle.value == '添加影厅') hallAdd()
        } else {
            console.log('表单不合法', fields)
        }
    })
}
const hallUpdate = function () {
    console.log('hallUpdate')
    if (cinema.value && cinema.value.cinemaId == '') {
        ElMessage({
            type: 'error',
            message: '影院信息不存在'
        })
        return
    }
    hall.value.cinemaID = cinema.value.cinemaId
    const newHall = new Hall(JSON.parse(JSON.stringify(hall.value)))
    axios
        .post('/api/Hall', newHall, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then((res) => {
            if (res.data && res.data.status && res.data.status == '10000') {
                // 修改halls数组
                halls.value = halls.value.map((item: Hall) => {
                    if (item.hallID == newHall.hallID) {
                        return newHall
                    }
                    else {
                        return item
                    }
                })
                formReset()
                dialogVisible.value = false
                ElMessage({
                    type: 'success',
                    message: dialogTitle.value.slice(4) + '成功'
                })

            }
            else {
                console.log(res.data)
                ElMessage({
                    type: 'error',
                    message: dialogTitle.value.slice(4) + '失败'
                })
            }
        })
        .catch((err) => {
            console.log(err)
            ElMessage({
                type: 'error',
                message: dialogTitle.value.slice(4) + '失败'
            })
        })
}
const hallAdd = async function () {
    if (cinema.value && cinema.value.cinemaId == '') {
        ElMessage({
            type: 'error',
            message: '影院信息不存在'
        })
        return
    }
    hall.value.cinemaID = cinema.value.cinemaId
    hall.value.hallID = 'SYSTEM_GENERATED'
    const newHall = new Hall(JSON.parse(JSON.stringify(hall.value)))
    console.log(newHall)
    axios
        .put('/api/Hall', newHall, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then((res) => {
            if (res.data && res.data.status && res.data.status == '10000') {
                halls.value.push(res.data.data)
                formReset()
                dialogVisible.value = false

                ElMessage({
                    type: 'success',
                    message: dialogTitle.value.slice(4) + '成功'
                })
            }
            else {
                console.log(res.data)
                ElMessage({
                    type: 'error',
                    message: dialogTitle.value.slice(4) + '失败'
                })
            }
        })
        .catch((err) => {
            console.log(err)
            ElMessage({
                type: 'error',
                message: dialogTitle.value.slice(4) + '失败'
            })
        })
}
const hallDelete = async function (hallID: string) {
    console.log('hallDelete: ' + cinema.value.cinemaId)
    axios
        .delete('/api/Hall/' + hallID + '?cinemaId=' + cinema.value.cinemaId, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then((res) => {
            if (res.data && res.data.status && res.data.status == '10000') {
                halls.value = halls.value.filter((item: Hall) => {
                    return item.hallID != hallID;
                })
                ElMessage({
                    type: 'success',
                    message: '删除成功'
                })
            }
            else if (res.data && res.data.status && res.data.status == '4005') {
                console.log(res.data)
                ElMessage({
                    type: 'error',
                    message: '该影厅已被排片，无法删除'
                })
            }
            else if (res.data && res.data.status && res.data.status == '4004') {
                console.log(res.data)
                ElMessage({
                    type: 'error',
                    message: '影厅不存在，无法删除'
                })
            }
            else {
                console.log(res.data)
                ElMessage({
                    type: 'error',
                    message: '删除失败'
                })
            }
        })
        .catch((err) => {
            console.log(err)
            ElMessage({
                type: 'error',
                message: '删除失败'
            })
        })
}
const GetCinemaByMID = function (ManagerID: string) {
    return new Promise((resolve, reject) => {
        axios
            .get('/api/Hall/manager/' + ManagerID + '/cinemas', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(
                res => {
                    if (res.data && res.data.status && res.data.status == '10000') {
                        cinema.value = res.data.data[0]
                        console.log(cinema.value)
                    }
                    else {
                        console.log(res.data)
                        ElMessage({
                            type: 'error',
                            message: '获取影院信息失败'
                        })
                    }
                    resolve(res.data)
                }
            )
            .catch((err) => {
                console.log(err)
                ElMessage({
                    type: 'error',
                    message: '获取影院信息失败'
                })
                reject(err)
            })
    })
}
const GetHallsByMID = function (ManagerID: string) {
    return new Promise((resolve, reject) => {
        axios
            .get('/api/Hall/manager/' + ManagerID + '/halls', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(
                res => {
                    if (res.data && res.data.status && res.data.status == '10000') {
                        halls.value = res.data.data
                        console.log(halls.value)
                    }
                    else {
                        console.log(res.data)
                        ElMessage({
                            type: 'error',
                            message: '获取影厅信息失败'
                        })
                    }
                    resolve(res.data)
                }
            )
            .catch((err) => {
                console.log(err)
                ElMessage({
                    type: 'error',
                    message: '获取影厅信息失败'
                })
                reject(err)
            })
    })
}
const filterTableData = computed(() => {
    return halls.value.filter((item: Hall) => {
        return item.hallID.includes(search.value) || item.hallType.includes(search.value);
    }).sort((obj1: Hall, obj2: Hall) => {
        return Number(obj1.hallID) - Number(obj2.hallID);
    })
})
watch(() => hall.value.seat.rows, (newRows: number, oldRows: number) => {
    if (flag.value) {
        flag.value = false
        return
    }
    console.log(`行数从 ${oldRows} 变为 ${newRows}`)
    // 如果新的行数大于旧的行数，说明增加了行数，需要在列数数组后面追加元素
    if (newRows > oldRows) {
        for (let i = oldRows; i < newRows; i++) {
            hall.value.seat.cols.push(1)

        }
    }
    // 如果新的行数小于旧的行数，说明减少了行数，需要在列数数组后面删除元素
    if (newRows < oldRows) {
        for (let i = oldRows; i > newRows; i--) {
            hall.value.seat.cols.pop() // 删除最后一个元素
        }
    }
})

onMounted(() => {
    GetHallsByMID(store.state.currentUser.id)
    GetCinemaByMID(store.state.currentUser.id)
    console.log('halls:' + halls)
})
defineExpose({ halls, search })
</script>

<template>
    <h1 class="text-2xl font-bold">影厅管理</h1>
    <el-divider />
    <div>
        <div class="line"></div>
        <div >
            <div>
                <el-table :data="filterTableData"  style="width: 100%">
                    <el-table-column label="影厅编号" prop="hallID" sortable :sort-method="mySort">
                        <template #default="scope" >
                            <div>
                                <span>{{ parseInt(scope.row.hallID, 10) }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="行数" prop="seat.rows" >
                        <template #default="scope">
                            <div>
                                <span>{{ scope.row.seat.rows }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="每行列数" prop="seat.cols">
                        <template #default="scope">
                            <div>
                                <span>{{ scope.row.seat.cols }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="影厅类型" prop="hallType" >
                        <template #default="scope">
                            <div>
                                <el-tag class="mx-1" type="info" color='#F8829C' effect="dark" round>{{ scope.row.hallType }}</el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column align="right" >
                        <template #header>
                            <div class="header-container">
                                <el-button size="default" type="primary" @click="addForm()">添加</el-button>
                                <el-input v-model="search" size="default" placeholder="Type to search" />
                            </div>
                        </template>
                        <template #default="scope" >
                            <div>
                                <el-button size="default" type="success" @click="updateForm(scope.$index, scope.row)">编辑</el-button>
                                <el-button size="default" type="danger" @click="hallDelete(scope.row.hallID)" >删除</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

        <!--弹出框-->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" :before-close="dialogClose">
        <!-- 表单 -->
        <el-form :model="hall" label-width="100px" ref="formRef" status-icon style="margin-right: 30px">
            <el-col>
                <el-row align="middle">
                    <el-col :span="12">
                        <el-form-item label="影厅编号" prop="hallID">
                            <el-input v-model="hall.hallID" maxlength="10" disabled placeholder="系统自行计算"></el-input>
                        </el-form-item>
                        <el-form-item label="行数" prop="seat.rows" :rules="{ required: true, trigger: 'blur' }">
                            <el-input-number v-model="hall.seat.rows" :min="1" :max="30" @change="formStatus = true"/>
                        </el-form-item>

                        <!-- 使用v-for循环生成每一行的列数输入框 -->
                        <el-form-item v-for="(_, index) in hall.seat.rows" :key="index" :label="'第' + (index + 1) + '行列数'" :rules="{ required: true, trigger: 'blur' }">
                            <el-input-number v-model="hall.seat.cols[index]" :min="1" :max="50" @change="formStatus = true"/>
                        </el-form-item>

                        <el-form-item label="影厅类型" prop="_hallTypes">
                            <!-- <el-input v-model="hall.hallType" maxlength="10" @change="formStatus = true" placeholder="影厅类型"></el-input> -->
                            <el-cascader v-model="hallTypes" :options="options" :props="props" placeholder="普通2D" @change="formStatus = true"/>
                            <span style="font-weight: lighter; color: darkgrey;">&nbsp;默认为普通2D影厅</span>
                             <!-- <el-select v-model="hall.hallType" class="m-2" placeholder="Select" size="large">
                                <el-option v-for="item in options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select> -->
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-col>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogClose">取消</el-button>
                <el-button type="primary" @click="dialogConfirm"> 确认 </el-button>
            </span>
        </template>
    </el-dialog>
    </div>


</template>

<script lang="ts">


export default {
    data: () => {
        return {
            User: new User(),
            curIndex: 1,
            debounceTimeout: null,
            props: {
                expandTrigger: 'hover' as const,
                multiple: true,
            },
            options: [
                {
                    value: '普通影厅',
                    label: '普通影厅',
                    children: [
                        {
                            value: '普通2D',
                            label: '普通2D',
                        },
                        {
                            value: '普通3D',
                            label: '普通3D',
                        },
                        {
                            value: '普通4D',
                            label: '普通4D',
                        },
                    ]
                },
                {
                    value: 'VIP影厅',
                    label: 'VIP影厅',
                    children: [
                        {
                            value: 'VIP 2D',
                            label: 'VIP 2D',
                        },
                        {
                            value: 'VIP 3D',
                            label: 'VIP 3D',
                        },
                        {
                            value: 'VIP 4D',
                            label: 'VIP 4D',
                        },
                    ]
                },
                {
                    value: 'IMAX影厅',
                    label: 'IMAX影厅',
                    children: [
                        {
                            value: 'IMAX2D',
                            label: 'IMAX2D',
                        },
                    ]
                },
                {
                    value: '杜比影厅',
                    label: '杜比影厅',
                    children: [
                        {
                            value: '杜比2D',
                            label: '杜比2D',
                        },
                        {
                            value: '杜比3D',
                            label: '杜比3D',
                        },
                    ]
                },
                {
                    value: 'CGS中国巨幕',
                    label: 'CGS中国巨幕',
                    children: [
                        {
                            value: 'CGS2D',
                            label: 'CGS2D',
                        },
                    ]
                }
            ],

            tableHeight: window.innerHeight - 500,
            WindowHeight: window.innerHeight,
        }
    },
    methods: {
        logout() {
            alert("我退出了");
        },
        updateHeight() {
        },
        mySort(obj1: any, obj2: any) {
            let obj1Value = obj1.hallID;
            let obj2Value = obj2.hallID;
            return obj1Value - obj2Value;
        },
        async getUserInfo() {
            try {
                const response = await axios.get('/api/manager', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                this.User = response.data;
                console.log('已登录用户信息-:', response.data);
            } catch (error) {
                console.error(error);
            }
        },
    },
    mounted() {
        window.addEventListener('resize', this.updateHeight);// 添加窗口大小改变的事件监听器
        // 组件渲染完成后先调用一次更新高度的方法
        this.updateHeight();
    },
    watch: {
        updatedWindowHeight(Height) {
            this.WindowHeight = Height;  // 更新 data 中的值为窗口当前宽度
        },
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.updateHeight);
    },

}
</script>

<style scoped>
.flex-grow {
    flex-grow: 1;
}

.disabled-el-menu-item {
    pointer-events: none;
    /* 禁用鼠标事件 */
    cursor: default;
    /* 修改鼠标样式为默认 */
}

.disabled-el-menu-item a {
    color: inherit;
    /* 保持原本的颜色 */
    text-decoration: none;
    /* 去掉链接下划线样式 */
}

.header-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
}


.el-message-box__wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
