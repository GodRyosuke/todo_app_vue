<script setup lang="ts">
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import type { Ref } from 'vue'
    import { v4 as uuid } from 'uuid';
    import axios from 'axios'

    const categories = ref([
        "Select task category",
    ]);
    const checkedCategories = ref<string[]>([]);
    const taskNameInputText = ref('');
    const categoryNameInputText = ref('');
    const selectedCategory = ref<string>(categories.value[0] ?? '');
    const isButtonDisabled = ref(false);
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
        constructor(id: number, name: string, categoryName: string) {
            this.m_id = id;
            this.m_name = name;
            this.m_selectedCategory = categoryName;
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
            this.m_isUpdated = true;
        }
        delete() {
            this.m_status = TodoStatus.DELETED;
            this.m_isUpdated = true;
        }
        restore() {
            if (this.m_isDone) {
                this.m_status = TodoStatus.DONE;
                return;
            }
            this.m_status = TodoStatus.TASK;
            this.m_isUpdated = true;
        }
        get isDeleted() { return this.m_status === TodoStatus.DELETED; }
        get isDone() { return this.m_isDone; }
        get isUpdated() { return this.m_isUpdated; }
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
            if (!categories.value.includes(value)) {
                throw new Error(`Category: ${value} is not found`);
            }
            this.m_selectedCategory = value;
            this.m_isUpdated = true;
        }

        public readonly m_id: number;
        private m_name: string;
        private m_selectedCategory: string;
        private m_status: TodoStatus;
        private m_isDone: boolean;
        private m_isUpdated: boolean = false;
        private m_nameClasses: string[];
    };

    const todoItems = ref<TodoItem[]>([]);
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
    const taskPanelTitle = ref('Add Task');
    function showPanel(type: 'task' | 'category', methodType?: 'add' | 'edit') {
        if (type === 'task') {
            taskPanelTitle.value = methodType === 'edit' ? 'Edit Task' : 'Add Task';
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

    async function addTask() {
        isButtonDisabled.value = true;

        let categoryName = selectedCategory.value;
        if (categoryName === 'Select task category') {
            categoryName = 'Others';
        }
        const res = await axios.post('/api/todos', {
            name: taskNameInputText.value,
            categoryName: categoryName,
            is_done: false,
        })
            .catch(err => {
                return err.response
            });
        console.log("todo task sent!, res: ", res);

        const todoId = res.data?.todo?.id ?? -1;
        todoItems.value.push(new TodoItem(todoId, taskNameInputText.value, categoryName));
        taskNameInputText.value = '';
        selectedCategory.value = categories.value[0] ?? '';

        isButtonDisabled.value = false;
        closePanel('task');
    }

    async function editTask(index: number) {
        const todo: TodoItem = todoItems.value[index] as TodoItem;
        taskNameInputText.value = todo.getName;
        selectedCategory.value = todo.category;
        showPanel('task', 'edit');
    }

    async function addCategory() {
        isButtonDisabled.value = true;

        if (categoryNameInputText.value === '') {
            isButtonDisabled.value = false;
            closePanel('category');
            return;
        }

        if (categories.value.includes(categoryNameInputText.value)) {
            // 同一のカテゴリ名は受け付けない
            isButtonDisabled.value = false;
            closePanel('category');
            return;
        }

        const res = await axios.post('/api/categories', {
            categoryName: categoryNameInputText.value,
        })
            .catch(err => {
                return err.response
            });
        console.log("category sent!, res: ", res);

        categories.value = categories.value.slice(0, -1);
        categories.value.push(categoryNameInputText.value);
        categories.value.push("Others");
        categoryNameInputText.value = '';
        isButtonDisabled.value = false;
        closePanel('category');
    }

    async function deleteCategory() {
        isButtonDisabled.value = true;
        categories.value = categories.value.filter(category => !checkedCategories.value.includes(category));

        const deleteCategoryNames = checkedCategories.value;
        const res = await axios.delete('/api/categories', {
            data: {
                categoryNames: deleteCategoryNames,
            }
        })
            .catch(err => {
                return err.response
            });
        console.log("category delete sent!, res: ", res);

        // 削除されるカテゴリを保持しているtaskのカテゴリをOthersに更新する
        for (const todoItem of todoItems.value) {
            if (deleteCategoryNames.includes(todoItem.category)) {
                todoItem.category = 'Others';
            }
        }
        
        checkedCategories.value = [];
        isButtonDisabled.value = false;
        closePanel('category');
    }

    async function syncDB() {
        // 削除されたtodoをサーバーに送信する
        const deletedTodoIds = todoItems.value
            .filter((item) => item.isDeleted)
            .map((item) => item.m_id);
        if (deletedTodoIds.length !== 0) {
            const result = window.confirm(`Following todos will be deleted:\n${todoItems.value.filter((item) => item.isDeleted).map((item) => item.getName).join(', ')}.\nThis action cannot be undone. Do you want to proceed?`);
            if (!result) {
                return;
            }
            await axios.delete('/api/todos', {
                data: {
                    todoIds: deletedTodoIds,
                }
            })
                .catch(err => {
                    return err.response
                });
    
            todoItems.value = todoItems.value.filter((item) => !item.isDeleted);
        }

        // 変更されたtodoをサーバーに送信する
        const changedTodoItems: TodoItem[] = [];
        for (const item of todoItems.value as TodoItem[]) {
            if (item.isUpdated) {
                changedTodoItems.push(item);
            }
        }
        const res = await axios.put('/api/todos', {
            data: {
                todoItems: changedTodoItems.map((item) => ({
                    id: item.m_id,
                    name: item.getName,
                    categoryName: item.category,
                    is_done: item.isDone,
                })),
            }
        })
            .catch(err => {
                return err.response
            });
        console.log("todo update sent!, res: ", res);
    }

    const handleBeforeUnload = async (event: any) => {
        console.log("リロードまたはページ離脱");
        await syncDB();
    };

    onMounted(async () => {
        // load categories
        const categoryRes = await axios.get('/api/categories')
            .catch(err => {
                return err.response
            });
        console.log("categories received!, res: ", categoryRes);
        if (categoryRes.data === undefined) {
            return;
        }
        for (const category of categoryRes.data) {
            if (category.name === 'Others') {
                continue;
            }
            categories.value.push(category.name);
        }
        categories.value.push('Others');

        // load todos
        const todoRes = await axios.get('/api/todos')
            .catch(err => {
                return err.response
            });
        console.log("todos received!, res: ", todoRes);
        if (todoRes.data === undefined) {
            return;
        }
        for (const todo of todoRes.data) {
            // todoのcategoryIdはdatabaseのidであって、categoriesのindexではないため、categoryIdからcategory nameを特定し、そのnameからcategoriesのindexを特定する必要がある
            const categoryName = categoryRes.data.filter((category: { id: number; name: string }) => category.id === todo.categoryId)[0]?.name;
            const todoItem = new TodoItem(todo.id, todo.name, categoryName);
            if (todo.is_done) {
                todoItem.check();
            }
            todoItems.value.push(todoItem);
        }
        todoItems.value.sort((a, b) => a.m_id - b.m_id);

        window.addEventListener("beforeunload", handleBeforeUnload);
    })

    onBeforeUnmount(() => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
    });
</script>

<template>
    <main class="bg-white">
        <div class="container-fluid w-100 py-4">
            <h3 class="fw-2">Work</h3>
            <div class="d-flex flex-wrap gap-1 py-2">
                <button class="btn btn-outline-primary" @click="showPanel('task')">Add Task</button>
                <button class="btn btn-outline-secondary" @click="showPanel('category')">Manage Category</button>
                <button class="btn btn-outline-success" @click="syncDB">Save</button>
            </div>

            <div class="overlay-bg position-fixed w-100 h-100" :class="isShowAddTaskPanel ? 'show' : ''">
                <div class="bg-white position-relative overlay-input p-3 rounded">
                    <div class="d-flex justify-content-between mb-2">
                        <h5 class="m-0">{{ taskPanelTitle }}</h5>
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
                    </div>
                    <div class="d-flex align-items-center justify-content-end gap-2">
                        <button type="button" class="btn btn-primary" @click="addTask" :disabled="isButtonDisabled">{{ taskPanelTitle }}</button>
                    </div>
                </div>
            </div>

            <div class="overlay-bg position-fixed w-100 h-100" :class="isShowAddCategoryPanel ? 'show' : ''">
                <div class="bg-white position-relative overlay-input p-3 rounded overflow-x-hidden overflow-y-scroll">
                    <div class="d-flex justify-content-between mb-3">
                        <h5 class="m-0">Manage Category</h5>
                        <span class="d-inline-block material-symbols-outlined cursor-pointer"
                            @click="closePanel('category')">close</span>
                    </div>
                    <div class="fw-bold mb-2">Add Category</div>
                    <input type="text" class="form-control input-text mb-3" placeholder="enter category name here"
                        v-model="categoryNameInputText">
                    <div class="d-flex align-items-center justify-content-end gap-2 mb-3">
                        <button class="btn btn-secondary" @click="addCategory" :disabled="isButtonDisabled">Add
                            Category</button>
                    </div>
                    <div class="fw-bold mb-2">Delete Category</div>
                    <table class="table w-100">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(category, index) in categories.slice(1, -1)">
                                <th scope="row">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" :value="category"
                                            v-model="checkedCategories">
                                    </div>
                                </th>
                                <td>{{category}}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="d-flex align-items-center justify-content-end gap-2 mb-3">
                        <button class="btn btn-secondary" @click="deleteCategory"
                            :disabled="checkedCategories.length === 0 || isButtonDisabled">Delete Selected</button>
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
                                <select class="form-select" :disabled="todoItem.isDeleted" v-model="todoItem.category">
                                    <option v-for="category in categories" :value="category">{{category}}</option>
                                </select>
                            </td>
                            <td><span
                                    :class="todoStatuses[todoItem.getStatus].m_htmlClasses">{{todoStatuses[todoItem.getStatus].m_name}}</span>
                            </td>
                            <td>
                                <span class="material-symbols-outlined me-1"
                                    :class="todoItem.isDeleted ? 'text-secondary' : 'cursor-pointer'"
                                    @click="editTask(index)">edit</span>
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