<script setup lang="ts">
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import axios from 'axios'

    const initialCategoryName = 'Select task category';
    const othersCategoryName = 'Others';
    const categories = ref([
        initialCategoryName,
    ]);
    const categoryNameInputText = ref('');
    const checkedCategories = ref<string[]>([]);

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
            this.m_isDone = false;
            this.m_isUpdated = false;
        }

        get name() { return this.m_name; }
        set name(value: string) {
            if (value === '') {
                throw new Error("Task name cannot be empty");
            }
            this.m_isUpdated = true;
            this.m_name = value; 
        }
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
            } else {
                this.m_status = TodoStatus.TASK;
            }
            this.m_isUpdated = true;
        }
        get isDeleted() { return this.m_status === TodoStatus.DELETED; }
        get isDone() { return this.m_isDone; }
        get isDBSyncRequired() { return this.m_isUpdated; }
        resetDBSyncFlag() { this.m_isUpdated = false; }
        get getNameCssClasses() {
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
        private m_isUpdated: boolean;
    };

    class TodoFormData {
        constructor(actionType: 'add' | 'edit', todoId?: number) {
            this.m_panelTitle = actionType === 'edit' ? 'Edit Task' : 'Add Task';
            this.m_panelButtonText = actionType === 'edit' ? 'Edit' : 'Add';
            if (actionType === 'edit' && todoId === undefined) {
                throw new Error("Todo id is required for edit action");
            }
            if (actionType === 'add' && todoId !== undefined) {
                throw new Error("Todo id must be undefined for add action");
            }
            
            this.m_id = todoId;
            if (todoId !== undefined) {
                const todoItem = todoItems.value.filter(item => item.m_id === todoId)[0];
                if (!todoItem) {
                    throw new Error(`Todo item with id ${todoId} is not found`);
                }
                this.m_name = todoItem.name;
                this.m_categoryName = todoItem.category;
            } else {
                this.m_name = '';
                this.m_categoryName = categories.value[0] ?? '';
            }
        }
        
        public m_id?: number = undefined;
        public readonly m_panelTitle: string;
        public readonly m_panelButtonText: string;
        public m_name: string;
        public m_categoryName: string;
    };
    const todoFormData = ref<TodoFormData | undefined>(undefined);

    const todoItems = ref<TodoItem[]>([]);

    function onChecked(index: number) {
        const item = todoItems.value[index];
        if (!item) return;
        item.check();
    }

    const isShowAddCategoryPanel = ref(false);
    const isShowAddTaskPanel = ref(false);
    function showPanel(type: 'task' | 'category') {
        document.body.classList.add('overflow-hidden');
        if (type === 'task') {
            isShowAddTaskPanel.value = true;
            return;
        }
        isShowAddCategoryPanel.value = true;
    }

    function closePanel(type: 'task' | 'category') {
        document.body.classList.remove('overflow-hidden');
        if (type === 'task') {
            isShowAddTaskPanel.value = false;
            return;
        }
        isShowAddCategoryPanel.value = false;
    }

    async function addTask() {
        todoFormData.value = new TodoFormData('add');
        showPanel('task');
    }

    async function editTask(index: number) {
        const todo: TodoItem = todoItems.value[index] as TodoItem;
        todoFormData.value = new TodoFormData('edit', todo.m_id);
        showPanel('task');
    }
    
    async function sendTask() {
        if (!todoFormData.value) {
            throw new Error("todoFormData is null");
        }
        const isAddTodo = todoFormData.value.m_id === undefined;
        
        if (todoFormData.value.m_name === '') {
            alert("Task name cannot be empty");
            return;
        }

        let categoryName = todoFormData.value.m_categoryName;
        if (categoryName === initialCategoryName) {
            categoryName = othersCategoryName;
        }

        isButtonDisabled.value = true;
        if (isAddTodo) {
            try {
                const res = await axios.post('/api/todos', {
                    name: todoFormData.value.m_name,
                    categoryName: categoryName,
                    is_done: false,
                })
                console.log("add todo res: ", res);
                todoItems.value.push(new TodoItem(res.data.todo.id, todoFormData.value.m_name, categoryName));
            } catch(err: any) {
                console.error(`Failed to add todo: ${err.response?.data?.message ?? err.message}`);
                return;
            } finally {
                isButtonDisabled.value = false;
            }
        } else {
            try {
                if (todoFormData.value.m_id === undefined) {
                    throw new Error("Todo id is required in edit action.");
                }
                await axios.put('/api/todos', {
                    data: {
                        todoItems: [{
                            id: todoFormData.value!.m_id,
                            name: todoFormData.value!.m_name,
                            categoryName: categoryName,
                            is_done: todoItems.value.filter(item => item.m_id === todoFormData.value!.m_id)[0]?.isDone ?? false,
                        }]
                    }
                })

                // update local todo data
                const todoItem = todoItems.value.filter(item => item.m_id === todoFormData.value!.m_id)[0] as TodoItem;
                if (!todoItem) {
                    throw new Error(`Todo item with id ${todoFormData.value!.m_id} is not found`);
                }
                todoItem.name = todoFormData.value!.m_name;
                todoItem.category = categoryName;
                todoItem.resetDBSyncFlag();
            } catch(err: any) {
                console.error(`Failed to edit todo: ${err.response?.data?.message ?? err.message}`);
                return;
            } finally {
                isButtonDisabled.value = false;
            }
        }

        todoFormData.value = undefined;
        closePanel('task');
    }

    function manageCategory() {
        showPanel('category');
    }
    
    async function addCategory() {
        if (categoryNameInputText.value === '') {
            alert("Category name cannot be empty");
            return;
        }
        if (categories.value.includes(categoryNameInputText.value)) {
            // 同一のカテゴリ名は受け付けない
            alert(`Category: ${categoryNameInputText.value} already exists`);
            return;
        }

        isButtonDisabled.value = true;
        try {
            const res = await axios.post('/api/categories', {
                categoryName: categoryNameInputText.value,
            })
            console.log("addCategory: ", res);
            categories.value = categories.value.slice(0, -1);
            categories.value.push(categoryNameInputText.value);
            categories.value.push(othersCategoryName);
            categoryNameInputText.value = '';
        } catch(err: any) {
            console.error(`Failed to add category: ${err.response?.data?.message ?? err.message}`);
            return;
        } finally {
            isButtonDisabled.value = false;
        }

        closePanel('category');
    }

    async function deleteCategory() {
        const deleteCategoryNames = checkedCategories.value;
        isButtonDisabled.value = true;
        try {
            const res = await axios.delete('/api/categories', {
                data: {
                    categoryNames: deleteCategoryNames,
                }
            })
            console.log("deleteCategory: ", res);
            categories.value = categories.value.filter(category => !checkedCategories.value.includes(category));

            // 削除されるカテゴリを保持しているtaskのカテゴリをOthersに更新する
            for (const todoItem of todoItems.value) {
                if (deleteCategoryNames.includes(todoItem.category)) {
                    todoItem.category = othersCategoryName;
                }
            }
        } catch(err: any) {
            console.error(`Failed to delete category: ${err.response?.data?.message ?? err.message}`);
            return;
        } finally {
            isButtonDisabled.value = false;
        }
        
        checkedCategories.value = [];
        closePanel('category');
    }

    async function syncDB() {
        // 削除されたtodoをサーバーに送信する
        const deletedTodoIds = todoItems.value
            .filter((item) => item.isDeleted)
            .map((item) => item.m_id);
        if (deletedTodoIds.length !== 0) {
            const result = window.confirm(`Following todos will be deleted:\n${todoItems.value.filter((item) => item.isDeleted).map((item) => item.name).join(', ')}.\nThis action cannot be undone. Do you want to proceed?`);
            if (!result) {
                return;
            }

            isButtonDisabled.value = true;
            try {
                await axios.delete('/api/todos', {
                    data: {
                        todoIds: deletedTodoIds,
                    }
                })
                todoItems.value = todoItems.value.filter((item) => !item.isDeleted);
            } catch (err: any) {
                console.error(`Failed to delete todos: ${err.response?.data?.message ?? err.message}`);
                return;
            } finally {
                isButtonDisabled.value = false;
            }
        }

        // 変更されたtodoをサーバーに送信する
        const changedTodoItems: TodoItem[] = [];
        for (const item of todoItems.value as TodoItem[]) {
            if (item.isDBSyncRequired) {
                changedTodoItems.push(item);
            }
        }
        isButtonDisabled.value = true;
        try {
            await axios.put('/api/todos', {
                data: {
                    todoItems: changedTodoItems.map((item) => ({
                        id: item.m_id,
                        name: item.name,
                        categoryName: item.category,
                        is_done: item.isDone,
                    })),
                }
            })
            for (const item of changedTodoItems) {
                item.resetDBSyncFlag();
            }
        } catch (err: any) {
            console.error(`Failed to update todos: ${err.response?.data?.message ?? err.message}`);
            return;
        } finally {
            isButtonDisabled.value = false;
        }
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        const hasUnsavedChanges = todoItems.value.some(item => item.isDBSyncRequired || item.isDeleted);
        if (hasUnsavedChanges) {
            event.preventDefault();
        }
    };

    onMounted(async () => {
        // load categories
        const categoryRes = await axios.get('/api/categories')
            .catch(err => {
                return err.response
            });
        console.log("category get res: ", categoryRes);
        if (categoryRes.data === undefined) {
            return;
        }
        for (const category of categoryRes.data) {
            if (category.name === othersCategoryName) {
                // Othersカテゴリは常に最後尾に表示させるため、categoriesの配列には追加しない
                continue;
            }
            categories.value.push(category.name);
        }
        categories.value.push(othersCategoryName);

        // load todos
        const todoRes = await axios.get('/api/todos')
            .catch(err => {
                return err.response
            });
        console.log("todo get: ", todoRes);
        if (todoRes.data === undefined) {
            return;
        }
        for (const todo of todoRes.data) {
            // todoのcategoryIdはdatabaseのidであって、categoriesのindexではないため、categoryIdからcategory nameを特定し、そのnameからcategoriesのindexを特定する必要がある
            const categoryName = categoryRes.data.filter((category: { id: number; name: string }) => category.id === todo.categoryId)[0]?.name;
            const todoItem = new TodoItem(todo.id, todo.name, categoryName);
            if (todo.is_done) {
                todoItem.check();
                todoItem.resetDBSyncFlag();
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
                <button class="btn btn-outline-primary" @click="addTask">Add Task</button>
                <button class="btn btn-outline-secondary" @click="manageCategory">Manage Category</button>
                <button class="btn btn-outline-success" @click="syncDB" :disabled="isButtonDisabled">Save</button>
            </div>

            <div class="overlay-bg position-fixed w-100 h-100" :class="isShowAddTaskPanel ? 'show' : ''">
                <div class="bg-white position-relative overlay-input p-3 rounded">
                    <div class="d-flex justify-content-between mb-2">
                        <h5 class="m-0">{{ todoFormData ? todoFormData.m_panelTitle : '' }}</h5>
                        <span class="d-inline-block material-symbols-outlined cursor-pointer"
                            @click="closePanel('task')">close</span>
                    </div>
                    <div class="mb-3">
                        <label for="task-name" class="form-label">Task Name</label>
                        <input type="text" class="form-control" id="task-name" placeholder="enter task name here"
                            v-if="todoFormData" v-model="todoFormData.m_name">
                    </div>
                    <div class="mb-3">
                        <label for="select-task-category" class="form-label">Select Category</label>
                        <select class="form-select" v-if="todoFormData" v-model="todoFormData.m_categoryName">
                            <option v-for="(category, idx) in categories" :key="idx" :value="category">{{category}}
                            </option>
                        </select>
                    </div>
                    <div class="d-flex align-items-center justify-content-end gap-2">
                        <button type="button" class="btn btn-primary" @click="sendTask" :disabled="isButtonDisabled">{{ todoFormData ? todoFormData.m_panelButtonText : '' }}</button>
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
                            <td :class="todoItem.getNameCssClasses">{{todoItem.name}}</td>
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
                                    @click="todoItem.isDeleted ? todoItem.restore() : todoItem.delete()">{{todoItem.isDeleted
                                    ? 'restore_from_trash' : 'delete'}}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

</template>