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
            <el-cascader
              v-model="form.addressRegion"
              :options="addressOptions"
              placeholder="选择区域"
              style="width: 100%; margin-bottom: 8px;"
            />
            <el-input v-model="form.addressDetail" placeholder="详细地址（小区/楼栋/门牌号）" />
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
              <el-button type="warning" size="small" @click="applyCertification" :disabled="!certFile">提交认证申请</el-button>
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
      <el-card style="margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0 0 4px; color: #f56c6c;">注销账号</h3>
            <p style="margin: 0; color: #909399; font-size: 13px;">注销后账号及所有关联数据将被永久删除，此操作不可恢复</p>
          </div>
          <el-button type="danger" @click="handleDeleteAccount">注销账号</el-button>
        </div>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../utils/api';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { user, loadUser, logout } = useAuth();
const form = reactive({ nickname: '', addressRegion: [], addressDetail: '' });
const previewAvatar = ref('');
const avatarFile = ref(null);

const certData = ref(null);
const certFile = ref(null);

const addressOptions = [
  {
    value: '北京市',
    label: '北京市',
    children: [
      { value: '朝阳区', label: '朝阳区', children: [{ value: '望京街道', label: '望京街道' }, { value: '三里屯街道', label: '三里屯街道' }] },
      { value: '海淀区', label: '海淀区', children: [{ value: '中关村街道', label: '中关村街道' }, { value: '五道口街道', label: '五道口街道' }] },
    ],
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      { value: '浦东新区', label: '浦东新区', children: [{ value: '陆家嘴街道', label: '陆家嘴街道' }, { value: '张江镇', label: '张江镇' }] },
      { value: '徐汇区', label: '徐汇区', children: [{ value: '徐家汇街道', label: '徐家汇街道' }] },
    ],
  },
  {
    value: '广州市',
    label: '广州市',
    children: [
      { value: '天河区', label: '天河区', children: [{ value: '天河南街道', label: '天河南街道' }] },
      { value: '越秀区', label: '越秀区', children: [{ value: '北京街道', label: '北京街道' }] },
    ],
  },
  {
    value: '深圳市',
    label: '深圳市',
    children: [
      { value: '南山区', label: '南山区', children: [{ value: '粤海街道', label: '粤海街道' }, { value: '科技园街道', label: '科技园街道' }] },
      { value: '福田区', label: '福田区', children: [{ value: '华强北街道', label: '华强北街道' }] },
    ],
  },
];

const loadProfile = async () => {
  try {
    const res = await api.get('/users/me');
    form.nickname = res.data.nickname || '';
    previewAvatar.value = res.data.avatar || '';
    if (res.data.address) {
      const parts = res.data.address.split('|');
      if (parts.length >= 3) {
        form.addressRegion = [parts[0], parts[1], parts[2]];
        form.addressDetail = parts.slice(3).join('|') || '';
      } else {
        form.addressDetail = res.data.address;
      }
    }
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
    const addressParts = [...(form.addressRegion || []), form.addressDetail].filter(Boolean);
    formData.append('address', addressParts.join('|'));
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value);
    }
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };
    await api.put('/users/me', formData, config);
    await loadUser();
    ElMessage.success('保存成功');
    router.push('/');
  } catch (error) {
    ElMessage.error('保存失败');
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

const handleDeleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要注销账号吗？此操作将永久删除您的账号及所有关联数据，且不可恢复！',
      '注销账号',
      { confirmButtonText: '确认注销', cancelButtonText: '取消', type: 'warning' }
    );
    await ElMessageBox.confirm(
      '这是最后确认，注销后数据无法恢复，确定继续？',
      '二次确认',
      { confirmButtonText: '确认注销', cancelButtonText: '我再想想', type: 'error' }
    );
    await api.delete('/users/me');
    logout();
    ElMessage.success('账号已注销');
    router.push('/');
  } catch (error) {
    if (error !== 'cancel' && error?.toString() !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '注销失败');
    }
  }
};

onMounted(loadProfile);
</script>
