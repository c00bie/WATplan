<script setup lang="ts">
import { useOsTheme, darkTheme, plPL, datePlPL } from 'naive-ui'
import useStore from './store'
import DateScroll from './components/DateScroll.vue';
import DayView from './components/DayView.vue';
import { CalendarMonthFilled } from '@vicons/material';

const store = useStore()
const osTheme = useOsTheme()
const theme = computed(() => (osTheme.value === 'dark' ? darkTheme : null))
const date = computed({
  get: () => store.date.getTime(),
  set: (value: number) => {
    store.date = new Date(value)
    showCalendar.value = false
  }
})
const showCalendar = ref(false)

const groups = computed(() => store.groups.map(g => ({label: g, value: g})))
import('./assets/entries.json').then(entries => {
  store.entries = entries.default
})
import('./assets/subs.json').then(subs => {
  store.subjects = subs.default
})

const savedGroup = localStorage.getItem('group')
if (savedGroup) {
  store.group = savedGroup
}

function saveGroup(val: string) {
  store.group = val
  localStorage.setItem('group', val)
}

setInterval(() => {
  store.now = new Date()
}, 1000)
</script>

<template>
  <n-config-provider :theme="theme" :locale="plPL" :date-locale="datePlPL">
    <n-layout class="h-screen max-h-screen min-h-screen">
      <n-layout-header>
        <n-space class="p-3" justify="space-between" align="center">
          <n-popselect v-model:value="store.group" :options="groups" :on-update:value="saveGroup" scrollable>
            <n-button text>Grupa: {{ store.group }}</n-button>
          </n-popselect>
          <n-tooltip placement="bottom" trigger="manual" :show="showCalendar">
            <template #trigger>
              <n-button quaternary circle size="small" @click="showCalendar = !showCalendar">
                <template #icon>
                  <n-icon>
                    <CalendarMonthFilled />
                  </n-icon>
                </template>
              </n-button>
            </template>
            <n-date-picker panel type="date" v-model:value="date" :first-day-of-week="0"></n-date-picker>
          </n-tooltip>
        </n-space>
        <DateScroll class="py-3 px-6"></DateScroll>
      </n-layout-header>
      <n-layout-content>
        <DayView></DayView>
      </n-layout-content>
    </n-layout>
    <n-global-style></n-global-style>
  </n-config-provider>
</template>

<style scoped>

</style>
