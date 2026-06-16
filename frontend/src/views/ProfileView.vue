<template>
  <el-container style="padding: 24px; max-width: 720px; margin: 0 auto;">
    <el-header>
      <h2>个人资料</h2>
      <el-button type="primary" @click="go('/')">返回首页</el-button>
    </el-header>
    <el-main>
      <el-card>
        <el-form :model="form" label-width="100px">
          <el-form-item label="昵称">
            <el-input v-model="form.nickname" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="头像">
            <el-input v-model="form.avatar" placeholder="请输入头像 URL" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="form.address" placeholder="请输入地址" />
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
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();
const form = reactive({ nickname: '', avatar: '', address: '' });

const loadProfile = async () => {
  try {
    const res = await api.get('/users/me');
    form.nickname = res.data.nickname || '';
    form.avatar = res.data.avatar || '';
    form.address = res.data.address || '';
  } catch (error) {
    console.error(error);
  }
};

const saveProfile = async () => {
  try {
    await api.put('/users/me', form);
    router.push('/');
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);

onMounted(loadProfile);
</script>
