<template>
  <el-card class="login-card">
    <h2>登录 PetRelay</h2>
    <el-form :model="form" @submit.prevent="handleSubmit">
      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input type="password" v-model="form.password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">登录</el-button>
        <el-button type="text" @click="go('/register')">注册账号</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../utils/api';

const router = useRouter();
const form = reactive({ phone: '', password: '' });

const handleSubmit = async () => {
  try {
    const res = await axios.post('/auth/login', form);
    localStorage.setItem('petrelay_token', res.data.token);
    router.push('/requests');
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);
</script>

<style scoped>
.login-card {
  width: 420px;
  margin: 80px auto;
  padding: 24px;
}
</style>
