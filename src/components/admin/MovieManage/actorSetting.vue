<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import eStaff from '@/models/Staff'
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'

interface Props {
    selected: eStaff[]
    mode: boolean
    title: string
}
const props = defineProps<Props>()
const emit = defineEmits(['update:actor'])
const searchText = ref('')

let actors = ref<eStaff[]>([])
let selectedActors = ref<eStaff[]>([])
let avalActors = ref<eStaff[]>([])
let dialogVisible = ref(false)
let dialogTitle = ref('')
let status = ref(false)
let loading = ref(false)
let searchedActors = ref<eStaff[]>([])



watch(searchText, (newSearchText) => {
    if (newSearchText != '') {
        searchedActors.value = avalActors.value.filter((actor) => {
            return actor.name.includes(searchText.value)
        })
    }else{
        searchedActors.value = avalActors.value.slice(0)
    }
})

// const transformer = (selecte: eStaff[] | eStaff | null): eStaff[] => {
//     let ret: eStaff[] = []
//     if(selecte instanceof Array)
//         ret = selecte.slice(0)
//     else if(selecte != null)
//         ret = [selecte]
//     else
//         ret = []

//     return ret
// }

// onBeforeMount(() => {
//     console.log("难崩")
//     console.log(props.selected)
//     console.log(transformer(props.selected))
//     props.selected = transformer(props.selected)
//     console.log(props.selected)
// })
onMounted(() => {
    selectedActors.value = props.selected

    dialogTitle.value = props.title
})

const actorCancel = (id: string) => {
    status.value = true;
    const actor = selectedActors.value.find((actor) => actor.staffId == id);
    if(actor == undefined){
        console.log("actor is undefined");
        return;
    }
    selectedActors.value=selectedActors.value.filter((actor) => actor.staffId != id);
    avalActors.value.push(actor);
    avalActors.value.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });
    searchedActors.value = avalActors.value.filter((actor) => actor.name.includes(searchText.value));
}
const actorSelect = (id: string) => {
    //导演模式下只能选择一个影人
    if (props.mode == true && selectedActors.value.length >= 1) {
        console.log("导演模式选人只能一个！");
        return;
    }

    status.value = true;
    const actor = avalActors.value.find((actor) => actor.staffId == id);
    if(actor == undefined){
        console.log("actor is undefined");
        return;
    }
    avalActors.value=avalActors.value.filter((actor) => actor.staffId != id);
    selectedActors.value.push(actor);
    selectedActors.value.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });
    searchedActors.value = avalActors.value.filter((actor) => actor.name.includes(searchText.value));
}
const showDialog = () => {
    dialogVisible.value = true;
    //解包
    selectedActors.value = props.selected

    if (actors.value.length == 0) {
        loading.value = true;
        axios
            .get(`/api/Staff/all`)
            .then((res) => {
                // console.log("getData!")
                actors.value = res.data.data;
                avalActors.value = actors.value.slice(0);

                selectedActors.value.map((actor) => {
                    let index = avalActors.value.findIndex(item => item.staffId == actor.staffId);
                    avalActors.value.splice(index, 1);
                    // console.log(`index is ${index}, actor is ${actor.name}`);
                })
                searchedActors.value = avalActors.value.slice(0);
            })
            .catch((err) => {
                console.log(err);
                ElMessage({
                    type: 'error',
                    message: '数据获取失败'
                })
            })
        loading.value = false;
    }
    else {
        // 去掉已经选取的影人
        avalActors.value = actors.value.slice(0);

        selectedActors.value.map((actor) => {
            let index = avalActors.value.findIndex(item => item.staffId == actor.staffId);
            avalActors.value.splice(index, 1);
            // console.log(`index is ${index}, actor is ${actor.name}`);
        })
        searchedActors.value = avalActors.value.slice(0);
    }
}
//弹窗关闭刷新状态
const reset = () => {
    dialogVisible.value = false
    status.value = false
}
const actorUpdate = () => {
    if (!status.value) {
        reset();
        return;
    }
    // console.log(this.selectedActors);
    reset();
    emit('update:actor', selectedActors.value);
}
const dialogClose = () => {
    if (!status.value) {
        reset();
        return;
    }
    ElMessageBox.confirm('存在修改的数据，要丢弃吗', "Warning", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        reset();
    })
}

</script>

<template>
    <el-button @click="showDialog" text>
        <div v-if="props.selected.length > 0">
            <span  v-for="i in (props.selected.length <= 3 ? props.selected.length : 3)"
            :key="props.selected[i - 1].staffId">
            {{ selected[i - 1].name }}
            <span v-if="i != selected.length">，</span>
        </span>
        </div>
        <span v-else>无</span>
        <span v-if="selected.length > 3">...</span>
    </el-button>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" :before-close="dialogClose">
        <text>已选择影人</text>
        <div class="selectedActor">
            <div v-if="selectedActors.length > 0">
                <el-tag class="actor" disable-transitions @click="actorCancel(actor.staffId)"
                    v-for="(actor, index) in selectedActors" :key="index">
                    {{ actor.name }}
                </el-tag>
            </div>
            <span v-else>暂无</span>
        </div>

        

        <text>可选择影人</text>
        <!-- 加载时骨架屏 -->
        <el-skeleton :loading="loading" animated>
            <template #template>
                <el-skeleton-item variant="rect" style="height: 150px;" />
            </template>
            <template #default>
                <div class="search-box">
                    <el-input placeholder="请输入影人名" v-model="searchText" class="mr-2.5 my-2.5">
                        <template #prefix>
                            <el-icon class="el-input__icon"><search /></el-icon>
                        </template>
                    </el-input>
                </div>
                <div>
                    <text>搜索结果</text>
                </div>
                <div class="avalActor">
                    <el-tag class="actor" disable-transitions type="info" @click="actorSelect(actor.staffId)"
                        v-for="(actor, index) in searchedActors" :key="index">
                        {{ actor.name }}
                    </el-tag>
                </div>
            </template>
        </el-skeleton>

        <!-- <el-pagination background layout="prev, pager, next" v-model:total="total" v-model:page-size="pageSize" small
            hide-on-single-page v-model:current-page="currentPage" /> -->

        <!-- 按钮组 -->
        <template #footer>
            <span class="dialog-footer">
                <el-button type="info" @click="dialogClose" class="no-button">取消</el-button>
                <el-button type="primary" @click="actorUpdate" class="yes-button">确定</el-button>
            </span>
        </template>

    </el-dialog>
</template>

<style scoped>
.selectedActor {
    display: flex;
    padding: 10px;
    width: 100%;
    overflow-x: auto;

}

.selectedActor .actor {
    padding: 5px;
    margin: 5px;
    white-space: nowrap;
    flex-basis: 8%;
}

/* .avalActor {
    overflow: auto;
    padding: 10px;
    max-height: 150px;
    overflow-y: auto;
} */

.avalActor {
    overflow: auto;
    padding: 10px;
    max-height: 300px;
    overflow-y: auto;

    display: flex;
    flex-wrap: wrap;
    padding: 5px;
}

.avalActor .actor {
    margin-right: 10px;
    margin-bottom: 10px;
    width: 100px;
    /* 固定元素长度 */
}

.actor {
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
}

/* .el-pagination {
    margin: 20px 0;
    justify-content: center;
} */

.search-box {
    display: flex;
    justify-content: center;
}
</style>