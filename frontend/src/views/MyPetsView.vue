<template>
  <el-container style="padding: 24px; max-width: 900px; margin: 0 auto;">
    <el-header>
      <h2>我的宠物</h2>
      <el-button type="primary" @click="go('/')">返回首页</el-button>
    </el-header>
    <el-main>
      <el-card style="margin-bottom: 24px;">
        <el-form :model="petForm" label-width="100px">
          <el-form-item label="宠物名称">
            <el-input v-model="petForm.petName" placeholder="请输入宠物名称" />
          </el-form-item>
          <el-form-item label="宠物类型">
            <el-select v-model="petForm.petType" placeholder="请选择宠物类型">
              <el-option label="犬" value="DOG" />
              <el-option label="猫" value="CAT" />
              <el-option label="其他" value="OTHER" />
            </el-select>
          </el-form-item>
          <el-form-item label="年龄">
            <el-input-number v-model="petForm.petAge" :min="0" />
          </el-form-item>
          <el-form-item label="健康信息">
            <el-input type="textarea" v-model="petForm.healthInfo" placeholder="例如：疫苗已打，全家绝育" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="createPet">添加宠物</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card>
        <el-table :data="pets" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="petName" label="宠物名称" />
          <el-table-column prop="petType" label="类型" />
          <el-table-column prop="petAge" label="年龄" width="100" />
          <el-table-column prop="healthInfo" label="健康信息" />
        </el-table>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();
const pets = ref([]);
const petForm = reactive({ petName: '', petType: 'DOG', petAge: 0, healthInfo: '' });

const loadPets = async () => {
  try {
    const res = await api.get('/pets');
    pets.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const createPet = async () => {
  try {
    await api.post('/pets', petForm);
    petForm.petName = '';
    petForm.petType = 'DOG';
    petForm.petAge = 0;
    petForm.healthInfo = '';
    await loadPets();
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);

onMounted(loadPets);
</script>
