<script setup lang="ts">
import useStore from '../store'
import { CloseFilled } from '@vicons/material'

const store = useStore()
</script>

<template>
    <n-space class="p-3" v-if="store.search" justify="space-between" align="center">
        <div>
            <n-p class="mb-0 text-sm"><n-text depth="3">Szukany przedmiot:</n-text></n-p>
            <n-p class="mt-0 text-lg">{{store.search}}</n-p>
        </div>
        <n-button quaternary circle @click="store.search = null">
            <template #icon>
                <n-icon :component="CloseFilled"></n-icon>
            </template>
        </n-button>
    </n-space>
</template>