<script setup lang="ts">
import useStore, { Entry, Period, Subject as tSubject, ViewMode } from '../store'
import { CloseFilled, PlusRound } from '@vicons/material'

const store = useStore()
const message = useMessage();
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
    content: '<Nowa notatka>',
    hash: props.details.entry.hash!,
    group: store.group,
    updated: new Date().getTime()
  })
}

function transfer() {
  if (props.details.entry === undefined) return;
  store.transferred.push({
    hash: props.details.entry.hash!,
    group: store.group
  })
  message.success("Dodano przedmiot do planu")
  emit('close');
  store.saveState();
}

function untransfer() {
  if (props.details.entry === undefined) return;
  store.transferred = store.transferred.filter(t => t.hash !== props.details.entry?.hash);
  emit('close');
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
    <n-p v-if="details.entry?.group !== undefined"><b>Grupa:</b> {{ details.entry?.group ?? 'brak danych' }}</n-p>
    <n-button class="w-full" primary @click="search">Wyszukaj przedmiot</n-button>
    <n-button class="w-full mt-3" primary @click="emit('close'); store.subSearch = details.entry">Znajdź w innych grupach</n-button>
    <n-button v-if="store.group !== store.settings.group" class="w-full mt-3" primary @click="transfer">Dodaj do swojego planu</n-button>
    <n-button v-if="details.entry?.group !== undefined" class="w-full mt-3" primary @click="untransfer">Usuń ze swojego planu</n-button>
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