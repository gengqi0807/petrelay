<template>
  <el-container style="padding: 24px;">
    <el-header>
      <h2>我的订单</h2>
      <el-button type="primary" @click="go('/')">返回首页</el-button>
    </el-header>
    <el-main>
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="id" label="订单ID" width="100" />
        <el-table-column label="宠物" width="150">
          <template #default="{ row }">
            {{ row.request?.pet?.petName }} ({{ row.request?.pet?.petType }})
          </template>
        </el-table-column>
        <el-table-column label="服务类型" width="120">
          <template #default="{ row }">
            {{ row.request?.serviceType }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">
            ¥{{ row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="状态" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button v-if="row.orderStatus === 'IN_PROGRESS'" type="primary" size="small" @click="completeOrder(row.id)">完成</el-button>
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
const orders = ref([]);

const loadOrders = async () => {
  try {
    const res = await api.get('/orders/my');
    orders.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const completeOrder = async (orderId) => {
  try {
    await api.post(`/orders/${orderId}/complete`);
    await loadOrders();
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);

onMounted(loadOrders);
</script>
