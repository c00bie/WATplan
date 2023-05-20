<script setup lang="ts">
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format, addDays, subDays, addMonths, subMonths, startOfMonth, isWithinInterval, subMinutes } from 'date-fns'
import useStore, { Entry, Period, Subject as tSubject, ViewMode } from '../store'
import Subject from './Subject.vue';
import { useThemeVars } from 'naive-ui';
import { CloseFilled } from '@vicons/material'

const store = useStore()
const weekStart = computed(() => startOfWeek(store.date, { weekStartsOn: 1 }))
const weekEnd = computed(() => endOfWeek(store.date, { weekStartsOn: 1 }))
const days = computed(() => eachDayOfInterval({ start: weekStart.value, end: subDays(weekEnd.value, store.settings.hideWeekends ? 2 : 0) }))
const today = computed(() => format(store.date, 'yyyy-MM-dd'))
const themeVars = useThemeVars()
const details = reactive({
    entry: undefined as Entry | undefined,
    subject: undefined as tSubject | undefined
})
const detailsModal = ref(false)

function subs(date: Date) {
    return store.entries[store.group]?.filter(e => e.date === format(date, 'yyyy-MM-dd')) ?? []
}

function findSub(date: Date, per: Period) {
    return subs(date).find(e => e.timeStart === per.start && e.timeEnd === per.end)
}

function isPeriodNow(per: Period) {
    if (!isWithinInterval(store.now, { start: weekStart.value, end: weekEnd.value})) return false
    const start = new Date(store.now)
    const end = new Date(store.now)
    start.setHours(parseInt(per.start.split(':')[0]), parseInt(per.start.split(':')[1]), 0, 0)
    end.setHours(parseInt(per.end.split(':')[0]), parseInt(per.end.split(':')[1]), 0, 0)
    return isWithinInterval(store.now, { start, end })
}

function isNextPeriod(per: Period) {
    if (!isWithinInterval(store.now, { start: weekStart.value, end: weekEnd.value})) return false
    var start = new Date(store.now)
    const end = new Date(store.now)
    start.setHours(parseInt(per.start.split(':')[0]), parseInt(per.start.split(':')[1]), 0, 0)
    start = subMinutes(start, per.start === '15:45' ? 40 : 15);
    end.setHours(parseInt(per.start.split(':')[0]), parseInt(per.start.split(':')[1]), 0, 0)
    return isWithinInterval(store.now, { start, end })
}

function showDetails(e: Entry, s: tSubject | undefined) {
    details.entry = e
    details.subject = s
    detailsModal.value = true
}

var touchStart = { x: 0, y: 0 }
var touchEnd = { x: 0, y: 0 }

function touchStartHandler(e: TouchEvent) {
  touchStart.x = e.changedTouches[0].screenX
  touchStart.y = e.changedTouches[0].screenY
}

function touchEndHandler(e: TouchEvent) {
  touchEnd.x = e.changedTouches[0].screenX
  touchEnd.y = e.changedTouches[0].screenY
  handleGesture()
}

function handleGesture() {
  var xDiff = touchStart.x - touchEnd.x
  var yDiff = touchStart.y - touchEnd.y

  if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 100) {
    if (xDiff > 0) {
      store.date = addDays(store.date, 7)
    } else {
      store.date = subDays(store.date, 7)
    }
    store.month = startOfMonth(store.date)
  }
}

function search() {
    if (details.entry?.title) {
        store.search = details.entry.title
        store.searchType = ''
        store.mode = ViewMode.Month
    }
}
</script>

<template>
  <n-table striped :bordered="false" :bottom-bordered="false"  @touchstart="touchStartHandler" @touchend="touchEndHandler">
      <thead>
          <tr>
              <th>Godzina</th>
              <th v-for="(d, i) of days">{{ format(d, 'EEEE') }}</th>
          </tr>
      </thead>
      <tbody>
          <tr v-for="(per, i) of store.periods" :key="i">
              <td :style="{'background-color': isPeriodNow(per) ? themeVars.primaryColor + '80 !important' : (isNextPeriod(per) ? themeVars.warningColor + '80 !important' : undefined)}" class="text-center">
                  <span class="text-xl font-bold">{{i+1}}</span><br/>
                  <span class="text-sm">{{per.start}}<br/>{{per.end}}</span>
              </td>
              <td v-for="(d, i) of days" :style="{'background-color': isPeriodNow(per) ? themeVars.primaryColor + '80 !important' : (isNextPeriod(per) ? themeVars.warningColor + '80 !important' : undefined)}">
                  <Subject :subject="findSub(d, per)" @details="showDetails"></Subject>
              </td>
          </tr>
      </tbody>
  </n-table>
  <n-modal v-model:show="detailsModal" transform-origin="center">
    <DetailsModal :details="details" @close="detailsModal = false"></DetailsModal>
  </n-modal>
</template>

<style scoped lang="scss">
table {
  
  :is(th, td):not(:first-child) {
      width: 13%;
  }

  :is(th, td):first-child {
      width: 1%;
      white-space: nowrap;
  }
}
</style>