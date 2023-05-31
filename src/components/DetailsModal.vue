<script setup lang="ts">
import useStore, { Entry, Period, Subject as tSubject, ViewMode } from '../store'
import { CloseFilled, PlusRound } from '@vicons/material'

const store = useStore()
const props = defineProps<{
  details: ({
    entry: Entry | undefined,
    subject: tSubject | undefined
  })
}>();
const emit = defineEmits<{
  (e: 'close'): void
}>();

function search() {
  if (props.details.entry?.title) {
    store.search = props.details.entry.title
    store.searchType = ''
    store.mode = ViewMode.Month
  }
}

function addNote() {
  if (props.details.entry === undefined) return;
  store.notes.push({
    content: '',
    title: props.details.entry.title!,
    num: props.details.entry.num!,
    type: props.details.entry.type!,
    updated: new Date().getTime()
  })
}
</script>

<template>
  <n-card :title="details.entry?.title + (details.subject?.short ? ` (${details.subject?.short})` : '')" class="max-w-[1000px] w-[90vw]">
    <template #header-extra>
      <n-button text @click="emit('close')">
        <template #icon>
          <n-icon :component="CloseFilled" />
        </template>
      </n-button>
    </template>
    <n-p><b>Rodzaj zajęć:</b> {{ details.entry?.type ?? 'brak danych' }}</n-p>
    <n-p><b>Sala:</b> {{ details.entry?.room?.join(', ') ?? 'brak danych' }}</n-p>
    <n-p><b>Prowadzący:</b> {{ details.subject?.prof ?? 'brak danych' }}</n-p>
    <n-p><b>Nr zajęć:</b> {{ details.entry?.num ?? 0 }}/{{ details?.subject?.numH ?? '??' }}</n-p>
    <n-button class="w-full" primary @click="search">Wyszukaj przedmiot</n-button>
    <n-space class="mt-5" align="center" justify="space-between">
      <n-h4 class="my-0">Notatki</n-h4>
      <n-button @click="addNote" size="small" circle quaternary>
        <template #icon>
          <n-icon>
            <PlusRound />
          </n-icon>
        </template>
      </n-button>
    </n-space>
    <n-scrollbar class="max-h-80 mt-3">
      <Note class="note" v-for="n in store.getNotes(details.entry)" :note="n"></Note>
    </n-scrollbar>
  </n-card>
</template>

<style>
.note:not(:last-child) {
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid gray;
}
</style>