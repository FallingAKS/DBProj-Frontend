<script setup lang="ts">
import {ref} from "vue";
const props=defineProps({
  content:{
    type:String,
    default:"null"
  },
})
const emit=defineEmits(['change'])

const checked=ref(false)
const onChange=(status:boolean)=>{
  checked.value=status
  emit('change',checked.value,props.content)
}
</script>

<template>
  <el-check-tag :checked="checked" @change="onChange">{{content}}</el-check-tag>
</template>

<style scoped>

</style>