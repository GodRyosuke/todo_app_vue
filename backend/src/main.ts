import express from "express";
import { prisma } from './lib/prisma'
import cors from 'cors';
import * as crypt from 'crypto-ts';
import * as bcrypt from 'bcrypt-ts';
import nodemailer from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import jwt, { JwtPayload } from 'jsonwebtoken';

const app = express();

app.use(cors());
app.use(express.json());

// リクエストログミドルウェア
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

function validateAuthUserId(req: express.Request): number | undefined {
    const header = req.headers.authorization

    if (!header) {
        return undefined;
    }

    const token = header.split(" ")[1]
    if (!token) {
        return undefined;
    }

    try {
        const decoded: JwtPayload = jwt.verify(token, tokenSecret()) as JwtPayload;

        return decoded.userId;
    } catch {
        return undefined;
    }
}

app.get('/api/todos', async (req: express.Request, res: express.Response) => {
    const userId = validateAuthUserId(req);
    if (!userId) {
        console.error("User authentication error. Invalid or missing token");
        res.status(401).json({ error: 'Invalid or missing token' });
        return;
    }
    
    const todos = await prisma.todo.findMany({
        where: { userId: userId },
    });
    res.json(todos);
});

app.post('/api/todos', async (req: express.Request, res: express.Response) => {
    console.log("Add todos, body: ", JSON.stringify(req.body));

    const userId = validateAuthUserId(req);
    if (!userId) {
        console.error("User authentication error. Invalid or missing token");
        res.status(401).json({ error: 'Invalid or missing token' });
        return;
    }

    if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
        res.status(400).json({ error: 'Invalid todo name' });
        return;
    }

    // dbにOthersカテゴリが存在しない場合は作成する
    const othersCategory = await prisma.category.findMany({
        where: { name: 'Others', userId: userId },
    });
    if (othersCategory.length === 0) {
        await prisma.category.create({
            data: { 
                name: 'Others',
                userId: userId,
             },
        });
    }

    // category idを取得
    const categories = await prisma.category.findMany({
        where: { userId: userId },
    });
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
            userId: userId,
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
    const userId = validateAuthUserId(req);
    if (!userId) {
        console.error("User authentication error. Invalid or missing token");
        res.status(401).json({ error: 'Invalid or missing token' });
        return;
    }
    const categories = await prisma.category.findMany({
        where: { userId: userId },
    });
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

app.get('/api/categories', async (req: express.Request, res: express.Response) => {
    const userId = validateAuthUserId(req);
    if (!userId) {
        console.error("User authentication error. Invalid or missing token");
        res.status(401).json({ error: 'Invalid or missing token' });
        return;
    }
    
    const categories = await prisma.category.findMany({
        where: { userId: userId },
    });
    res.json(categories);
});

app.post('/api/categories', async (req: express.Request, res: express.Response) => {
    const userId = validateAuthUserId(req);
    if (!userId) {
        console.error("User authentication error. Invalid or missing token");
        res.status(401).json({ error: 'Invalid or missing token' });
        return;
    }
    
    console.log("Add category, body: ", JSON.stringify(req.body));
    const categoryName = req.body.categoryName;
    if (typeof categoryName !== 'string' || categoryName.trim() === '') {
        res.status(400).json({ error: 'Invalid category name' });
        return;
    }

    const allCategories = await prisma.category.findMany({
        where: { userId: userId },
    });
    if (allCategories.some(category => category.name === categoryName)) {
        res.status(400).json({ error: 'Category already exists' });
        return;
    }
    const category = await prisma.category.create({
        data: {
            name: categoryName,
            userId: userId,
        },
    });
    res.json({ message: "category created!", category: category });
})

app.delete('/api/categories', async (req: express.Request, res: express.Response) => {
    const userId = validateAuthUserId(req);
    if (!userId) {
        console.error("User authentication error. Invalid or missing token");
        res.status(401).json({ error: 'Invalid or missing token' });
        return;
    }
    
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
            userId: userId,
        },
        select: {
            id: true,
        },
    }).then(categories => categories.map(category => category.id));

    // カテゴリ削除に伴い、削除されたカテゴリに紐づくtodoのcategoryIdをOthersカテゴリのidに更新する
    const othersCategory = await prisma.category.findMany({
        where: { name: 'Others', userId: userId },
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
            userId: userId,
        },
    });

    res.json({ message: "categories deleted", deletedCount: deleteCategories.count });
});

async function sendEmail(toAddress: string, subject: string, htmlContent: string) {
    const smtpConfig: SMTPTransport.Options = {
        host: process.env.MAIL_SERVER_HOST_NAME,
        port: Number(process.env.MAIL_SERVER_PORT) || 587,
    };
    if (process.env.MAIL_USE_SECURE === 'true') {
        smtpConfig['secure'] = true;
        smtpConfig['auth'] = {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        };
    }
    const transporter = nodemailer.createTransport(smtpConfig);
    await transporter.sendMail({
        from: process.env.MAIL_FROM || 'noreply@example.com',
        to: toAddress,
        subject: subject,
        html: htmlContent
    });
}

function tokenSecret() {
    return process.env.TOKEN_SECRET || 'default_secret';
}

app.post('/api/sign-up', async (req: express.Request, res: express.Response) => {
    console.log("Sign up, body: ", JSON.stringify(req.body));

    const { username, email, password } = req.body;
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        console.error("Invalid input: ", req.body);
        res.status(400).json({
            code: 'INVALID_INPUT',
            error: 'Invalid input'
        });
        return;
    }

    // すでに同じメールアドレスのユーザーが存在するか確認
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        if (!existingUser.verified) {
            // 未認証の場合、ユーザーを削除して再度作成する（verification emailも再送する）。認証済みの場合はエラーを返す。
            await prisma.user.delete({
                where: { id: existingUser.id },
            });
        } else {
            // 認証済みユーザーが存在する場合はエラーを返す 
            console.error("User with this email already exists: ", email);
            res.status(400).json({
                code: 'EMAIL_ALREADY_EXISTS',
                error: 'User with this email already exists'
            });
            return;
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypt.AES.encrypt(username, tokenSecret()).toString();

    await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
            verifyToken: token,
            tokenExpiry: new Date(Date.now() + 1000 * 60 * 60), // 1hour expiration
        },
    });

    const verifyLink =
        `${process.env.SERVICE_DOMAIN}/verify?token=${encodeURIComponent(token)}`;  // "+"がURLエンコードされるようにencodeURIComponentを使用

    await sendEmail(email, "[TODO APP] Verify your account", `
      <h1>Account verification</h1>
      <a href="${verifyLink}">Click here</a>
    `);

    res.json({ message: "Unverified user is created and verification email is sent" });
});

app.get('/api/verify', async (req: express.Request, res: express.Response) => {
    const { token } = req.query;
    console.log("Verify account, token: ", token);

    if (token === undefined || typeof token !== 'string') {
        console.error("Invalid token: ", token);
        res.status(400).json({ error: 'Invalid token' });
        return;
    }

    const user = await prisma.user.findFirst({
        where: {
            verifyToken: token,
            tokenExpiry: {
                gt: new Date()
            }
        }
    });

    if (!user) {
        console.error("Invalid or expired token: ", token);
        res.status(400).json({
            code: 'INVALID_OR_EXPIRED_TOKEN',
            error: 'Invalid or expired token'
        });
        return;
    }

    if (user.verified) {
        console.error("User is already verified: ", user.id);
        res.status(400).json({ error: 'User is already verified' });
        return;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { verified: true, verifyToken: null, tokenExpiry: null },
    });

    await sendEmail(user.email, "[TODO APP] Thank you for creating account!", `
        <h1>Thank you for creating an account!</h1>
        <p>Verification is successful and you can now login and start using our todo app!</p>
        <a href="${process.env.SERVICE_DOMAIN}/dashboard">Click here to go to dashboard</a><br>
        <a href="${process.env.SERVICE_DOMAIN}/login">Click here to login</a>
    `);

    res.json({ message: 'Account verified successfully' });
});

app.post('/api/login', async (req: express.Request, res: express.Response) => {
    console.log("Login, body: ", JSON.stringify(req.body));

    const { email, password, staySignedIn } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || typeof staySignedIn !== 'boolean') {
        console.error("Invalid input: ", req.body);
        res.status(400).json({
            code: 'INVALID_INPUT',
            error: 'Invalid input'
        });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        console.error("User with this email does not exist: ", email);
        res.status(400).json({
            code: 'EMAIL_NOT_FOUND',
            error: 'User with this email does not exist'
        });
        return;
    }
    // validate password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        console.error("Invalid password for email: ", email);
        res.status(400).json({
            code: 'INVALID_PASSWORD',
            error: 'Invalid password'
        });
        return;
    }

    if (!user.verified) {
        console.error("User is not verified: ", email);
        res.status(400).json({
            code: 'USER_NOT_VERIFIED',
            error: 'User is not verified'
        });
        return;
    }

    const token = jwt.sign(
        { userId: user.id },
        process.env.TOKEN_SECRET || 'default_secret',
        { expiresIn: "7d" }
    )

    res.json({ message: "Login successful", token });
});

app.post('/api/verify-token', async (req: express.Request, res: express.Response) => {
    console.log("Verify authentication");

    const userId = validateAuthUserId(req); // tokenの内容をログに出力するためだけに呼び出す。実際のユーザーIDは使用しない。
    if (!userId) {
        console.error("Invalid or missing token");
        res.status(401).json({ error: 'Invalid or missing token' });
        return;
    }

    res.json({ message: 'Token is valid' });
});

app.listen(3000, () => console.log('Server is running'));

