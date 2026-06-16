import { useAuth } from '../composables/useAuth';

export function setupRouter(router) {
  router.beforeEach(async (to, from, next) => {
    const { user, loadUser } = useAuth();
    
    // 从token加载用户（如果未加载过）
    if (!user.value && localStorage.getItem('petrelay_token')) {
      await loadUser();
    }

    // 需求列表只能宠托师访问，未登录则跳转登录
    if (to.path === '/requests') {
      if (!user.value) {
        next('/login');
        return;
      }
      if (user.value.role !== 'SITTER') {
        next('/');
        return;
      }
    }

    // 需要认证的路由
    const authRequiredPaths = ['/my-requests', '/publish-request', '/my-applications', '/my-orders', '/profile', '/pets'];
    if (authRequiredPaths.some(path => to.path.startsWith(path)) && !user.value) {
      next('/login');
      return;
    }

    if (to.path === '/pets' && user.value && user.value.role !== 'OWNER') {
      next('/');
      return;
    }

    if ((to.path === '/publish-request' || to.path === '/my-requests') && user.value && user.value.role !== 'OWNER') {
      next('/');
      return;
    }

    if (to.path.startsWith('/my-applications') && user.value && user.value.role !== 'SITTER') {
      next('/');
      return;
    }

    // 已登录用户不能访问登录/注册页
    if (['/login', '/register'].includes(to.path) && user.value) {
      next('/');
      return;
    }

    next();
  });
}
