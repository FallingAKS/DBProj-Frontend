<script setup lang="ts">
import { ref } from 'vue'
import { Comment } from '@/models/QuickType/CommentData'
import moment from 'moment'
import Interaction from '@/models/interaction'



const props = defineProps<{
  comment: Comment
  interaction?: Interaction
}>()
const score = ref(props.comment.score/2)
const emits = defineEmits(['Interact'])

const handleInteraction = (type: number) => {
  if (props.interaction && props.interaction.type === type) {
    type = -1
  }
  emits('Interact', props.comment.commentId, type)
}
</script>

<template>
  <el-card class="w-full">
    <div class="flex items-center">
      <div class="rounded-full" style="width: 32px; height: 32px">
        <el-image :src="comment.sender.avatarUrl" fit="contain" />
      </div>
      <h3 class="mx-2 text-gray-400">{{ comment.sender.name }}</h3>
      <h3 class="mx-3 text-gray-400">
        {{ moment(comment.publishDate).format('YYYY-MM-DD HH:mm:SS') }}
      </h3>
      <el-rate
        v-model="score"
        :max="5"
        disabled
        text-color="#ff9900"
      />
      <div class="grow" />
      <div class="text-sm">
        <el-button link @click="handleInteraction(1)">
          <font-awesome-icon
            icon="fa-solid fa-thumbs-up"
            v-if="interaction && interaction.type === 1"
          />
          <font-awesome-icon icon="fa-regular fa-thumbs-up" v-else />
          <span class="ml-1">{{ comment.likeCount }}</span>
        </el-button>
      </div>
      <div class="text-sm ml-3">
        <el-button link @click="handleInteraction(0)">
          <font-awesome-icon
            icon="fa-solid fa-thumbs-down"
            v-if="interaction && interaction.type === 0"
          />
          <font-awesome-icon icon="fa-regular fa-thumbs-down" v-else />
          <span class="ml-1">{{ comment.dislikeCount }}</span>
        </el-button>
      </div>
    </div>
    <div class="mt-3">
      {{ comment.content }}
    </div>
  </el-card>
</template>

<style scoped></style>
