<script setup lang="ts">
import useStore, { ViewMode } from '../store'
import { Github } from '@vicons/fa'
import { Ref } from 'vue';

const store = useStore();
const years = computed(() => store.years.map(y => ({
  value: y,
  label: `${y}/${(parseInt(y) + 1).toString().slice(2)}`
})))
const emit = defineEmits<{
  (e: 'saved'): void
}>()
const showSettings = inject('showSettings') as Ref<boolean>;

const views = [
  {
    value: ViewMode.Day,
    label: 'Dzień'
  },
  {
    value: ViewMode.Week,
    label: 'Tydzień'
  },
  {
    value: ViewMode.Month,
    label: 'Miesiąc'
  }
]

function saveclose() {
  store.saveState();
  showSettings.value = false;
}
</script>

<template>
  <n-card class="max-w-4xl w-[90vw]">
    <n-form>
      <n-form-item label="Wybierz rok">
        <n-select v-model:value="store.year" :options="years"></n-select>
      </n-form-item>
      <n-space>
        <n-switch v-model:value="store.settings.hideWeekends"></n-switch>
        <n-p>Ukryj weekendy</n-p>
      </n-space>
      <n-space class="mt-1">
        <n-switch v-model:value="store.settings.forceWeekView"></n-switch>
        <n-p>Wymuś widok tygodnia</n-p>
      </n-space>
      <n-form-item class="mt-3" label="Wybierz domyślny widok">
        <n-select v-model:value="store.settings.defaultView" :options="views"></n-select>
      </n-form-item>
      <!-- <n-space class="mt-2">
        <n-switch v-model:value="store.settings.useMarkers"></n-switch>
        <n-p>Użyj znaczników</n-p>
      </n-space> -->
      <n-button class="w-full" primary @click="saveclose">Zapisz</n-button>
    </n-form>
    <n-button class="mt-5" text tag="a" href="https://github.com/c00bie/WATplan#readme">
      <template #icon>
        <n-icon>
          <Github />
        </n-icon>
      </template>
      Wyświetl na GitHubie
    </n-button>
  </n-card>
</template>