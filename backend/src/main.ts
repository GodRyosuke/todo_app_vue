import express from "express";
import { prisma } from './lib/prisma'
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// リクエストログミドルウェア
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

app.get('/api/todos', async (_, res: express.Response) => {
    const todos = await prisma.todo.findMany();
    res.json(todos);
});

app.post('/api/todos', async (req: express.Request, res: express.Response) => {
    console.log("Add todos, body: ", JSON.stringify(req.body));
    if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
        res.status(400).json({ error: 'Invalid todo name' });
        return;
    }

    // dbにOthersカテゴリが存在しない場合は作成する
    const othersCategory = await prisma.category.findMany({
        where: { name: 'Others' },
    });
    if (othersCategory.length === 0) {
        await prisma.category.create({
            data: { name: 'Others' },
        });
    }

    // category idを取得
    const categories = await prisma.category.findMany();
    const dbCategory = categories.filter(category => category.name === req.body.categoryName);
    if (dbCategory.length !== 1 || dbCategory[0] === undefined) {
        res.status(400).json({ error: 'Invalid category name is specified' });
        return;
    }

    const todo = await prisma.todo.create({
        data: {
            name: req.body.name,
            categoryId: dbCategory[0].id,
            is_done: req.body.is_done,
        },
    });

    res.json({ message: "todo task is created!", todo: todo });
})

app.delete('/api/todos', async (req: express.Request, res: express.Response) => {
    console.log("Delete todos, body: ", JSON.stringify(req.body));
    const deletedTodoIds = req.body.todoIds;
    if (!Array.isArray(deletedTodoIds) || deletedTodoIds.some((id) => typeof id !== 'number')) {
        res.status(400).json({ error: 'Invalid todo IDs' });
        return;
    }
    const deleteTodos = await prisma.todo.deleteMany({
        where: {
            id: {
                in: deletedTodoIds,
            },
        },
    });
    res.json({ message: "todos deleted!", deletedCount: deleteTodos.count });
});

app.put('/api/todos', async (req: express.Request, res: express.Response) => {
    console.log("Update todos, body.data: ", JSON.stringify(req.body.data));
    const todoItems = req.body.data.todoItems;
    if (!Array.isArray(todoItems)) {
        res.status(400).json({ error: 'Invalid todo items' });
        return;
    }
    // category nameからcategory idを取得して、todo itemにセットする
    const categories = await prisma.category.findMany();
    for (const item of todoItems) {
        const dbCategory = categories.filter(category => category.name === item.categoryName);
        if (dbCategory.length !== 1 || dbCategory[0] === undefined) {
            res.status(400).json({ error: 'Invalid category name is specified' });
            return;
        }
        await prisma.todo.update({
            where: { id: item.id },
            data: {
                name: item.name,
                categoryId: dbCategory[0].id,
                is_done: item.is_done,
            },
        });
    }
    res.json({ message: "todos updated!" });
});

app.get('/api/categories', async (_, res: express.Response) => {
    const categories = await prisma.category.findMany();
    res.json(categories);
});

app.post('/api/categories', async (req: express.Request, res: express.Response) => {
    console.log("Add category, body: ", JSON.stringify(req.body));
    const categoryName = req.body.categoryName;
    if (typeof categoryName !== 'string' || categoryName.trim() === '') {
        res.status(400).json({ error: 'Invalid category name' });
        return;
    }

    const allCategories = await prisma.category.findMany({});
    if (allCategories.some(category => category.name === categoryName)) {
        res.status(400).json({ error: 'Category already exists' });
        return;
    }
    const category = await prisma.category.create({
        data: {
            name: categoryName,
        },
    });
    res.json({ message: "category created!", category: category });
})

app.delete('/api/categories', async (req: express.Request, res: express.Response) => {
    console.log("Delete categories, body: ", JSON.stringify(req.body));
    const deleteCategoryNames = req.body.categoryNames;
    if (!Array.isArray(deleteCategoryNames) || deleteCategoryNames.some(name => typeof name !== 'string')) {
        res.status(400).json({ error: 'Invalid category names' });
        return;
    }
    const deletedCategoryIds = await prisma.category.findMany({
        where: {
            name: {
                in: deleteCategoryNames,
            },
        },
        select: {
            id: true,
        },
    }).then(categories => categories.map(category => category.id));

    // カテゴリ削除に伴い、削除されたカテゴリに紐づくtodoのcategoryIdをOthersカテゴリのidに更新する
    const othersCategory = await prisma.category.findMany({
        where: { name: 'Others' },
    });
    if (othersCategory.length !== 1 || othersCategory[0] === undefined) {
        res.status(400).json({ error: 'Category "Others" is not found in database' });
        return;
    }
    const othersCategoryId = othersCategory[0].id;
    console.log("othersCategoryId: ", othersCategoryId);
    console.log("deletedCategoryIds: ", deletedCategoryIds);

    await prisma.todo.updateMany({
        where: { categoryId: { in: deletedCategoryIds } },
        data: {
            categoryId: othersCategoryId,
        },
    })

    // 消去されるカテゴリを使用しているtodoはなくなったので、カテゴリを消去
    const deleteCategories = await prisma.category.deleteMany({
        where: {
            name: {
                in: deleteCategoryNames,
            },
        },
    });

    res.json({ message: "categories deleted", deletedCount: deleteCategories.count });
});

app.listen(3000, () => console.log('Server is running'));

