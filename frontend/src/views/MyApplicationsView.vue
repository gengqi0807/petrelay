<template>
  <el-container style="padding: 24px;">
    <el-header style="display: flex; justify-content: space-between; align-items: center;">
      <h2>我的应聘</h2>
      <router-link to="/">
        <el-button type="primary">首页</el-button>
      </router-link>
    </el-header>
    <el-main>
      <el-table :data="applications" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="需求" width="200">
          <template #default="{ row }">
            {{ row.request?.pet?.petName }} - {{ row.request?.serviceType === 'HOME_VISIT' ? '上门喂养' : '寄养' }}
          </template>
        </el-table-column>
        <el-table-column label="我的报价" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACCEPTED' ? 'success' : row.status === 'REJECTED' ? 'danger' : 'warning'" size="small">
              {{ row.status === 'PENDING' ? '待处理' : row.status === 'ACCEPTED' ? '已通过' : '已拒绝' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleDateString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button v-if="row.status === 'PENDING'" type="danger" size="small" @click="cancelApplication(row.id)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
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

const cancelApplication = async (id) => {
  try {
    await api.delete(`/applications/${id}`);
    ElMessage.success('已取消');
    await loadApplications();
  } catch (error) {
    ElMessage.error('取消失败');
  }
};

onMounted(loadApplications);
</script>
