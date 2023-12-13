<script setup lang="ts">
import { startOfWeek, endOfWeek, eachDayOfInterval, endOfMonth, isSameDay, isWithinInterval, isSameMonth, format, startOfMonth, addMonths, subMonths } from 'date-fns'
import useStore, { Entry, ViewMode } from '../store'

const store = useStore()
const month = computed(() => eachDayOfInterval({ start: startOfWeek(store.month), end: endOfWeek(endOfMonth(store.month)) }))
const entries = computed(() => {
    const range = { start: month.value[0], end: month.value[month.value.length - 1] }
    var ent = store.gEntries.filter(entry => isWithinInterval(new Date(entry.date + 'T00:00:00'), range)) ?? []
    ent = [...ent, ...store.transferredEntries.filter(entry => isWithinInterval(new Date(entry.date + 'T00:00:00'), range))]
    ent.sort((a, b) => a.timeStart!.localeCompare(b.timeStart!))
    var res = {} as { [key: string]: Entry[] }
    ent.forEach(e => {
        if (store.search !== '' && (e.title !== store.search ||
            (store.searchType !== '' && e.type !== store.searchType))) return
        if (e.date === undefined) return;
        if (res[e.date] === undefined) res[e.date] = []
        res[e.date].push(e)
    })
    return res
})
const expanded = ref<Date>(new Date());

function getSubject(e: Entry) {
    return store.gSubjects.find(s => s.title === e.title && s.type === e.type)
}

function getColor(e: Entry) {
    const sub = getSubject(e);
    if (sub === undefined)
        return 'white';
    return store.subColor(sub) ?? sub.color ?? 'white';
}

function showDay(date: Date) {
    store.date = date
    store.mode = ViewMode.Day
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
      store.date = addMonths(store.date, 1)
    } else {
      store.date = subMonths(store.date, 1)
    }
    store.month = startOfMonth(store.date)
  }
}
</script>

<template>
    <div id="month" class="p-4" @touchstart="touchStartHandler" @touchend="touchEndHandler">
        <div class="day-head pb-3" v-for="(day, i) in month.slice(0, 7)">
            <n-p class="uppercase text-center font-bold">
                <n-text :type="i == 6 ? 'error' : 'default'">{{format(day, 'E')}}</n-text>
            </n-p>
        </div>
        <div class="day p-1" v-for="(day, i) in month" @dblclick="showDay(day)" @click="expanded = day">
            <n-p class="uppercase text-right mb-1" :class="{'font-bold' : isSameMonth(day, store.month)}">
                <n-text :type="i % 7 == 6 ? 'error' : 'default'" :depth="isSameMonth(day, store.month) ? 1 : 3" :class="{'text-[#63E2B7]': isSameDay(store.now, day)}">{{format(day, 'd')}}</n-text>
            </n-p>
            <div class="entry" v-for="e of entries[format(day, 'yyyy-MM-dd')]" :style="{'background-color': getColor(e)}">
                <n-p v-if="expanded === day" class="text-center text-xs text-black">
                    {{getSubject(e)?.short}} ({{e.type?.['0'] ?? 'w'}}) [{{ e.num }}]
                    <b v-if="e.group !== undefined"> T</b>
                </n-p>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
#month {
    display: grid;
    grid-template-columns: repeat(7, 1fr);

    .day {
        min-height: 75px;
        border-top: 1px solid #808080;

        &:nth-last-child(-n+7) {
            border-bottom: 1px solid #808080;
        }

        .entry {
            min-height: 5px;
            margin: 3px 0;
            padding: 3px;
            border-radius: 5px;
        }
    }
}
</style>