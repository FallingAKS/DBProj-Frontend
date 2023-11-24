<template>
    <div>
      <template v-if="!isEditing">
        <span>{{ formattedValue }}</span>
        <el-button size="mini" icon="el-icon-edit" @click="editCell" />
      </template>
      <template v-else>
        <el-input v-model="editValue" size="mini" @blur="saveEdit" />
        <el-button size="mini" icon="el-icon-check" @click="saveEdit" />
      </template>
    </div>
  </template>
  
<script>
export default {
    props: {
        value: [String, Number]
    },
    data() {
        return {
            isEditing: false,
            editValue: ''
        };
    },
    computed: {
        formattedValue() {
            return this.value || '';
        }
    },
    methods: {
        editCell() {
            this.isEditing = true;
            this.editValue = this.value;
        },
        saveEdit() {
            this.isEditing = false;
            this.$emit('edit', this.editValue);
        }
    }
};
</script>