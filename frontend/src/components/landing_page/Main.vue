<script setup lang="ts">
    import { ref } from 'vue';

    const menuBtnText = ref('menu');

    function toggleHeaderMenu() {
        menuBtnText.value = menuBtnText.value === 'menu' ? 'close' : 'menu';
    }

    function closeHeaderMenu() {
        menuBtnText.value = 'menu';
    }

    const headerMenuContents = ref([
        {
            title: 'Product',
            link: '#product',
        },
        {
            title: 'Features',
            link: '#features',
        },
        {
            title: 'Pricing',
            link: '#pricing',
        },
    ]);

</script>

<template>

    <body>
        <header class="d-xl-flex align-items-center justify-content-between position-fixed bg-white w-100 px-3 py-2">
            <div class="d-flex d-xl-block align-items-center justify-content-between">
                <a href="">
                    <img src="@/assets/img/page_icon.png" alt="" class="rounded-circle icon me-4">
                </a>
                <div class="d-xl-none d-flex align-items-center justify-content-end text-gray cursor-pointer">
                    <span class="material-symbols-outlined" @click="toggleHeaderMenu">{{ menuBtnText }}</span>
                </div>
            </div>
        </header>
        <div class="header-bars position-fixed d-xl-flex align-items-center justify-content-between p-3 p-xl-0"
            :class="{ 'show': menuBtnText === 'close' }">
            <nav class="list-style-none d-xl-flex gap-4 align-items-center text-gray fw-medium fs-6 mb-5 m-xl-0">
                <li class="mb-2 mb-xl-0" v-for="(item, index) in headerMenuContents" :key="index">
                    <a :href="item.link" @click="closeHeaderMenu">
                        <span>{{ item.title }}</span>
                    </a>
                </li>
            </nav>
            <div class="d-flex align-items-center flex-wrap gap-1">
                <a href="" class="gray-btn rounded fw-medium px-3 py-1">Contact Sales</a>
                <a href="" class="gray-btn rounded fw-medium px-3 py-1">Sign In</a>
                <a href="" class="green-btn rounded fw-medium px-3 py-1">Sign Up for Free</a>
            </div>
        </div>

        <main class="container-fluid">
            <section class="banner d-flex align-items-center justify-content-center">
                <div class="d-flex flex-column align-items-center">
                    <h2 class="d-block pre-title text-white fs-3 text-center mb-4">
                        NEW TODO APP
                    </h2>
                    <h1 class="d-block text-white fw-bold text-center mb-5">
                        The Simple TODO App
                    </h1>
                    <h3 class="d-block text-white text-center fw-normal mb-5">This is a new, simple Todo App for task
                        management.</h3>
                    <a href="" class="d-block green-btn rounded fw-medium px-3 py-1 text-center">Try Our Todo App!</a>
                </div>
            </section>

            <section class="product px-3 mb-5" id="product">
                <h2 class="text-gradiant d-block fs-3 mb-4">
                    PRODUCT
                </h2>
                <div class="d-block text-white fs-4 fw-normal mb-4">
                    Simple, intuitive new task management app.
                </div>
                <img src="@/assets/img/todo_sample_screen.png" alt="todo sample screen" class="w-100">
            </section>

            <section class="features px-3 mb-5" id="features">
                <h2 class="text-gradiant d-block fs-3 mb-4">
                    FEATURES
                </h2>
                <div class="d-block text-white fs-4 fw-normal mb-5">
                    The best way to manage your tasks.
                </div>
                <div class="desc-card rounded d-md-flex align-items-start gap-2 w-100 p-3 mb-3">
                    <div class="desc-card-text-item mb-3">
                        <div class="text-gradiant fs-2 fw-light material-symbols-outlined">
                            add_circle
                        </div>
                        <div class="text-white fw-medium fs-3 mb-3">Easily add tasks.</div>
                        <div class="text-white fw-normal fs-5">You can easily add or remove tasks with intuitive
                            controls.</div>
                    </div>
                    <div class="desc-card-img-item">
                        <img src="@/assets/img/add_task.png" alt="Add Task Image" class="w-100">
                    </div>
                </div>
                <div class="desc-card rounded d-md-flex flex-row-reverse align-items-start gap-2 w-100 p-3 mb-3">
                    <div class="desc-card-text-item mb-3">
                        <div class="text-gradiant fs-1 fw-light material-symbols-outlined">
                            delete_sweep
                        </div>
                        <div class="text-white fw-medium fs-3 mb-3">Permanently delete tasks.</div>
                        <div class="text-white fw-normal fs-5">Task deletion is performed completely.</div>
                    </div>
                    <div class="desc-card-img-item">
                        <img src="@/assets/img/delete_task.png" alt="Delete Task Image" class="w-100">
                    </div>
                </div>
                <div class="desc-card rounded d-md-flex align-items-start gap-1 w-100 p-3">
                    <div class="desc-card-text-item mb-3">
                        <div class="text-gradiant fs-2 fw-light material-symbols-outlined">
                            edit_square
                        </div>
                        <div class="text-white fw-medium fs-3 mb-3">Tasks and categories can be edited.</div>
                        <div class="text-white fw-normal fs-5">Once added items can be modified again.</div>
                    </div>
                    <div class="desc-card-img-item">
                        <img src="@/assets/img/edit_task.png" alt="Edit Task Image" class="w-100">
                    </div>
                </div>
            </section>

            <section class="pricing px-3 mb-5" id="pricing">
                <h2 class="text-gradiant d-block fs-3 mb-4">
                    PRICING
                </h2>
                <div class="text-white fs-3 fw-bold d-flex align-items-center mb-3">
                    FREE
                    <span class="fs-2 material-symbols-outlined">
                        star
                    </span>
                </div>
                <div class="d-block text-white fs-4 fw-medium mb-4">
                    This is a free app! It won't cost you anything!!
                </div>
            </section>

            <section class="bottom d-flex align-items-center justify-content-center gap-1">
                <div class="item d-flex flex-column align-items-center">
                    <h2 class="d-block text-white fs-3 mb-4">
                        Try Our Todo App Now!
                    </h2>
                    <a href="" class="d-block green-btn rounded fw-medium px-3 py-1">Sign Up for Free</a>
                </div>
                <div class="item">
                    <img src="@/assets/img/good.jpg" alt="good image" class="w-100">
                </div>
            </section>
        </main>

        <footer class="text-center text-gray pt-3 bg-black">
            <div class="border-top py-2">
                &copy; 2024 Simple TODO App. All rights reserved.
            </div>
        </footer>
    </body>
</template>