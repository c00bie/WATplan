<script setup lang="ts">
import { format, isSameDay, isWithinInterval, subMinutes, addDays, subDays, startOfMonth } from 'date-fns';
import useStore, { Entry, Period, Subject as tSubject } from '../store'
import Subject from './Subject.vue';
import { useThemeVars } from 'naive-ui';
import { CloseFilled } from '@vicons/material'

const props = defineProps<{
    hideHours?: boolean,
    title?: string,
    date?: Date
    disableGesture?: boolean
}>()

const store = useStore()
const today = computed(() => format(props.date ?? store.date, 'yyyy-MM-dd'))
const subs = computed(() => store.entries[store.group]?.filter(e => e.date === today.value))
const themeVars = useThemeVars()
const details = reactive({
    entry: undefined as Entry | undefined,
    subject: undefined as tSubject | undefined
})
const detailsModal = ref(false)

function findSub(per: Period) {
    return subs.value?.find(e => e.timeStart === per.start && e.timeEnd === per.end)
}

function isPeriodNow(per: Period) {
    if (!isSameDay(store.date, store.now)) return false
    const start = new Date(store.date)
    const end = new Date(store.date)
    start.setHours(parseInt(per.start.split(':')[0]), parseInt(per.start.split(':')[1]), 0, 0)
    end.setHours(parseInt(per.end.split(':')[0]), parseInt(per.end.split(':')[1]), 0, 0)
    return isWithinInterval(store.now, { start, end })
}

function isNextPeriod(per: Period) {
    if (!isSameDay(store.date, store.now)) return false
    var start = new Date(store.date)
    const end = new Date(store.date)
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
  if (props.disableGesture) return
  var xDiff = touchStart.x - touchEnd.x
  var yDiff = touchStart.y - touchEnd.y

  if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 100) {
    if (xDiff > 0) {
      store.date = addDays(store.date, store.settings.hideWeekends && store.date.getDay() === 5 ? 3 : 1)
    } else {
      store.date = subDays(store.date, store.settings.hideWeekends && store.date.getDay() === 1 ? 3 : 1)
    }
    store.month = startOfMonth(store.date)
  }
}

function search() {
    if (details.entry?.title) {
        store.search = details.entry.title
        store.searchType = ''
        store.monthMode = true
    }
}
</script>

<template>
    <n-table striped :bordered="false" :bottom-bordered="false"  @touchstart="touchStartHandler" @touchend="touchEndHandler">
        <thead>
            <tr>
                <th v-if="hideHours !== true">Godzina</th>
                <th>{{ title ?? 'Przedmiot' }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(per, i) of store.periods" :key="i">
                <td v-if="hideHours !== true" :style="{'background-color': isPeriodNow(per) ? themeVars.primaryColor + '80 !important' : (isNextPeriod(per) ? themeVars.warningColor + '80 !important' : undefined)}" class="text-center">
                    <span class="text-xl font-bold">{{i+1}}</span><br/>
                    <span class="text-sm">{{per.start}}<br/>{{per.end}}</span>
                </td>
                <td :style="{'background-color': isPeriodNow(per) ? themeVars.primaryColor + '80 !important' : (isNextPeriod(per) ? themeVars.warningColor + '80 !important' : undefined)}">
                    <Subject :subject="findSub(per)" @details="showDetails"></Subject>
                </td>
            </tr>
        </tbody>
    </n-table>
    <n-modal v-model:show="detailsModal" transform-origin="center">
        <n-card :title="details.entry?.title + (details.subject?.short ? ` (${details.subject?.short})` : '')" class="max-w-[1000px] w-[90vw]">
            <template #header-extra>
                <n-button text @click="detailsModal = false">
                    <template #icon>
                        <n-icon :component="CloseFilled" />
                    </template>
                </n-button>
            </template>
            <n-p><b>Rodzaj zajęć:</b> {{details.entry?.type ?? 'brak danych'}}</n-p>
            <n-p><b>Sala:</b> {{details.entry?.room?.join(', ') ?? 'brak danych'}}</n-p>
            <n-p><b>Prowadzący:</b> {{details.subject?.prof ?? 'brak danych'}}</n-p>
            <n-p><b>Nr zajęć:</b> {{details.entry?.num ?? 0}}/{{details?.subject?.numH ?? '??'}}</n-p>
            <n-button class="w-full" primary @click="search">Wyszukaj przedmiot</n-button>
        </n-card>
    </n-modal>
</template>

<style scoped lang="scss">
table {
    :is(th, td):first-child {
        width: 1%;
        white-space: nowrap;
    }
}
</style>