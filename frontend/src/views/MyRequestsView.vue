<template>
  <el-container style="padding: 24px;">
    <el-header style="display: flex; justify-content: space-between; align-items: center;">
      <h2>我的发布</h2>
      <el-button type="primary" @click="go('/requests')">浏览需求</el-button>
    </el-header>
    <el-main>
      <el-table :data="requests" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="serviceType" label="服务类型" />
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column prop="price" label="报价" width="120" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column label="宠物" width="160">
          <template #default="{ row }">
            {{ row.pet?.petName }} ({{ row.pet?.petType }})
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button type="primary" size="mini" @click="viewRequest(row.id)">查看</el-button>
            <el-button v-if="row.status === 'OPEN'" type="success" size="mini" @click="viewReceivedApplications(row.id)">查看申请</el-button>
            <el-button v-if="row.status === 'OPEN'" type="danger" size="mini" @click="deleteRequest(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="申请列表" :visible.sync="applicationDialogVisible" width="700px">
        <div v-if="currentRequest" style="margin-bottom: 16px;">
          <p><strong>需求：</strong>{{ currentRequest.serviceType }} | ¥{{ currentRequest.price }} | 状态：{{ currentRequest.status }}</p>
        </div>
        <el-table :data="applications" style="width: 100%">
          <el-table-column label="申请者" width="140">
            <template #default="{ row }">
              {{ row.sitter?.nickname || '未知' }}
            </template>
          </el-table-column>
          <el-table-column prop="message" label="留言" />
          <el-table-column prop="price" label="报价" width="120" />
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column label="操作" width="220">
            <template #default="{ row }">
              <el-button v-if="row.status === 'PENDING'" type="success" size="mini" @click="approveApplication(row.id)">通过</el-button>
              <el-button v-if="row.status === 'PENDING'" type="danger" size="mini" @click="rejectApplication(row.id)">拒绝</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();
const requests = ref([]);
const applications = ref([]);
const applicationDialogVisible = ref(false);
const currentRequest = ref(null);

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
    await loadRequests();
  } catch (error) {
    console.error(error);
  }
};

const approveApplication = async (id) => {
  try {
    await api.post(`/applications/${id}/accept`);
    applicationDialogVisible.value = false;
    await loadRequests();
  } catch (error) {
    console.error(error);
  }
};

const rejectApplication = async (id) => {
  try {
    await api.post(`/applications/${id}/reject`);
    if (currentRequest.value) {
      await loadReceivedApplications(currentRequest.value.id);
    }
  } catch (error) {
    console.error(error);
  }
};

const viewRequest = (id) => {
  router.push(`/requests/${id}`);
};

const go = (path) => router.push(path);
const back = () => router.back();

onMounted(loadRequests);
</script>
