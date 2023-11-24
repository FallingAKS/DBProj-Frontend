<template>
    <div>
        <el-row>
            <el-col :span="16">
                <el-cascader
                    size="default"
                    :options="pcaTextArr"
                    v-model="selectedOptions"
                    :placeholder="defaultPlace"
                    @change="handleChange">
                </el-cascader>
            </el-col>
            <el-col :span="8">
                <el-button class="mx-2.5" type="primary" @click="resetArea">重置</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { pcaTextArr } from 'element-china-area-data'
export default {
props: {
    defaultPlace: {
    type: String,
    default: '请选择地区'
    }
},
data () {
    return {
        pcaTextArr,
        selectedOptions: [],
        selectedArea: ''
    }
},
methods: {
    handleChange() {
        //返回选中的省市区，将selectedOptions数组转化为一个string存储在selectedArea中
        this.selectedArea = this.selectedOptions.join('')
        this.$emit('selected', this.selectedArea)
    },
    resetArea() {
        this.selectedOptions = []
        this.selectedArea = ''
        this.$emit('selected', '')
    }
}
}
</script>