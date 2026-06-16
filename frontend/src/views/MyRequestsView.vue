<template>
  <el-container style="padding: 24px;">
    <el-header>
      <h2>我的发布</h2>
      <el-button type="primary" @click="go('/requests')">浏览需求</el-button>
    </el-header>
    <el-main>
      <el-table :data="requests" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="serviceType" label="服务类型" />
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column label="宠物" width="160">
          <template #default="{ row }">
            {{ row.pet?.petName }} ({{ row.pet?.petType }})
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" />
      </el-table>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();
const requests = ref([]);

const loadRequests = async () => {
  try {
    const res = await api.get('/requests/my');
    requests.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);

onMounted(loadRequests);
</script>
