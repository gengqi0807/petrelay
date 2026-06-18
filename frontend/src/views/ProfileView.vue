<template>
  <el-container style="padding: 24px; max-width: 720px; margin: 0 auto;">
    <el-header style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
      <div>
        <h2>个人资料</h2>
      </div>
      <div>
        <router-link to="/">
          <el-button type="primary">首页</el-button>
        </router-link>
      </div>
    </el-header>
    <el-main>
      <el-card>
        <el-form :model="form" label-width="100px">
          <el-form-item label="昵称">
            <el-input v-model="form.nickname" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="头像">
            <input type="file" accept="image/*" @change="handleAvatarFileChange" style="width: 100%;" />
            <el-avatar v-if="previewAvatar" :src="previewAvatar" size="large" style="margin-top: 12px;" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="form.address" placeholder="请输入地址" />
          </el-form-item>
          <el-form-item v-if="user?.role === 'SITTER'" label="身份认证">
            <div style="margin-bottom: 8px;">当前认证状态：<strong>{{ certStatusText }}</strong></div>
            <div v-if="certData?.status" style="margin-bottom: 8px; color: #909399; font-size: 12px;">最新申请时间：{{ certData.createdAt ? new Date(certData.createdAt).toLocaleString() : '暂无' }}</div>
            <div v-if="certData?.remark" style="margin-bottom: 8px; color: #f56c6c; font-size: 12px;">审核说明：{{ certData.remark }}</div>
            <template v-if="certData?.documentUrl">
              <div style="margin-bottom: 8px;">
                认证材料：
                <a :href="certData.documentUrl" target="_blank">查看</a>
              </div>
            </template>
            <template v-if="!certData?.status || certData.status === 'REJECTED'">
              <input type="file" accept="image/*,.pdf" @change="handleCertFileChange" style="width: 100%; margin-bottom: 8px;" />
              <el-button type="warning" size="mini" @click="applyCertification" :disabled="!certFile">提交认证申请</el-button>
            </template>
            <div style="margin-top: 8px; color: #909399; font-size: 12px;">
              认证后可提升接单信任度，系统将记录认证状态。
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveProfile">保存</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from '../utils/api';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { user, loadUser } = useAuth();
const form = reactive({ nickname: '', address: '' });
const previewAvatar = ref('');
const avatarFile = ref(null);

const certData = ref(null);
const certFile = ref(null);

const loadProfile = async () => {
  try {
    const res = await api.get('/users/me');
    form.nickname = res.data.nickname || '';
    form.address = res.data.address || '';
    previewAvatar.value = res.data.avatar || '';
    await loadCertificationStatus();
  } catch (error) {
    console.error(error);
  }
};

const loadCertificationStatus = async () => {
  try {
    const res = await api.get('/certification-applications/me');
    certData.value = res.data || {};
  } catch (error) {
    console.error(error);
  }
};

const saveProfile = async () => {
  try {
    const formData = new FormData();
    formData.append('nickname', form.nickname);
    formData.append('address', form.address);
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value);
    }
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };
    await api.put('/users/me', formData, config);
    await loadUser();
    router.push('/');
  } catch (error) {
    console.error(error);
  }
};

const handleAvatarFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  avatarFile.value = file;
  const reader = new FileReader();
  reader.onload = () => {
    previewAvatar.value = reader.result;
  };
  reader.readAsDataURL(file);
};

const handleCertFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  certFile.value = file;
};

const applyCertification = async () => {
  if (!certFile.value) {
    ElMessage.warning('请先选择认证材料');
    return;
  }
  try {
    const formData = new FormData();
    formData.append('document', certFile.value);
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };
    await api.post('/certification-applications', formData, config);
    ElMessage.success('认证申请已提交，请等待审核');
    certFile.value = null;
    await loadCertificationStatus();
  } catch (error) {
    console.error(error);
    ElMessage.error('认证申请提交失败');
  }
};

const certStatusText = computed(() => {
  if (user.value?.isCertified) return '已认证';
  if (certData.value?.status === 'PENDING') return '认证审核中';
  if (certData.value?.status === 'APPROVED') return '已认证';
  if (certData.value?.status === 'REJECTED') return '认证被拒绝';
  return '未认证';
});

const go = (path) => router.push(path);
const goHome = () => router.push('/');

onMounted(loadProfile);
</script>
