<script lang="ts">
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format, addDays, subDays, addMonths, subMonths, startOfMonth } from 'date-fns'
import useStore from '../store'

const store = useStore()
const weekStart = computed(() => startOfWeek(store.date, { weekStartsOn: 1 }))
const weekEnd = computed(() => endOfWeek(store.date, { weekStartsOn: 1 }))
const days = computed(() => eachDayOfInterval({ start: weekStart.value, end: subDays(weekEnd.value, store.settings.hideWeekends ? 2 : 0) }))

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

</script>

<template>
<div id="weekview" class="grid grid-flow-col">
  <DayView v-for="(d, i) of days" :hide-hours="i !== 0" :date="d" :disable-gesture="true" :title="format(d, 'EEEE')"></DayView>
</div>
</template>

<style lang="scss">
#weekview {
  grid-auto-columns: minmax(0, 1fr);
}
</style>