<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <el-header class="navbar">
      <div class="navbar-left">
        <h1 class="logo">🐾 PetRelay</h1>
        <p class="tagline">邻里宠物临时托管互助平台</p>
      </div>
      <div class="navbar-right">
        <el-space>
          <el-badge v-if="user" :value="unreadCount" :hidden="unreadCount === 0">
            <el-button type="default" size="large" @click="go('/notifications')">通知</el-button>
          </el-badge>
          <el-avatar v-if="user && user.avatar" :src="user.avatar" size="small" />
          <el-button v-if="user" type="default" size="large" @click="go('/profile')">{{ user.nickname || user.phone }}</el-button>
          <el-button v-if="user" type="danger" size="large" @click="handleLogout">退出</el-button>
          <template v-else>
            <el-button type="primary" size="large" @click="go('/login')">登录</el-button>
            <el-button type="default" size="large" @click="go('/register')">注册</el-button>
          </template>
        </el-space>
      </div>
    </el-header>

    <!-- 主要内容区 -->
    <el-main class="main-content">
      <!-- 未登录状态 -->
      <div v-if="!user" class="welcome-section">
        <el-row :gutter="24" style="margin-bottom: 40px;">
          <el-col :xs="24" :sm="24" :md="12">
            <el-card class="feature-card owner-card" @click="go('/register')" style="cursor: pointer;">
              <div class="card-icon">🐕</div>
              <h3>我是宠物主人</h3>
              <p>寻找可靠的邻居照看我的宠物</p>
              <el-button type="primary" fill="solid">了解更多</el-button>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12">
            <el-card class="feature-card sitter-card" @click="go('/register')" style="cursor: pointer;">
              <div class="card-icon">❤️</div>
              <h3>我是宠托师</h3>
              <p>帮助邻居照看宠物，获得收益</p>
              <el-button type="success" fill="solid">了解更多</el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 宠物主人仪表盘 -->
      <div v-else-if="user.role === 'OWNER'" class="dashboard owner-dashboard">
        <el-row :gutter="24" class="dashboard-cards">
          <el-col v-for="card in ownerCards" :key="card.title" :xs="24" :sm="12" :md="6">
            <el-card class="dashboard-card owner-card" @click="go(card.path)">
              <el-statistic :title="card.title" :value="card.value" />
              <p>{{ card.desc }}</p>
            </el-card>
          </el-col>
        </el-row>
        <el-divider />
        <el-button type="primary" size="large" @click="go('/publish-request')">📝 发布新的托管需求</el-button>
      </div>

      <!-- 宠托师仪表盘 -->
      <div v-else-if="user.role === 'SITTER'" class="dashboard sitter-dashboard">
        <el-row :gutter="24" class="dashboard-cards">
          <el-col v-for="card in sitterCards" :key="card.title" :xs="24" :sm="12" :md="6">
            <el-card class="dashboard-card sitter-card" @click="go(card.path)">
              <el-statistic :title="card.title" :value="card.value" />
              <p>{{ card.desc }}</p>
            </el-card>
          </el-col>
        </el-row>
        <el-divider />
        <el-button type="success" size="large" @click="go('/requests')">🔍 浏览托管需求</el-button>
      </div>
    </el-main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import api from '../utils/api';

const router = useRouter();
const { user, loadUser, logout } = useAuth();
const dashboardData = ref(null);
const unreadCount = ref(0);

const ownerCards = computed(() => [
  {
    title: '我的发布',
    value: dashboardData.value?.myRequests ?? 0,
    desc: '查看当前发布的托管需求',
    path: '/my-requests',
  },
  {
    title: '进行中的订单',
    value: dashboardData.value?.inProgressOrders ?? 0,
    desc: '查看正在执行的订单',
    path: '/my-orders',
  },
  {
    title: '订单历史',
    value: dashboardData.value?.completedOrders ?? 0,
    desc: '查看已完成订单历史',
    path: '/my-orders',
  },
  {
    title: '我的宠物',
    value: dashboardData.value?.myPets ?? 0,
    desc: '管理您的宠物信息',
    path: '/pets',
  },
]);

const sitterCards = computed(() => [
  {
    title: '待处理申请',
    value: dashboardData.value?.pendingApplications ?? 0,
    desc: '查看待处理的申请',
    path: '/my-applications',
  },
  {
    title: '进行中的订单',
    value: dashboardData.value?.inProgressOrders ?? 0,
    desc: '查看正在进行的订单',
    path: '/my-orders',
  },
  {
    title: '已完成订单',
    value: dashboardData.value?.completedOrders ?? 0,
    desc: '查看已完成的订单',
    path: '/my-orders',
  },
  {
    title: '累计评分',
    value: dashboardData.value?.avgRating ?? 0,
    desc: '查看您的平均评分',
    path: '/my-orders',
  },
]);

const loadDashboard = async () => {
  try {
    const res = await api.get('/dashboard');
    dashboardData.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const loadUnreadCount = async () => {
  try {
    const res = await api.get('/notifications/unread-count');
    unreadCount.value = res.data.count;
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);
const handleLogout = () => {
  logout();
  router.push('/');
};

onMounted(async () => {
  await loadUser();
  if (user.value) {
    await loadDashboard();
    await loadUnreadCount();
  }
});
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.navbar {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.tagline {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.main-content {
  padding: 40px 20px;
  min-height: calc(100vh - 100px);
}

.welcome-section {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 40px 20px;
  border: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.feature-card h3 {
  margin: 16px 0 8px;
  font-size: 24px;
  color: #333;
}

.feature-card p {
  margin: 8px 0 20px;
  color: #666;
  font-size: 14px;
}

.card-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.owner-card {
  border-top: 4px solid #409eff;
}

.sitter-card {
  border-top: 4px solid #67c23a;
}

.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.owner-dashboard {
  border-top: 6px solid #409eff;
}

.sitter-dashboard {
  border-top: 6px solid #67c23a;
}

.dashboard :deep(.el-statistic) {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.dashboard .el-button {
  margin-right: 12px;
  margin-top: 20px;
}
</style>
