<script setup lang="ts">
    import { ref } from 'vue'

    const emit = defineEmits<{
        (e: 'logout-request'): void
    }>();

    const isMenuOpen = ref(false);

    const toggleMenu = () => {
        isMenuOpen.value = !isMenuOpen.value;
        document.body.style.overflow = isMenuOpen.value ? 'hidden' : 'auto';
    };

    function logout() {
        emit('logout-request');
    }
</script>

<template>
    <header class="bg-light shadow-sm w-100 position-fixed mb-3 py-2">
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center">
                <a href="" class="text-secondary fs-3 m-0">Todo Management</a>
                <span class="material-symbols-outlined cursor-pointer" @click="toggleMenu">
                    {{ isMenuOpen ? 'close' : 'menu' }}      
                </span>
            </div>
        </div>
    </header>
    <div class="todo-sidebar position-fixed" :class="{ 'show': isMenuOpen }">
        <div class="sidebar position-absolute py-3">
            <ul class="list-style-none fs-5">
                <li class="cursor-pointer d-flex align-items-center mb-3" @click="logout">
                    <span class="material-symbols-outlined">logout </span>Logout
                </li>
            </ul>
        </div>
    </div>
</template>