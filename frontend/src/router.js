import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';
import RequestListView from './views/RequestListView.vue';
import RequestDetailView from './views/RequestDetailView.vue';
import MyRequestsView from './views/MyRequestsView.vue';
import PublishRequestView from './views/PublishRequestView.vue';
import MyApplicationsView from './views/MyApplicationsView.vue';
import MyOrdersView from './views/MyOrdersView.vue';
import ProfileView from './views/ProfileView.vue';
import MyPetsView from './views/MyPetsView.vue';
import { setupRouter } from './router/guards';

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/requests', component: RequestListView, meta: { requiresAuth: true, requiresRole: 'SITTER' } },
  { path: '/requests/:id', component: RequestDetailView, meta: { requiresAuth: true, requiresRole: 'SITTER' } },
  { path: '/my-requests', component: MyRequestsView, meta: { requiresAuth: true } },
  { path: '/publish-request', component: PublishRequestView, meta: { requiresAuth: true } },
  { path: '/my-applications', component: MyApplicationsView, meta: { requiresAuth: true } },
  { path: '/my-orders', component: MyOrdersView, meta: { requiresAuth: true } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/pets', component: MyPetsView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

setupRouter(router);

export default router;
