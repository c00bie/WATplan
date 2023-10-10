<script setup lang="ts">
import useStore, { ViewMode } from '../store'
import { Github } from '@vicons/fa'
import { ClearRound } from '@vicons/material'
import { Ref } from 'vue';
import { uniqBy } from 'lodash';

const store = useStore();
const years = computed(() => store.yearsText.map(y => ({
  value: y.substring(0, 4),
  label: y
})))
const emit = defineEmits<{
  (e: 'saved'): void
}>()
const showSettings = inject('showSettings') as Ref<boolean>;
const changeId = inject('changeId') as Ref<boolean>;

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

const syncOptions = computed(() => [
  {
    key: 'pull',
    label: store.canSync ? 'Aktualizuj' : 'Uruchom synchronizację'
  },
  {
    key: 'copy',
    label: 'Kopiuj ID'
  },
  {
    key: 'change',
    label: 'Zmień ID'
  }
])

function handleSync(key: string) {
  switch(key) {
    case 'pull':
      if (store.canSync)
        store.pullSettings();
      else
        window.open(`${(import.meta.env.API_URL ?? 'https://api.watplan.coobie.dev')}/register?uid=${store.settings.id}`, '_blank');
      break;
    case 'change':
      showSettings.value = false;
      changeId.value = true;
      break;
    case 'copy':
      navigator.clipboard.writeText(store.settings.id!);
      break;
  }
}

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
      <n-space class="mt-4">
        <n-switch v-model:value="store.settings.hideWeekends"></n-switch>
        <n-p>Ukryj weekendy</n-p>
      </n-space>
      <n-space class="mt-1">
        <n-switch v-model:value="store.settings.forceWeekView"></n-switch>
        <n-p>Wymuś widok tygodnia</n-p>
      </n-space>
      <n-form-item class="mt-4" label="Wybierz domyślny widok">
        <n-select v-model:value="store.settings.defaultView" :options="views"></n-select>
      </n-form-item>
      <n-space class="mt-4">
        <n-switch v-model:value="store.settings.useMarkers"></n-switch>
        <n-p>Użyj znaczników</n-p>
      </n-space>
      <n-collapse class="mt-1" v-if="store.settings.useMarkers">
        <n-collapse-item title="Znaczniki" name="znaczniki">
          <n-scrollbar class="max-h-40">
            <div v-for="t of store.subTypes" class="flex items-center mb-2">
              <n-p class="my-0 basis-52" style="line-height: 1em">{{ t }}</n-p>
              <n-color-picker class="grow" v-model:value="store.settings.markers[t]" :show-alpha="false" default-value="#00000000" :modes="['hex']"></n-color-picker>
              <n-button text @click="delete store.settings.markers[t]">
                <template #icon>
                  <n-icon>
                    <ClearRound />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </n-scrollbar>
        </n-collapse-item>
      </n-collapse>
      <n-space class="mt-4">
        <n-switch v-model:value="store.settings.useCustomColors"></n-switch>
        <n-p>Użyj własnych kolorów</n-p>
      </n-space>
      <n-collapse class="mt-1" v-if="store.settings.useCustomColors">
        <n-collapse-item title="Kolory" name="kolory">
          <n-scrollbar class="max-h-40">
            <div v-for="t of uniqBy(store.gSubjects, x => x.title)" class="flex items-center mb-2">
              <n-p class="my-0 basis-52" style="line-height: 1em">{{ t.title }}</n-p>
              <n-color-picker class="grow" v-model:value="store.settings.customColors[t.title!]" :show-alpha="false" default-value="#00000000" :modes="['hex']"></n-color-picker>
              <n-button text @click="delete store.settings.customColors[t.title!]">
                <template #icon>
                  <n-icon>
                    <ClearRound />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </n-scrollbar>
        </n-collapse-item>
      </n-collapse>
      <n-button class="mt-4 w-full" primary @click="saveclose">Zapisz</n-button>
    </n-form>
    <n-space class="mt-4" align="center" justify="space-between">
      <n-button text tag="a" href="https://github.com/c00bie/WATplan#readme">
        <template #icon>
          <n-icon>
            <Github />
          </n-icon>
        </template>
        Wyświetl na GitHubie
      </n-button>
      <n-dropdown trigger="click" :options="syncOptions" @select="handleSync">
        <n-button text class="w-full text-right font-mono">ID: {{ store.settings.id }}</n-button>
      </n-dropdown>
    </n-space>
    
  </n-card>
</template>

<style scoped>
:deep(.n-form-item-feedback-wrapper) {
  display: none;
}
</style>