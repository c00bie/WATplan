<script setup lang="ts">
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format, addDays, subDays, addMonths, subMonths, startOfMonth } from 'date-fns'
import useStore, { ViewMode } from '../store'
import { ChevronLeftRound, ChevronRightRound } from '@vicons/material';

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
      store.date = store.monthMode ? addMonths(store.date, 1) : addDays(store.date, 7)
    } else {
      store.date = store.monthMode ? subMonths(store.date, 1) : subDays(store.date, 7)
    }
    store.month = startOfMonth(store.date)
  }
}
</script>

<template>
  <n-space id="datescroll" :justify="store.mode !== ViewMode.Day ? 'center' : 'space-between'" align="center" @touchstart="touchStartHandler" @touchend="touchEndHandler" class="select-none">
    <n-p v-if="store.mode === ViewMode.Month" class="text-center text-lg" color="#63E2B7">
      {{ format(store.month, 'LLLL yyyy') }}
    </n-p>
    <template v-else-if="store.mode === ViewMode.Week">
      <n-button quaternary circle size="small" @click="store.date = store.monthMode ? subMonths(store.date, 1) : subDays(store.date, 7)">
        <template #icon>
          <n-icon>
            <ChevronLeftRound />
          </n-icon>
        </template>
      </n-button>
      <n-p class="text-center text-lg" color="#63E2B7">{{ format(weekStart, 'dd.MM.yyyy') }} - {{ format(weekEnd, 'dd.MM.yyyy') }}</n-p>
      <n-button quaternary circle size="small" @click="store.date = store.monthMode ? addMonths(store.date, 1) : addDays(store.date, 7)">
        <template #icon>
          <n-icon>
            <ChevronRightRound />
          </n-icon>
        </template>
      </n-button>
    </template>
    <n-badge v-else v-for="day in days" :key="day.toISOString()" :show="isSameDay(day, store.now)" :value="0" dot type="success">
      <n-button text :color="isSameDay(day, store.date) ? '#63E2B7' : undefined" @click="store.date = day" :class="{ '!font-bold': isSameDay(day, store.now) }">
        {{ format(day, "d") }}
        <br />
        {{ format(day, "MMM") }}
      </n-button>
    </n-badge>
  </n-space>
</template>

<style scoped lang="scss">
.n-badge {
  :deep(.n-badge-sup) {
    left: 125%;
    scale: 0.75;
  }
}

@media (pointer: coarse) {
  .n-button:not(.n-button--disabled):hover {
    color: var(--n-text-color) !important;
  }
}</style>