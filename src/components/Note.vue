<script setup lang="ts">
import useStore, { Note } from '../store'
import { format } from 'date-fns'

const store = useStore()
const props = defineProps<{
  note: Note
}>()
const edit = ref(false)

function editSave() {
  if (edit.value) {
    props.note.updated = new Date().getTime()
    store.saveState()
    edit.value = false
  } else {
    edit.value = true
  }
}

function remove() {
  store.notes.splice(store.notes.indexOf(props.note), 1)
  store.saveState()
}
</script>

<template>
  <div>
    <n-input v-if="edit" type="textarea" v-model:value="note.content"></n-input>
    <n-p class="my-1" v-else>{{ note.content }}</n-p>
    <n-space align="center" justify="space-between">
      <n-p class="my-0 text-xs" depth="3">Aktualizacja: {{ format(new Date(note.updated), 'yyyy-MM-dd HH:mm') }}</n-p>
      <n-space align="center" justify="end">
        <n-button v-if="edit" text class="my-0 text-xs" @click="remove">
          <n-text depth="3" type="error">Usuń</n-text>
        </n-button>
        <n-button text class="my-0 text-xs" @click="editSave">
          <n-text depth="3">{{ edit ? 'Zapisz' : 'Edytuj' }}</n-text>
        </n-button>
      </n-space>
    </n-space>
  </div>
</template>