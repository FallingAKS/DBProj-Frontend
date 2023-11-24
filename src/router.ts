import { createRouter, createWebHistory } from 'vue-router'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import HomePage from '@/components/HomePage.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CustomerLogin from '@/components/LoginPage.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ManagerView from '@/components/cinema/CinemaHallView.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AdminView from '@/components/admin/AdminView.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import MovieDetailPage from '@/components/customer/movie/MovieDetailPage.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import StaffMainPage from '@/components/customer/staff/StaffMainPage.vue'

import StaffDetailPage from '@/components/customer/staff/StaffDetailPage.vue'

import CinemaDetailPage from '@/components/customer/cinema/CinemaDetailPage.vue'

import CinemaMainPage from '@/components/customer/cinema/CinemaMainPage.vue'

import CustomerRegister from '@/components/RegisterPage.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ChooseSeatPage from '@/components/customer/ticket/ChooseSeatPage.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import MovieMainPage from "@/components/customer/movie/MovieMainPage.vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TicketSuccessPage from "@/components/customer/ticket/TicketSuccessPage.vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TicketListPage from '@/components/customer/orders/TicketListPage.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/login', component: CustomerLogin },
    { path: '/manager', component: ManagerView },
    { path: '/admin', component: AdminView },
    { path: '/movie/:movieId', component: MovieDetailPage },
    { path: '/staff', component: StaffMainPage },
    { path: '/staff/:staffId', component: StaffDetailPage },
    { path: '/cinema', component: CinemaMainPage },
    { path: '/cinema/:cinemaId', component: CinemaDetailPage },
    { path: '/register', component: CustomerRegister },
    { path: '/buy/:movieId/:cinemaId/:hallId/:startTime', component: ChooseSeatPage },
    { path:'/movie',component:MovieMainPage}, 
    { path: '/buy/success', component: TicketSuccessPage },
    { path: '/tickets', component: TicketListPage }
  ]
})
