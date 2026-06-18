<template>
  <el-container style="padding: 24px;">
    <el-header style="display: flex; justify-content: space-between; align-items: center;">
      <h2>我的发布</h2>
      <el-button type="primary" @click="go('/')">首页</el-button>
    </el-header>
    <el-main>
      <el-table :data="requests" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="服务类型" width="120">
          <template #default="{ row }">
            {{ row.serviceType === 'HOME_VISIT' ? '上门喂养' : '寄养' }}
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="报价" width="100" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="宠物" width="160">
          <template #default="{ row }">
            {{ row.pet?.petName }} ({{ row.pet?.breed || row.pet?.petType }})
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewRequest(row.id)">查看</el-button>
            <el-button v-if="row.status === 'OPEN'" type="success" size="small" @click="viewReceivedApplications(row.id)">查看申请</el-button>
            <el-button v-if="row.status === 'OPEN'" type="danger" size="small" @click="deleteRequest(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="applicationDialogVisible" title="申请列表" width="700px">
        <div v-if="currentRequest" style="margin-bottom: 16px;">
          <p><strong>需求：</strong>{{ currentRequest.serviceType === 'HOME_VISIT' ? '上门喂养' : '寄养' }} | ¥{{ currentRequest.price }} | 状态：{{ currentRequest.status }}</p>
        </div>
        <el-table :data="applications" style="width: 100%">
          <el-table-column label="申请者" width="140">
            <template #default="{ row }">
              {{ row.sitter?.nickname || '未知' }}
              <el-tag v-if="row.sitter?.isCertified" type="success" size="small" style="margin-left: 4px;">已认证</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="留言" />
          <el-table-column prop="price" label="报价" width="100" />
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column label="操作" width="260">
            <template #default="{ row }">
              <el-button v-if="row.sitter?.id" type="info" size="small" @click="viewSitterProfile(row.sitter.id)">查看档案</el-button>
              <el-button v-if="row.status === 'PENDING'" type="success" size="small" @click="approveApplication(row.id)">通过</el-button>
              <el-button v-if="row.status === 'PENDING'" type="danger" size="small" @click="rejectApplication(row.id)">拒绝</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>

      <el-dialog v-model="sitterDialogVisible" title="宠托师档案" width="600px">
        <div v-if="sitterProfile">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="昵称">{{ sitterProfile.nickname }}</el-descriptions-item>
            <el-descriptions-item label="认证状态">
              <el-tag v-if="sitterProfile.isCertified" type="success">已认证</el-tag>
              <el-tag v-else type="info">未认证</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="综合评分">{{ sitterProfile.avgRating }} / 5</el-descriptions-item>
            <el-descriptions-item label="评价数">{{ sitterProfile.reviewCount }}</el-descriptions-item>
            <el-descriptions-item label="完成订单">{{ sitterProfile.completedOrders }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ new Date(sitterProfile.created_at).toLocaleDateString() }}</el-descriptions-item>
          </el-descriptions>
          <el-divider content-position="left">历史评价</el-divider>
          <div v-if="sitterProfile.reviews?.length">
            <div v-for="review in sitterProfile.reviews.slice(0, 5)" :key="review.id" style="margin-bottom: 12px; padding: 8px; background: #f5f7fa; border-radius: 6px;">
              <el-rate v-model="review.rating" disabled style="margin-bottom: 4px;" />
              <div style="font-size: 13px; color: #606266;">{{ review.comment || '无评论' }}</div>
              <div style="font-size: 12px; color: #909399;">{{ new Date(review.created_at).toLocaleDateString() }}</div>
            </div>
          </div>
          <div v-else style="color: #909399; text-align: center; padding: 16px;">暂无评价</div>
        </div>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from '../utils/api';

const router = useRouter();
const requests = ref([]);
const applications = ref([]);
const applicationDialogVisible = ref(false);
const currentRequest = ref(null);
const sitterDialogVisible = ref(false);
const sitterProfile = ref(null);

const loadRequests = async () => {
  try {
    const res = await api.get('/requests/my');
    requests.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const loadReceivedApplications = async (requestId) => {
  try {
    const res = await api.get(`/applications/received/${requestId}`);
    applications.value = res.data;
    currentRequest.value = requests.value.find((item) => item.id === requestId) || null;
    applicationDialogVisible.value = true;
  } catch (error) {
    console.error(error);
  }
};

const deleteRequest = async (id) => {
  try {
    await api.delete(`/requests/${id}`);
    ElMessage.success('已删除');
    await loadRequests();
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const approveApplication = async (id) => {
  try {
    await api.post(`/applications/${id}/accept`);
    applicationDialogVisible.value = false;
    ElMessage.success('已通过');
    await loadRequests();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败');
  }
};

const rejectApplication = async (id) => {
  try {
    await api.post(`/applications/${id}/reject`);
    if (currentRequest.value) {
      await loadReceivedApplications(currentRequest.value.id);
    }
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const viewSitterProfile = async (sitterId) => {
  try {
    const res = await api.get(`/users/sitter/${sitterId}`);
    sitterProfile.value = res.data;
    sitterDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取宠托师信息失败');
  }
};

const viewRequest = (id) => {
  router.push(`/requests/${id}`);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const go = (path) => router.push(path);

onMounted(loadRequests);
</script>
