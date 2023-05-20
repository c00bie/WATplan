<script setup lang="ts">
import useStore, { Entry, Period, Subject as tSubject, ViewMode } from '../store'
import { CloseFilled } from '@vicons/material'

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
  </n-card>
</template>