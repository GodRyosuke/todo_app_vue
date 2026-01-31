<script setup lang="ts">
    import { ref } from 'vue'
    import type { Ref } from 'vue'
    import { v4 as uuid } from 'uuid';

    const categories = ref([
        "Select task category",
        "Work",
        "Personal",
        "Shopping",
        "Others"
    ]);
    const taskNameInputText = ref('');
    const categoryNameInputText = ref('');
    const selectedCategory = ref < string > (categories.value[0] ?? '');
    enum TodoStatus {
        TASK,
        DELETED,
        DONE,
    };
    class TodoStatusData {
        constructor(name: string, htmlClasses: string[]) {
            this.m_name = name;
            this.m_htmlClasses = htmlClasses;
        }
        public readonly m_name: string;
        public readonly m_htmlClasses: string[];
    };
    const todoStatuses: Record<TodoStatus, TodoStatusData> = {
        [TodoStatus.TASK]: new TodoStatusData("Task", ["badge", "text-bg-secondary"]),
        [TodoStatus.DELETED]: new TodoStatusData("Deleted", ["badge", "text-bg-danger"]),
        [TodoStatus.DONE]: new TodoStatusData("Done", ["badge", "text-bg-success"]),
    };

    class TodoItem {
        constructor(name: string, categoryIdx: number) {
            this.m_id = uuid();
            this.m_name = name;
            this.m_categoryIdx = categoryIdx;
            this.m_selectedCategory = categories.value[categoryIdx] ?? '';
            this.m_status = TodoStatus.TASK;
            this.m_nameClasses = [];
            this.m_isDone = false;
        }

        get getName() { return this.m_name; }
        get getStatus() { return this.m_status; }
        check() {
            if (this.m_isDone) {
                this.m_isDone = false;
                this.m_status = TodoStatus.TASK;
            } else {
                this.m_isDone = true;
                this.m_status = TodoStatus.DONE;
            }
        }
        delete() {
            this.m_status = TodoStatus.DELETED;
        }
        restore() {
            if (this.m_isDone) {
                this.m_status = TodoStatus.DONE;
                return;
            }
            this.m_status = TodoStatus.TASK;
        }
        get isDeleted() { return this.m_status === TodoStatus.DELETED; }
        get isDone() { return this.m_isDone; }
        get getNameClasses() {
            const classList: string[] = [];
            if (this.isDeleted) {
                classList.push('text-secondary');
            }
            if (this.isDone) {
                classList.push('text-decoration-line-through');
            }
            return classList;
        }
        get category() {
            return this.m_selectedCategory;
        }
        set category(value: string) {
            this.m_selectedCategory = value;
        }

        public readonly m_id;
        private m_name: string;
        private m_categoryIdx: number;
        private m_selectedCategory: string;
        private m_status: TodoStatus;
        private m_isDone: boolean;
        private m_nameClasses: string[];
    };

    const todoItems = ref < TodoItem[] > ([]);
    const deleteCandidates: number[] = [];



    function onChecked(index: number) {
        const item = todoItems.value[index];
        if (!item) return;
        item.check();
    }

    function deleteTask(index: number) {
        const item = todoItems.value[index];
        if (!item) return;
        if (item.isDeleted) {
            return;
        }
        item.delete();
        deleteCandidates.push(index);
    }

    function restoreTask(index: number) {
        const item = todoItems.value[index];
        if (!item) return;
        if (!item.isDeleted) {
            return;
        }
        item.restore();
        const candidateIdx = deleteCandidates.indexOf(index);
        if (candidateIdx !== -1) {
            deleteCandidates.splice(candidateIdx, 1);
        }
    }

    const isShowAddCategoryPanel = ref(false);
    const isShowAddTaskPanel = ref(false);
    function showPanel(type: 'task' | 'category') {
        if (type === 'task') {
            isShowAddTaskPanel.value = true;
            return;
        }
        isShowAddCategoryPanel.value = true;
    }
    function closePanel(type: 'task' | 'category') {
        if (type === 'task') {
            isShowAddTaskPanel.value = false;
            return;
        }
        isShowAddCategoryPanel.value = false;
    }

    function addTask() {
        let categoryIdx = categories.value.indexOf(selectedCategory.value);
        if ((categoryIdx === -1) || (categoryIdx === 0)) {
            categoryIdx = categories.value.length - 1;
        }
        todoItems.value.push(new TodoItem(taskNameInputText.value, categoryIdx));
        taskNameInputText.value = '';
        selectedCategory.value = categories.value[0] ?? '';
        closePanel('task');
    }

    function addCategory() {
        if (categoryNameInputText.value === '') {
            closePanel('category');
            return;
        }

        if (categories.value.includes(categoryNameInputText.value)) {
            closePanel('category');
            return;
        }
        categories.value = categories.value.slice(0, -1);
        categories.value.push(categoryNameInputText.value);
        categories.value.push("Others");
        categoryNameInputText.value = '';
        closePanel('category');
    }
</script>

<template>
    <main class="bg-white">
        <div class="container-fluid w-100 py-4">
            <h3 class="fw-2">Work</h3>
            <div class="d-flex flex-wrap gap-1 py-2">
                <button class="btn btn-outline-primary" @click="showPanel('task')">Add Task</button>
                <button class="btn btn-outline-secondary" @click="showPanel('category')">Add Category</button>
            </div>

            <div class="overlay-bg position-absolute w-100 h-100" :class="isShowAddTaskPanel ? 'show' : ''">
                <div class="bg-white position-relative overlay-input p-3 rounded">
                    <div class="d-flex justify-content-between mb-2">
                        <h5 class="m-0">Add Task</h5>
                        <span class="d-inline-block material-symbols-outlined cursor-pointer"
                            @click="closePanel('task')">close</span>
                    </div>
                    <div class="mb-3">
                        <label for="task-name" class="form-label">Task Name</label>
                        <input type="text" class="form-control" id="task-name" placeholder="enter task name here"
                            v-model="taskNameInputText">
                    </div>
                    <div class="mb-3">
                        <label for="select-task-category" class="form-label">Select Category</label>
                        <select class="form-select" v-model="selectedCategory">
                            <option v-for="(category, idx) in categories" :key="idx" :value="category">{{category}}
                            </option>
                        </select>
                    </div>"
                    <div class="d-flex align-items-center justify-content-end gap-2">
                        <button type="button" class="btn btn-primary" @click="addTask">Add Task</button>
                    </div>
                </div>
            </div>

            <div class="overlay-bg position-absolute w-100 h-100" :class="isShowAddCategoryPanel ? 'show' : ''">
                <div class="bg-white position-relative overlay-input p-3 rounded">
                    <div class="d-flex justify-content-between mb-2">
                        <h5 class="m-0">Add Category</h5>
                        <span class="d-inline-block material-symbols-outlined cursor-pointer"
                            @click="closePanel('category')">close</span>
                    </div>
                    <input type="text" class="form-control mb-3" placeholder="enter category name here"
                        v-model="categoryNameInputText">
                    <div class="d-flex align-items-center justify-content-end gap-2">
                        <button class="btn btn-secondary" @click="addCategory">Add Category</button>
                    </div>
                </div>
            </div>

            <div class="overflow-x-scroll">
                <table class="table task-table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Category</th>
                            <th scope="col">Status</th>
                            <th scope="col">Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(todoItem, index) in todoItems">
                            <th scope="row">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" @change="onChecked(index)"
                                        :disabled="todoItem.isDeleted" :checked="todoItem.isDone">
                                </div>
                            </th>
                            <td :class="todoItem.getNameClasses">{{todoItem.getName}}</td>
                            <td>
                                <select class="form-select" :disabled="todoItem.isDeleted"
                                    v-model="todoItem.category">
                                    <option v-for="category in categories" :value="category">{{category}}</option>
                                </select>
                            </td>
                            <td><span
                                    :class="todoStatuses[todoItem.getStatus].m_htmlClasses">{{todoStatuses[todoItem.getStatus].m_name}}</span>
                            </td>
                            <td>
                                <span class="material-symbols-outlined me-1"
                                    :class="todoItem.isDeleted ? 'text-secondary' : 'cursor-pointer'">edit</span>
                                <span class="material-symbols-outlined cursor-pointer"
                                    @click="todoItem.isDeleted ? restoreTask(index) : deleteTask(index)">{{todoItem.isDeleted
                                    ? 'restore_from_trash' : 'delete'}}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

</template>