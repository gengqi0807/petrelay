<template>
  <el-container style="padding: 24px;">
    <el-header>
      <h2>托管需求列表</h2>
      <el-button type="primary" @click="go('/')">返回首页</el-button>
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
        <el-table-column label="主人" width="180">
          <template #default="{ row }">
            {{ row.owner?.nickname || '匿名' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const requests = ref([]);

const loadRequests = async () => {
  try {
    const res = await axios.get('/api/requests');
    requests.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const viewDetail = (id) => {
  router.push(`/requests/${id}`);
};

const go = (path) => router.push(path);

onMounted(loadRequests);
</script>
