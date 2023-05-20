<script setup lang="ts">
import { useOsTheme, darkTheme, plPL, datePlPL } from 'naive-ui'
import { startOfMonth } from 'date-fns'
import useStore, { ViewMode } from './store'
import DateScroll from './components/DateScroll.vue';
import DayView from './components/DayView.vue';
import { CalendarMonthFilled, SettingsRound, SearchRound } from '@vicons/material';

const store = useStore()
store.loadState();
const osTheme = useOsTheme()
const theme = computed(() => (osTheme.value === 'dark' ? darkTheme : null))
const date = computed({
  get: () => (store.mode === ViewMode.Month ? store.month : store.date).getTime(),
  set: (value: number) => {
    store.date = new Date(value)
    store.month = startOfMonth(store.date)
    showCalendar.value = false
  }
})
const showCalendar = ref(false)
const showSettings = ref(false)
provide('showSettings', showSettings);
const weekview = computed(() => store.settings.forceWeekView || window.innerWidth >= 1024)
store.mode = store.settings.defaultView === ViewMode.Week && !weekview.value ? ViewMode.Day : store.settings.defaultView;

const groups = computed(() => store.groups.map(g => ({ label: g, value: g })))
store.refresh();

function saveGroup(val: string) {
  store.group = val
  store.saveState();
}

function clickOutside(e: MouseEvent) {
  const btn = document.getElementById('calbtn')
  if (!btn || !btn.contains(e.target as Node)) {
    showCalendar.value = false
  }
}

setInterval(() => {
  store.now = new Date()
}, 1000)
</script>

<template>
  <n-config-provider :theme="theme" :locale="plPL" :date-locale="datePlPL">
    <n-layout class="h-screen max-h-screen min-h-screen">
      <n-layout-header class="sticky top-0 left-0 z-50">
        <n-space class="p-3" justify="space-between" align="center">
          <n-popselect v-model:value="store.group" :options="groups" :on-update:value="saveGroup" scrollable>
            <n-button text>Grupa: {{ store.group }}</n-button>
          </n-popselect>
          <n-space align="center">
            <n-button v-if="store.mode === ViewMode.Month" quaternary circle size="small" @click="store.search = store.gSubjects[0].title!">
              <template #icon>
                <n-icon>
                  <SearchRound />
                </n-icon>
              </template>
            </n-button>
            <n-button quaternary circle size="small" @click="showSettings = true">
              <template #icon>
                <n-icon>
                  <SettingsRound />
                </n-icon>
              </template>
            </n-button>
            <n-tooltip placement="bottom" trigger="manual" :show="showCalendar" :on-clickoutside="clickOutside">
              <template #trigger>
                <n-button id="calbtn" quaternary circle size="small" @click="showCalendar = !showCalendar">
                  <template #icon>
                    <n-icon>
                      <CalendarMonthFilled />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              <n-date-picker panel v-model:value="date" :first-day-of-week="0" :type="store.mode === ViewMode.Month ? 'month' : 'date'"></n-date-picker>
              <n-radio-group v-model:value="store.mode" :style="{'--button-count': 2 + Number(weekview)}">
                <n-radio-button @click="showCalendar = false" :value="ViewMode.Month">Miesiąc</n-radio-button>
                <n-radio-button v-if="weekview" @click="showCalendar = false" :value="ViewMode.Week">Tydzień</n-radio-button>
                <n-radio-button @click="showCalendar = false" :value="ViewMode.Day">Dzień</n-radio-button>
              </n-radio-group>
            </n-tooltip>
          </n-space>
        </n-space>
        <DateScroll class="py-3 px-6"></DateScroll>
        <SearchBar></SearchBar>
      </n-layout-header>
      <n-layout-content>
        <MonthView v-if="store.mode === ViewMode.Month"></MonthView>
        <WeekView v-else-if="store.mode === ViewMode.Week"></WeekView>
        <DayView v-else></DayView>
        <n-modal transform-origin="center" v-model:show="showSettings" title="Ustawienia">
          <Settings></Settings>
        </n-modal>
      </n-layout-content>
    </n-layout>
    <n-global-style></n-global-style>
  </n-config-provider>
</template>

<style scoped lang="scss">
.n-radio-group {
  width: 100%;

  :deep(label) {
    width: calc(100% / var(--button-count, 2));
    text-align: center;
  }
}
</style>
