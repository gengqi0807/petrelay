<template>
  <el-container style="padding: 24px;">
    <el-header>
      <el-button type="primary" @click="go('/requests')">返回列表</el-button>
      <span style="margin-left: 16px; font-size: 18px">需求详情</span>
    </el-header>
    <el-main>
      <el-card v-if="request">
        <p><strong>服务类型：</strong>{{ request.serviceType }}</p>
        <p><strong>开始时间：</strong>{{ request.startTime }}</p>
        <p><strong>结束时间：</strong>{{ request.endTime }}</p>
        <p><strong>宠物：</strong>{{ request.pet.petName }} ({{ request.pet.petType }})</p>
        <p><strong>特殊要求：</strong>{{ request.specialReq || '无' }}</p>
        <p><strong>发布者：</strong>{{ request.owner.nickname || '匿名' }}</p>
        <el-divider />
        <el-form label-position="top">
          <el-form-item label="报价（元）">
            <el-input v-model="price" type="number" placeholder="填写报价" />
          </el-form-item>
          <el-form-item label="自我介绍">
            <el-input type="textarea" v-model="message" placeholder="告诉宠主你是如何照顾宠物的" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="apply">申请接单</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../utils/api';

const route = useRoute();
const router = useRouter();
const request = ref(null);
const price = ref('');
const message = ref('');

const loadRequest = async () => {
  try {
    const res = await api.get(`/requests/${route.params.id}`);
    request.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const apply = async () => {
  try {
    await api.post('/applications', {
      requestId: request.value.id,
      price: Number(price.value),
      message: message.value,
    });
    router.push('/requests');
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);

onMounted(loadRequest);
</script>
