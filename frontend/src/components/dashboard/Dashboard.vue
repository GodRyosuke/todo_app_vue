<script setup lang="ts">
import { ref } from 'vue'
import Header from './Header.vue'
import Todo from './Todo.vue'

const todoRef = ref<InstanceType<typeof Todo> | null>(null);

async function handleLogoutRequest() {
    if (todoRef.value?.hasUnsavedChanges()) {
        const result = window.confirm(
            '保存されていない変更があります。保存してからログアウトしますか?\n'
            + '「OK」→ 保存してログアウト\n'
            + '「キャンセル」→ 戻る'
        );
        if (!result) {
            return;
        }
        await todoRef.value.syncDB();
    }
    localStorage.removeItem('authToken');
    window.location.href = '/logout';
}
</script>

<template>
    <Header @logout-request="handleLogoutRequest" />
    <Todo ref="todoRef" />
</template>

