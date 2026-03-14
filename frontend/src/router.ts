import { createRouter, createWebHistory } from 'vue-router'
import Main from './components/landing_page/Main.vue'
import Login from './components/landing_page/Login.vue'
import Logout from './components/landing_page/Logout.vue'
import ForgotPass from './components/landing_page/ForgotPass.vue'
import SignUp from './components/landing_page/SignUp.vue'
import Verify from './components/landing_page/Verify.vue'
import Dashboard from './components/dashboard/Dashboard.vue'

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
        path: '/logout',
        component: Logout
    },
    {
        path: '/sign-up',
        component: SignUp
    },
    {
        path: '/verify',
        component: Verify
    },
    {
        path: '/dashboard',
        component: Dashboard
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export { router }