<script setup lang="ts">
import useStore, { Entry, Subject } from '../store'
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

function openDetails() {
    if (props.subject !== undefined)
        emit('details', props.subject, sub.value)
}
</script>

<template>
    <n-card v-if="subject !== undefined"
        :style="{ 'background-color': sub?.color ?? 'white', '--n-title-text-color': 'black', '--marker-type': sub !== undefined && store.settings.useMarkers ? (store.settings.markers[sub.type!] ?? 'transparent') : 'transparent' }"
        class="select-none subject" size="small" :title="subject.title" @dblclick="openDetails">
        <n-p style="--n-text-color: black">{{ subject.type }}, sala: {{
            subject.room?.join(', ') || 'brak danych'
        }}</n-p>
        <n-progress v-if="inProgress" type="line" :percentage="(95 - time) * 100 / 95" color="rgb(16, 16, 20)"
            rail-color="rgba(36, 36, 39, 0.25)" indicator-text-color="black" processing>{{ time }} min. do końca
        </n-progress>
    </n-card>
</template>

<style lang="scss">
.subject::after {
    content: '';
    height: 100%;
    width: 5px;
    background-color: var(--marker-type, transparent);
    position: absolute;
    top: 0;
    left: 0;
}
</style>