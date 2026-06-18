<template>
  <el-container style="padding: 24px; max-width: 800px; margin: 0 auto;">
    <el-header style="display: flex; justify-content: space-between; align-items: center;">
      <h2>消息通知</h2>
      <div>
        <el-button type="primary" size="small" @click="markAllRead">全部已读</el-button>
        <router-link to="/">
          <el-button type="default" style="margin-left: 8px;">首页</el-button>
        </router-link>
      </div>
    </el-header>
    <el-main>
      <div v-if="!notifications.length" style="text-align: center; color: #909399; padding: 48px;">
        暂无通知
      </div>
      <el-card v-for="notification in notifications" :key="notification.id" :class="{ unread: !notification.isRead }" style="margin-bottom: 12px; cursor: pointer;" @click="markRead(notification)">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">
              <el-tag :type="typeTagMap[notification.type] || 'info'" size="small" style="margin-right: 8px;">{{ typeTextMap[notification.type] || '系统' }}</el-tag>
              {{ notification.title }}
            </div>
            <div style="font-size: 13px; color: #606266;">{{ notification.content }}</div>
          </div>
          <div style="font-size: 12px; color: #909399; white-space: nowrap; margin-left: 16px;">
            {{ new Date(notification.created_at).toLocaleString() }}
          </div>
        </div>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import api from '../utils/api';

const notifications = ref([]);

const typeTagMap = {
  APPLICATION: 'primary',
  ORDER: 'warning',
  REVIEW: 'success',
  CERTIFICATION: 'info',
  SYSTEM: 'info',
};

const typeTextMap = {
  APPLICATION: '申请',
  ORDER: '订单',
  REVIEW: '评价',
  CERTIFICATION: '认证',
  SYSTEM: '系统',
};

const loadNotifications = async () => {
  try {
    const res = await api.get('/notifications');
    notifications.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const markRead = async (notification) => {
  if (notification.isRead) return;
  try {
    await api.put(`/notifications/${notification.id}/read`);
    notification.isRead = true;
  } catch (error) {
    console.error(error);
  }
};

const markAllRead = async () => {
  try {
    await api.put('/notifications/read-all');
    notifications.value.forEach((n) => { n.isRead = true; });
    ElMessage.success('已全部标记为已读');
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

onMounted(loadNotifications);
</script>

<style scoped>
.unread {
  border-left: 4px solid #409eff;
}
</style>