<script setup lang="ts">
import type { Ref } from 'vue';
import useStore, { ViewMode } from '../store'

const store = useStore();
const newid = ref('');
const changeId = inject('changeId') as Ref<boolean>;
const invalid = computed(() => newid.value.length > 0 && !store.checkID(newid.value));

function save() {
  localStorage.setItem('settings', JSON.stringify({ id: newid.value }));
  window.location.reload();
}
</script>

<template>
  <n-card class="max-w-4xl w-[90vw]">
    <n-p>Po zmianie ID ustawienia i notatki zostaną zresetowane.</n-p>
    <n-p>Jeśli zmieniasz ID żeby zsynchronizować dane - proszę bardzo!</n-p>
    <n-p>Jeśli natomiast chcesz zmienić ID które jest już powiązane z danymi, upewnij się, że wiesz co robisz. Jeśli zapomnisz swojego poprzedniego ID, nie będzie możliwości przywrócenia danych.</n-p>
    <n-input type="text" v-model:value="newid" placeholder="Nowe ID"></n-input>
    <n-p depth="3" class="mt-0">Zostaw puste, aby wygenerować nowe ID.</n-p>
    <n-p v-if="invalid">
      <n-text type="error">
        Podane ID jest nieprawidłowe
      </n-text>
    </n-p>
    <template #action>
      <n-space>
        <n-button type="default" @click="changeId = false">Anuluj</n-button>
        <n-button type="error" @click="save" :disabled="invalid">Zapisz</n-button>
      </n-space>
    </template>
  </n-card>
</template>