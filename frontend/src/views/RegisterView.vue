<template>
  <el-card class="register-card">
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px;">
      <el-button type="text" @click="back">返回</el-button>
      <h2>注册 PetRelay</h2>
    </div>
    <el-form :model="form" @submit.prevent="handleSubmit">
      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input type="password" v-model="form.password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="form.role" placeholder="选择角色">
          <el-option label="宠物主人" value="OWNER" />
          <el-option label="宠托师" value="SITTER" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">注册</el-button>
        <el-button type="text" @click="go('/login')">已有账号</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../utils/api';

const router = useRouter();
const form = reactive({ phone: '', password: '', role: 'OWNER' });
const back = () => router.back();

const handleSubmit = async () => {
  try {
    const res = await axios.post('/auth/register', form);
    localStorage.setItem('petrelay_token', res.data.token);
    router.push('/');
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);
</script>

<style scoped>
.register-card {
  width: 420px;
  margin: 80px auto;
  padding: 24px;
}
</style>
