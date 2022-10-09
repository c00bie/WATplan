<script setup lang="ts">
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, setDefaultOptions, format, addDays, subDays } from 'date-fns'
import plPL from 'date-fns/locale/pl'
import useStore from '../store'

setDefaultOptions({ locale: plPL })

const store = useStore()
const weekStart = computed(() => startOfWeek(store.date, { weekStartsOn: 1 }))
const weekEnd = computed(() => endOfWeek(store.date, { weekStartsOn: 1 }))
const days = computed(() => eachDayOfInterval({ start: weekStart.value, end: weekEnd.value }))

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
  }
}
</script>

<template>
    <n-space justify="space-between" align="center" @touchstart="touchStartHandler" @touchend="touchEndHandler" class="select-none">
        <n-button v-for="day in days" :key="day.toISOString()" text :color="isSameDay(day, store.date) ? '#63E2B7' : undefined" @click="store.date = day" :class="{'!font-bold': isSameDay(day, store.now)}">
            {{format(day, "d")}}
            <br/>
            {{format(day, "MMM")}}
        </n-button>
    </n-space>
</template>