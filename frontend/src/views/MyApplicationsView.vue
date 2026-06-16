<template>
  <el-container style="padding: 24px;">
    <el-header>
      <h2>我的应聘</h2>
      <el-button type="primary" @click="go('/')">返回首页</el-button>
    </el-header>
    <el-main>
      <el-table :data="applications" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="需求" width="200">
          <template #default="{ row }">
            {{ row.request?.pet?.petName }} - {{ row.request?.serviceType }}
          </template>
        </el-table-column>
        <el-table-column label="报价" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" />
        <el-table-column label="申请时间">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleDateString() }}
          </template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();
const applications = ref([]);

const loadApplications = async () => {
  try {
    const res = await api.get('/applications/mine');
    applications.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);

onMounted(loadApplications);
</script>
