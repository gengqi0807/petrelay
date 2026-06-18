<template>
  <el-container style="padding: 24px;">
    <el-header style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display:flex; align-items:center; gap: 12px;">
        <h2>我的订单</h2>
      </div>
      <div style="display:flex; align-items:center; gap: 12px;">
        <el-avatar v-if="user?.avatar" :src="user.avatar" />
        <router-link to="/">
          <el-button type="primary">首页</el-button>
        </router-link>
      </div>
    </el-header>
    <el-main>
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="id" label="订单ID" width="100" />
        <el-table-column label="宠物" width="150">
          <template #default="{ row }">
            {{ row.request?.pet?.petName }} ({{ row.request?.pet?.petType }})
          </template>
        </el-table-column>
        <el-table-column label="对方" width="140">
          <template #default="{ row }">
            <el-avatar v-if="row.sitter?.avatar && user?.role === 'OWNER'" :src="row.sitter.avatar" size="small" />
            <el-avatar v-if="row.request?.owner?.avatar && user?.role === 'SITTER'" :src="row.request.owner.avatar" size="small" />
            <span style="margin-left: 8px;">
              {{ user?.role === 'OWNER' ? row.sitter?.nickname : row.request?.owner?.nickname }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="服务类型" width="120">
          <template #default="{ row }">
            {{ row.request?.serviceType }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">
            ¥{{ row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="状态" width="120" />
        <el-table-column label="评价" width="220">
        <template #default="{ row }">
          <div v-if="row.review">
            <span>⭐{{ row.review.rating }}</span>
            <div style="font-size: 12px; color: #606266;">{{ row.review.comment }}</div>
          </div>
          <div v-else>未评价</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-space>
              <el-button v-if="row.orderStatus === 'IN_PROGRESS'" type="primary" size="small" @click="completeOrder(row.id)">完成</el-button>
              <el-button type="success" size="small" @click="openUploadDialog(row.id)">上传记录</el-button>
              <el-button type="info" size="small" @click="viewRecords(row.id)">查看记录</el-button>
              <el-button v-if="user?.role === 'OWNER' && row.orderStatus === 'COMPLETED' && !row.review" type="warning" size="small" @click="openReviewDialog(row)">评价</el-button>
              <el-button v-if="row.review" type="info" size="small" @click="openReviewDialog(row, true)">查看评价</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog title="上传托管记录" :visible.sync="uploadDialogVisible" width="520px">
        <el-form label-width="100px">
          <el-form-item label="记录内容">
            <el-input type="textarea" v-model="uploadContent" placeholder="请输入托管记录说明" />
          </el-form-item>
          <el-form-item label="图片">
            <input type="file" accept="image/*" multiple @change="handleOrderFilesChange" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitServiceRecord">提交</el-button>
        </template>
      </el-dialog>
      <el-dialog title="托管记录列表" :visible.sync="recordDialogVisible" width="720px">
        <el-table :data="serviceRecords" style="width: 100%">
          <el-table-column prop="createdAt" label="时间" width="180">
            <template #default="{ row }">
              {{ row.createdAt ? new Date(row.createdAt).toLocaleString() : '' }}
            </template>
          </el-table-column>
          <el-table-column prop="content" label="内容" />
          <el-table-column label="图片" width="240">
            <template #default="{ row }">
              <el-space>
                <img v-for="img in parseImages(row.images)" :key="img" :src="img" style="height: 80px; border-radius: 6px;" />
              </el-space>
            </template>
          </el-table-column>
        </el-table>
        <template #footer>
          <el-button type="primary" @click="recordDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>
      <el-dialog :title="reviewModalTitle" :visible.sync="reviewDialogVisible" width="520px">
        <el-form label-width="100px">
          <el-form-item label="评分" v-if="!reviewViewOnly">
            <el-rate v-model="reviewRating" />
          </el-form-item>
          <el-form-item label="评论">
            <el-input
              type="textarea"
              v-model="reviewComment"
              placeholder="填写评价内容"
              :disabled="reviewViewOnly"
              rows="4"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button v-if="!reviewViewOnly" type="primary" @click="submitReview">提交评价</el-button>
          <el-button v-else type="primary" @click="reviewDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuth } from '../composables/useAuth';
import api from '../utils/api';

const router = useRouter();
const { user, loadUser } = useAuth();
const orders = ref([]);
const reviewDialogVisible = ref(false);
const reviewComment = ref('');
const reviewRating = ref(5);
const reviewViewOnly = ref(false);
const selectedReviewOrder = ref(null);

const loadOrders = async () => {
  try {
    const res = await api.get('/orders/my');
    orders.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const completeOrder = async (orderId) => {
  try {
    await api.post(`/orders/${orderId}/complete`);
    await loadOrders();
  } catch (error) {
    console.error(error);
  }
};

const uploadDialogVisible = ref(false);
const uploadContent = ref('');
const uploadFiles = ref([]);
const selectedOrderId = ref(null);

const openUploadDialog = (orderId) => {
  selectedOrderId.value = orderId;
  uploadContent.value = '';
  uploadFiles.value = [];
  uploadDialogVisible.value = true;
};

const submitServiceRecord = async () => {
  try {
    if (!selectedOrderId.value) return;
    const formData = new FormData();
    formData.append('content', uploadContent.value);
    uploadFiles.value.forEach((file) => formData.append('images', file));
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };
    await api.post(`/service-records/${selectedOrderId.value}/records`, formData, config);
    uploadDialogVisible.value = false;
    await loadOrders();
    ElMessage.success('托管记录已上传');
  } catch (error) {
    console.error(error);
    ElMessage.error('上传记录失败');
  }
};

const handleOrderFilesChange = (event) => {
  uploadFiles.value = Array.from(event.target.files);
};

const recordDialogVisible = ref(false);
const serviceRecords = ref([]);

const reviewModalTitle = computed(() => {
  if (reviewViewOnly.value) {
    return '查看评价';
  }
  return '提交评价';
});

const parseImages = (images) => {
  if (!images) return [];
  try {
    return JSON.parse(images);
  } catch (error) {
    return [];
  }
};

const viewRecords = async (orderId) => {
  try {
    const res = await api.get(`/service-records/${orderId}`);
    serviceRecords.value = res.data;
    recordDialogVisible.value = true;
  } catch (error) {
    console.error(error);
  }
};

const openReviewDialog = (order, viewOnly = false) => {
  selectedReviewOrder.value = order;
  reviewComment.value = order.review?.comment || '';
  reviewRating.value = order.review?.rating || 5;
  reviewViewOnly.value = viewOnly;
  reviewDialogVisible.value = true;
};

const submitReview = async () => {
  if (!selectedReviewOrder.value) return;
  try {
    await api.post('/reviews', {
      orderId: selectedReviewOrder.value.id,
      rating: reviewRating.value,
      comment: reviewComment.value,
    });
    reviewDialogVisible.value = false;
    await loadOrders();
  } catch (error) {
    console.error(error);
  }
};

const go = (path) => router.push(path);
const goHome = () => router.push('/');

onMounted(async () => {
  await loadUser();
  await loadOrders();
});

</script>
