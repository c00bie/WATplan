<script setup lang="ts">
import useStore, { Entry, ViewMode } from '../store'
import { CloseFilled } from '@vicons/material'
import Subject from '../components/Subject.vue'
import { startOfMonth } from 'date-fns'

const store = useStore();

var search = computed(() => {
  if (store.subSearch === undefined) return [];
  var ret: Entry[] = [];
  for (var g in store.entries) {
    if (store.entries[g] === undefined) continue;
    if (g === store.settings.group) continue;
    var e = store.entries[g].find(e => e.hash?.split(':')[1] === store.subSearch?.hash?.split(':')[1]);
    if (e !== undefined) {
      var ent = { ...e };
      ent.group = g;
      ret.push(ent);
    }
  }
  return ret;
});

function showEntry(e: Entry) {
  store.subSearch = undefined;
  store.date = new Date(e.date ?? new Date());
  store.month = startOfMonth(store.date);
  store.group = e.group ?? store.group;
  if (store.mode === ViewMode.Month)
    store.mode = ViewMode.Day;
}

function findSub(e: Entry) {
  return store.subjects[e.group ?? '']?.find(s => s.title === e.title && s.type === e.type);
}

function collision(e: Entry) {
  return store.entries[store.settings.group]?.find(e2 => e2.date === e.date && e2.timeStart === e.timeStart && e2.timeEnd === e.timeEnd);
}
</script>

<template>
  <n-card title="Znalezione zajęcia:" class="max-w-[1000px] w-[90vw]">
    <template #header-extra>
      <n-button text @click="store.subSearch = undefined">
        <template #icon>
          <n-icon :component="CloseFilled" />
        </template>
      </n-button>
    </template>
    <div class="flex flex-col gap-3">
      <Subject v-for="e of search" :subject="e" @details="showEntry(e)">
        <n-p class="my-0" style="--n-text-color: black">{{ e.date }} {{ e.timeStart }}-{{ e.timeEnd}}</n-p>
        <n-p class="my-0" style="--n-text-color: black">Nr zajęć: {{ e.num }}</n-p>
        <n-p class="my-0" style="--n-text-color: black">Prowadzący: {{ findSub(e)?.prof }}</n-p>
        <n-p v-if="collision(e) !== undefined" class="my-0" style="--n-text-color: black">Koliduje z: {{ collision(e)?.title }}</n-p>
      </Subject>
    </div>
  </n-card>
</template>