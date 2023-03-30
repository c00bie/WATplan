<script setup lang="ts">
import useStore from '../store'
import { CloseFilled } from '@vicons/material'
import { SelectMixedOption } from 'naive-ui/es/select/src/interface';

const store = useStore()

const types = computed(() => {
    return [
        {
            label: 'Dowolny',
            value: ''
        },
        ...new Array(...new Set(store.gEntries.filter(e => e.title == store.search).map(e => e.type))).map(e => ({
            label: e as string,
            value: e as string
        }))
    ] as SelectMixedOption[]
})
const subjects = computed(() => {
    return new Array(...new Set(store.gSubjects.map(e => e.title))).sort().map(e => ({
        label: e as string,
        value: e as string
    }))
})
</script>

<template>
    <n-space class="p-3" v-if="store.search" justify="space-between" align="center">
        <div>
            <n-p class="mb-0 text-sm"><n-text depth="3">Szukany przedmiot:</n-text></n-p>
            <n-popselect class="my-0" :options="subjects" v-model:value="store.search" scrollable @on-update:value="store.searchType = ''">
                <n-button class="my-0 text-lg" text>{{ store.search }}</n-button>
            </n-popselect>
            <n-space>
                <n-popselect class="my-0" :options="types" v-model:value="store.searchType">
                    <n-button class="my-0" text>Typ: {{ store.searchType || "Dowolny" }}</n-button>
                </n-popselect>
            </n-space>
        </div>
        <n-button quaternary circle @click="store.search = ''">
            <template #icon>
                <n-icon :component="CloseFilled"></n-icon>
            </template>
        </n-button>
    </n-space>
</template>