<template>
  <el-container style="padding: 24px;">
    <el-header style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <div style="display:flex; align-items:center; gap: 12px;">
        <h2>托管需求列表</h2>
      </div>
      <router-link to="/">
        <el-button type="primary">首页</el-button>
      </router-link>
    </el-header>
    <el-main>
      <el-card style="margin-bottom: 16px;">
        <el-form :inline="true" :model="filters" label-width="0px" style="width: 100%; gap: 12px; display: flex; flex-wrap: wrap; align-items: center;">
          <el-form-item>
            <el-select v-model="filters.serviceType" placeholder="服务类型" clearable style="width: 180px;">
              <el-option label="上门喂养" value="HOME_VISIT" />
              <el-option label="寄养" value="BOARDING" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.petType" placeholder="宠物类型" clearable style="width: 180px;">
              <el-option label="狗" value="DOG" />
              <el-option label="猫" value="CAT" />
              <el-option label="其他" value="OTHER" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.status" placeholder="状态" style="width: 180px;">
              <el-option label="开放中" value="OPEN" />
              <el-option label="已确认" value="CONFIRMED" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="已取消" value="CANCELLED" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadRequests">筛选</el-button>
            <el-button type="text" @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
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
import { reactive, ref, onMounted } from 'vue';
import api from '../utils/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const requests = ref([]);
const filters = reactive({
  serviceType: '',
  petType: '',
  status: 'OPEN',
});

const loadRequests = async () => {
  try {
    const res = await api.get('/requests', { params: filters });
    requests.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const resetFilters = () => {
  filters.serviceType = '';
  filters.petType = '';
  filters.status = 'OPEN';
  loadRequests();
};

const viewDetail = (id) => {
  router.push(`/requests/${id}`);
};

const go = (path) => router.push(path);
const goHome = () => router.push('/');

onMounted(loadRequests);
</script>
