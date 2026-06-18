<template>
  <el-container style="padding: 24px;">
    <el-header style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 18px">需求详情</span>
      <el-button type="primary" @click="goHome">首页</el-button>
    </el-header>
    <el-main>
      <el-alert v-if="loadError" :title="loadError" type="error" show-icon style="margin-bottom: 16px;" />
      <el-skeleton v-if="loading" rows="6" animated />
      <el-card v-else-if="request">
        <p><strong>服务类型：</strong>{{ request.serviceType }}</p>
        <p><strong>开始时间：</strong>{{ request.startTime }}</p>
        <p><strong>结束时间：</strong>{{ request.endTime }}</p>
        <p><strong>宠物：</strong>{{ request.pet?.petName || '暂无数据' }} ({{ request.pet?.petType || '未知' }})</p>
        <p><strong>地址：</strong>{{ request.address || request.owner?.address || '暂无地址' }}</p>
        <p><strong>报价：</strong>¥{{ request.price }}</p>
        <p><strong>特殊要求：</strong>{{ request.specialReq || '无' }}</p>
        <p><strong>发布者：</strong>{{ request.owner?.nickname || '匿名' }}</p>
        <p v-if="suggestedPrice !== null"><strong>系统建议价格：</strong>¥{{ suggestedPrice }}</p>
        <el-button v-if="user?.role === 'OWNER' && request.ownerId === user.id && request.status === 'OPEN'" type="danger" size="mini" style="margin-bottom: 16px;" @click="deleteRequest">删除需求</el-button>
        <el-divider />
        <template v-if="canApply">
          <el-form label-position="top">
            <el-form-item label="自我介绍">
              <el-input type="textarea" v-model="message" placeholder="告诉宠主你是如何照顾宠物的" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="apply">申请接单</el-button>
            </el-form-item>
          </el-form>
        </template>
        <template v-else-if="user?.role === 'SITTER'">
          <el-alert title="该申请已关闭或您是该需求发布者，无法再申请" type="warning" show-icon />
        </template>
        <template v-else>
          <el-alert title="当前仅宠托师可申请该需求" type="info" show-icon />
        </template>
      </el-card>
      <div v-else-if="!loading && !loadError" style="text-align: center; color: #909399; margin-top: 24px;">
        当前需求信息为空，请返回列表后重试。
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../utils/api';
import { useAuth } from '../composables/useAuth';

const route = useRoute();
const router = useRouter();
const { user } = useAuth();
const request = ref(null);
const message = ref('');
const loading = ref(true);
const loadError = ref('');

const loadRequest = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const res = await api.get(`/requests/${route.params.id}`);
    request.value = res.data;
  } catch (error) {
    console.error(error);
    loadError.value = error.response?.data?.message || '加载需求详情失败';
  } finally {
    loading.value = false;
  }
};

const suggestedPrice = computed(() => {
  if (!request.value || !request.value.startTime || !request.value.endTime) return null;
  const start = new Date(request.value.startTime);
  const end = new Date(request.value.endTime);
  if (isNaN(start) || isNaN(end) || end <= start) return null;
  const days = Math.max(1, Math.ceil((end - start) / 1000 / 60 / 60 / 24));
  const rate = request.value.serviceType === 'HOME_VISIT' ? 50 : 80;
  return days * rate;
});

const apply = async () => {
  try {
    await api.post('/applications', {
      requestId: request.value.id,
      message: message.value,
    });
    router.push('/requests');
  } catch (error) {
    console.error(error);
  }
};

const canApply = computed(() => {
  return user.value?.role === 'SITTER' && request.value && request.value.ownerId !== user.value.id && request.value.status === 'OPEN';
});

const deleteRequest = async () => {
  if (!request.value) return;
  try {
    await api.delete(`/requests/${request.value.id}`);
    go('/my-requests');
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);
const goHome = () => router.push('/');

onMounted(loadRequest);
</script>
