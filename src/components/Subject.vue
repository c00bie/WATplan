<script setup lang="ts">
import useStore, { Entry, Subject, ViewMode } from '../store'
import { isWithinInterval, differenceInMinutes } from 'date-fns';

const props = defineProps<{
    subject: Entry | undefined
}>()
const emit = defineEmits<{
    (e: 'details', entry: Entry, subject: Subject | undefined): void
}>()

const store = useStore()
const sub = computed(() => {
    var subs = store.gSubjects.filter(s => s.title === props.subject?.title && s.type === props.subject?.type);
    var h = 0;
    var ret = 0;
    if (props.subject && props.subject.num) {
        for (var i = 0; i < subs.length; i++) {
            if (props.subject.num <= (subs[i].numH ?? 0) + h) {
                ret = i;
                break;
            }
            else if (subs[i].numH !== undefined)
                h += subs[i].numH ?? 0;
        }
    }
    return {
        ...subs[ret],
        numH: subs.reduce((a, b) => a + (b.numH ?? 0), 0)
    };
})
const inProgress = computed(() => props.subject !== undefined && isWithinInterval(store.now, { start: new Date(props.subject.date + 'T' + props.subject.timeStart), end: new Date(props.subject.date + 'T' + props.subject.timeEnd) }))
const time = computed(() => {
    if (!inProgress.value) return 0;
    const end = new Date(props.subject?.date + 'T' + props.subject?.timeEnd)
    return differenceInMinutes(end, store.now, { roundingMethod: 'ceil' })
})
const hasNotes = computed(() => store.getNotes(props.subject).length > 0)

function openDetails() {
    if (props.subject !== undefined)
        emit('details', props.subject, sub.value)
}

function getColor() {
    if (sub.value === undefined)
        return 'white';
    return store.subColor(sub.value) ?? sub.value.color ?? 'white';
}
</script>

<template>
    <n-card v-if="subject !== undefined"
        :style="{ 'background-color': getColor(), '--n-title-text-color': 'black', '--marker-type': sub !== undefined && store.settings.useMarkers ? (store.settings.markers[sub.type!] ?? 'transparent') : 'transparent' }"
        class="select-none subject" :class="{'has-notes': hasNotes}" size="small" :title="subject.title" @dblclick="openDetails">
        <n-p style="--n-text-color: black">{{ subject.type }}, sala: {{
            subject.room?.join(', ') || 'brak danych'
        }}</n-p>
        <n-progress v-if="inProgress" type="line" :percentage="(95 - time) * 100 / 95" color="rgb(16, 16, 20)"
            rail-color="rgba(36, 36, 39, 0.25)" indicator-text-color="black" processing :show-indicator="store.mode !== ViewMode.Week">{{ time }} min. do końca
        </n-progress>
        <n-p class="m-0 p-0 text-black" v-if="inProgress && store.mode === ViewMode.Week">{{ time }} min. do końca</n-p>
    </n-card>
</template>

<style lang="scss">
.subject::before {
    content: '';
    height: 100%;
    width: 5px;
    background-color: var(--marker-type, transparent);
    position: absolute;
    top: 0;
    left: 0;
}

.subject.has-notes::after {
    content: '';
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 24 24'%3E%3Cpath d='M21.41 9.41l-4.83-4.83c-.37-.37-.88-.58-1.41-.58H4c-1.1 0-2 .9-2 2v12.01c0 1.1.89 1.99 1.99 1.99H20c1.1 0 2-.9 2-2v-7.17c0-.53-.21-1.04-.59-1.42zM15 5.5l5.5 5.5H16c-.55 0-1-.45-1-1V5.5z' fill='currentColor'%3E%3C/path%3E%3C/svg%3E");    position: absolute;
    background-repeat: no-repeat;
    top: 10px;
    right: 10px;
    width: 1rem;
    height: 1rem;
}
</style>