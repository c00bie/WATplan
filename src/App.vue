<script setup lang="ts">
import { useOsTheme, darkTheme, plPL, datePlPL } from 'naive-ui'
import { startOfMonth } from 'date-fns'
import useStore, { ViewMode } from './store'
import DateScroll from './components/DateScroll.vue';
import DayView from './views/DayView.vue';
import WeekView from './views/WeekView.vue';
import MonthView from './views/MonthView.vue';
import SubSearch from './modals/SubSearch.vue';
import Settings from './modals/Settings.vue';
import ChangeId from './modals/ChangeId.vue';
import { CalendarMonthFilled, SettingsRound, SearchRound } from '@vicons/material';

const store = useStore()
store.loadState();
if (!store.settings.id || !store.checkID(store.settings.id)) {
  store.generateID();
  store.saveState();
}
store.pullSettings().then(() => {
  if (store.year !== '2023') {
    store.year = '2023';
  }
  if (store.settings.group === '')
    store.settings.group = store.group;
  store.group = store.settings.group;
  store.saveState();
});

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
const changeId = ref(false);
provide('changeId', changeId);
const showSubSearch = computed(() => store.subSearch !== undefined);

watch(weekview, () => {
  if (store.mode === ViewMode.Week && !weekview.value) {
    store.mode = ViewMode.Day
  }
})

const groups = computed(() => store.groups.map(g => ({ 
    label: g, 
    value: g,
    style: store.settings.group === g || store.settings.pinned.includes(g) ? 'font-weight: bold' : ''
  })).sort((a, b) => {
    if (a.value === store.settings.group) return -1;
    if (b.value === store.settings.group) return 1;
    if (store.settings.pinned.includes(a.value) && !store.settings.pinned.includes(b.value)) return -1;
    if (store.settings.pinned.includes(b.value) && !store.settings.pinned.includes(a.value)) return 1;
    return 0;
  }))
store.refresh().then(() => {
  if (localStorage.getItem('migrated') !== '2') {
    store.notes.forEach(n => {
      if ((n as any).title !== undefined) {
        n.hash = store.entries[n.group!].find(e => e.title === (n as any).title && e.type === (n as any).type && e.num === (n as any).num)?.hash ?? '';
        if (n.hash !== '') {
          delete (n as any).title;
          delete (n as any).type;
          delete (n as any).num;
        }
      }
    })
    store.notes = store.notes.filter(n => n.hash !== '');
    localStorage.setItem('migrated', '2');
  }
  store.saveState();
});

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

function pinGroup() {
  if (store.msg) {
    if (store.settings.pinned.includes(store.group))
      store.msg.success('Odpięto grupę')
    else
      store.msg.success('Przypięto grupę')
  }
  store.togglePinned(store.group)
  store.saveState();
}

setInterval(() => {
  store.now = new Date()
}, 1000)
</script>

<template>
  <n-config-provider :theme="theme" :locale="plPL" :date-locale="datePlPL">
    <n-message-provider>
      <n-layout class="h-screen max-h-screen min-h-screen">
        <n-layout-header class="sticky top-0 left-0 z-50">
          <n-space class="p-3" justify="space-between" align="center">
            <n-popselect v-model:value="store.group" :options="groups" :on-update:value="saveGroup" scrollable>
              <n-button @contextmenu.prevent="pinGroup" text>Grupa: {{ store.group }}</n-button>
            </n-popselect>
            <n-space align="center">
              <n-button v-if="store.mode === ViewMode.Month" quaternary circle size="small"
                @click="store.search = store.gSubjects[0].title!">
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
                <n-date-picker panel v-model:value="date" :first-day-of-week="0"
                  :type="store.mode === ViewMode.Month ? 'month' : 'date'"></n-date-picker>
                <n-radio-group v-model:value="store.mode" :style="{ '--button-count': 2 + Number(weekview) }">
                  <n-radio-button @click="showCalendar = false" :value="ViewMode.Month">Miesiąc</n-radio-button>
                  <n-radio-button v-if="weekview" @click="showCalendar = false"
                    :value="ViewMode.Week">Tydzień</n-radio-button>
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
          <n-modal transform-origin="center" v-model:show="changeId" title="Zmień ID">
            <ChangeId></ChangeId>
          </n-modal>
          <n-modal transform-origin="center" v-model:show="showSubSearch" title="Wyszukaj zajęcia">
            <SubSearch></SubSearch>
          </n-modal>
        </n-layout-content>
      </n-layout>
      <n-global-style></n-global-style>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped lang="scss">
.n-radio-group {
  width: 100%;

  :deep(label) {
    width: calc(100% / var(--button-count, 2));
    text-align: center;
  }
}</style>
