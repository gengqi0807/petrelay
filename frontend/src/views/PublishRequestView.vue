<template>
  <el-container style="padding: 24px;">
    <el-header style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display:flex; align-items:center; gap: 12px;">
        <el-button type="text" @click="back">返回</el-button>
        <h2>发布托管需求</h2>
      </div>
      <el-button type="primary" @click="go('/requests')">返回列表</el-button>
    </el-header>
    <el-main>
      <el-card>
        <el-form :model="form" label-width="120px">
          <el-form-item label="宠物">
            <el-select v-model="form.petId" placeholder="选择宠物" clearable>
              <el-option v-for="pet in pets" :key="pet.id" :label="`${pet.petName} (${pet.petType})`" :value="pet.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="服务类型">
            <el-select v-model="form.serviceType" placeholder="选择服务类型">
              <el-option label="上门喂养" value="HOME_VISIT" />
              <el-option label="寄养" value="BOARDING" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="价格（元）">
            <el-input-number v-model="form.price" :min="0" :step="1" style="width: 100%;" />
            <div v-if="suggestedPrice !== null" style="margin-top: 6px; color: #909399; font-size: 12px;">
              系统建议价格：¥{{ suggestedPrice }}
            </div>
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="form.address" placeholder="请输入地址" />
          </el-form-item>
          <el-form-item label="特殊要求">
            <el-input type="textarea" v-model="form.specialReq" placeholder="填写特殊要求" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="publish">发布需求</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();
const form = reactive({
  petId: null,
  startTime: null,
  endTime: null,
  serviceType: 'HOME_VISIT',
  price: 0,
  address: '',
  specialReq: '',
});
const pets = ref([]);
const suggestedPrice = computed(() => {
  if (!form.startTime || !form.endTime || !form.serviceType) return null;
  const start = new Date(form.startTime);
  const end = new Date(form.endTime);
  if (isNaN(start) || isNaN(end) || end <= start) return null;
  const hours = (end - start) / 1000 / 60 / 60;
  const days = Math.max(1, Math.ceil(hours / 24));
  const rate = form.serviceType === 'HOME_VISIT' ? 50 : 80;
  return days * rate;
});

const publish = async () => {
  try {
    await api.post('/requests', {
      ...form,
      startTime: form.startTime,
      endTime: form.endTime,
    });
    router.push('/my-requests');
  } catch (error) {
    console.error(error);
  }
};

const loadPets = async () => {
  try {
    const res = await api.get('/pets');
    pets.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const loadOwnerAddress = async () => {
  try {
    const res = await api.get('/users/me');
    form.address = res.data.address || '';
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);
const back = () => router.back();

onMounted(async () => {
  await loadPets();
  await loadOwnerAddress();
});
</script>
