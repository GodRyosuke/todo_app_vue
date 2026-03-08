import { createRouter, createWebHistory } from 'vue-router'
import Main from './components/landing_page/Main.vue'
import Login from './components/landing_page/Login.vue'
import ForgotPass from './components/landing_page/ForgotPass.vue'
import SignUp from './components/landing_page/SignUp.vue'

const routes = [
    {
        path: '/',
        component: Main
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/login/recovery',
        component: ForgotPass
    },
    {
        path: '/sign-up',
        component: SignUp
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export { router }