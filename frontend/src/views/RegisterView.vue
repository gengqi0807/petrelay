<template>
  <el-card class="register-card">
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px;">
      <el-button type="text" @click="back">返回</el-button>
      <h2>注册 PetRelay</h2>
    </div>
    <el-steps :active="step" finish-status="success" simple style="margin-bottom: 24px;">
      <el-step title="填写信息" />
      <el-step title="选择角色" />
    </el-steps>
    <div v-if="step === 0">
      <el-form :model="form" @submit.prevent="sendCode">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="form.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="sendCode" :disabled="codeCooldown > 0">
            {{ codeCooldown > 0 ? `${codeCooldown}s后重发` : '获取验证码' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-else-if="step === 1">
      <el-form :model="form" @submit.prevent="handleSubmit">
        <el-form-item label="验证码">
          <el-input v-model="form.verificationCode" placeholder="请输入验证码" />
        </el-form-item>
        <el-form-item label="选择角色">
          <el-radio-group v-model="form.role">
            <el-radio value="OWNER">宠物主人</el-radio>
            <el-radio value="SITTER">宠托师</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">注册</el-button>
          <el-button type="text" @click="step = 0">上一步</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div style="margin-top: 12px; text-align: center;">
      <el-button type="text" @click="go('/login')">已有账号？去登录</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '../utils/api';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { setToken, loadUser } = useAuth();
const step = ref(0);
const codeCooldown = ref(0);
const form = reactive({ phone: '', password: '', verificationCode: '', role: 'OWNER' });
const back = () => router.back();

const sendCode = async () => {
  if (!form.phone || !form.password) {
    ElMessage.warning('请先填写手机号和密码');
    return;
  }
  try {
    await axios.post('/auth/send-code', { phone: form.phone });
    ElMessage.success('验证码已发送（查看后端控制台）');
    step.value = 1;
    codeCooldown.value = 60;
    const timer = setInterval(() => {
      codeCooldown.value--;
      if (codeCooldown.value <= 0) clearInterval(timer);
    }, 1000);
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '发送验证码失败');
  }
};

const handleSubmit = async () => {
  if (!form.verificationCode) {
    ElMessage.warning('请输入验证码');
    return;
  }
  try {
    const res = await axios.post('/auth/register', form);
    setToken(res.data.token);
    await loadUser();
    ElMessage.success('注册成功');
    router.push('/');
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '注册失败');
  }
};

const go = (path) => router.push(path);
</script>

<style scoped>
.register-card {
  width: 480px;
  margin: 60px auto;
  padding: 24px;
}
</style>
