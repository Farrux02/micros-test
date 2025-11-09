import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/employees'
    },
    {
        path: '/employees',
        name: 'EmployeeList',
        component: () => import('@/modules/employee/components/EmployeeList.vue')
    },
    {
        path: '/employees/:id',
        name: 'EmployeeDetail',
        component: () => import('@/modules/employee/components/EmployeeDetail.vue'),
        props: true
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router