<template>
  <el-container style="padding: 24px; max-width: 900px; margin: 0 auto;">
    <el-header style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
      <div>
        <h2>我的宠物</h2>
      </div>
      <div>
        <router-link to="/">
          <el-button type="primary">首页</el-button>
        </router-link>
      </div>
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
          <el-form-item label="品种">
            <el-input v-model="petForm.breed" placeholder="请输入品种，如金毛、英短等" />
          </el-form-item>
          <el-form-item label="年龄">
            <el-row :gutter="12">
              <el-col :span="12">
                <el-input-number v-model="petForm.ageYears" :min="0" placeholder="年" style="width: 100%;" />
              </el-col>
              <el-col :span="12">
                <el-input-number v-model="petForm.ageMonths" :min="0" :max="11" placeholder="月" style="width: 100%;" />
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="健康信息">
            <el-input type="textarea" v-model="petForm.healthInfo" placeholder="例如：疫苗已打，全家绝育" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="isEditing ? updatePet() : createPet()">
              {{ isEditing ? '保存修改' : '添加宠物' }}
            </el-button>
            <el-button v-if="isEditing" type="warning" @click="cancelEdit">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card>
        <el-table :data="pets" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="petName" label="宠物名称" />
          <el-table-column prop="petType" label="类型" />
          <el-table-column prop="breed" label="品种" />
          <el-table-column label="年龄" width="140">
            <template #default="{ row }">
              {{ displayAge(row.petAge) }}
            </template>
          </el-table-column>
          <el-table-column prop="healthInfo" label="健康信息" />
          <el-table-column label="操作" width="220">
            <template #default="{ row }">
              <el-button type="text" @click="editPet(row)">编辑</el-button>
              <el-button type="text" @click="viewDetail(row)">详情</el-button>
              <el-button type="danger" @click="deletePet(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <el-dialog v-model="detailVisible" title="宠物详情" width="520px">
        <div v-if="detailPet">
          <p><strong>宠物名称：</strong>{{ detailPet.petName }}</p>
          <p><strong>宠物类型：</strong>{{ detailPet.petType }}</p>
          <p><strong>品种：</strong>{{ detailPet.breed || '未填写' }}</p>
          <p><strong>年龄：</strong>{{ displayAge(detailPet.petAge) }}</p>
          <p><strong>健康信息：</strong>{{ detailPet.healthInfo || '暂无' }}</p>
          <p><strong>更新时间：</strong>{{ detailPet.updatedAt ? new Date(detailPet.updatedAt).toLocaleString() : '未知' }}</p>
        </div>
        <template #footer>
          <el-button @click="detailVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from '../utils/api';

const router = useRouter();
const pets = ref([]);
const isEditing = ref(false);
const petForm = reactive({ id: null, petName: '', petType: 'DOG', breed: '', ageYears: 0, ageMonths: 0, healthInfo: '' });

const loadPets = async () => {
  try {
    const res = await api.get('/pets');
    pets.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const createPet = async () => {
  if (!petForm.petName) {
    ElMessage.warning('请输入宠物名称');
    return;
  }
  try {
    await api.post('/pets', {
      petName: petForm.petName,
      petType: petForm.petType,
      breed: petForm.breed,
      petAge: petForm.ageYears * 12 + petForm.ageMonths,
      healthInfo: petForm.healthInfo,
    });
    ElMessage.success('添加成功');
    resetForm();
    await loadPets();
  } catch (error) {
    ElMessage.error('添加失败');
  }
};

const updatePet = async () => {
  try {
    await api.put(`/pets/${petForm.id}`, {
      petName: petForm.petName,
      petType: petForm.petType,
      breed: petForm.breed,
      petAge: petForm.ageYears * 12 + petForm.ageMonths,
      healthInfo: petForm.healthInfo,
    });
    ElMessage.success('修改成功');
    resetForm();
    await loadPets();
  } catch (error) {
    ElMessage.error('修改失败');
  }
};

const deletePet = async (pet) => {
  try {
    await api.delete(`/pets/${pet.id}`);
    if (detailVisible.value && detailPet.value?.id === pet.id) {
      detailVisible.value = false;
      detailPet.value = null;
    }
    if (isEditing.value && petForm.id === pet.id) {
      resetForm();
    }
    ElMessage.success('已删除');
    await loadPets();
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const viewDetail = (pet) => {
  detailPet.value = pet;
  detailVisible.value = true;
};

const editPet = (pet) => {
  petForm.id = pet.id;
  petForm.petName = pet.petName;
  petForm.petType = pet.petType;
  petForm.breed = pet.breed || '';
  petForm.ageYears = Math.floor((pet.petAge || 0) / 12);
  petForm.ageMonths = (pet.petAge || 0) % 12;
  petForm.healthInfo = pet.healthInfo || '';
  isEditing.value = true;
};

const cancelEdit = () => {
  resetForm();
};

const resetForm = () => {
  petForm.id = null;
  petForm.petName = '';
  petForm.petType = 'DOG';
  petForm.breed = '';
  petForm.ageYears = 0;
  petForm.ageMonths = 0;
  petForm.healthInfo = '';
  isEditing.value = false;
};

const displayAge = (age) => {
  const totalMonths = age || 0;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${years}年${months}月`;
};

const detailPet = ref(null);
const detailVisible = ref(false);

onMounted(loadPets);
</script>
