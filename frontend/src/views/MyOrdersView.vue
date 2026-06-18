<template>
  <el-container style="padding: 24px;">
    <el-header style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display:flex; align-items:center; gap: 12px;">
        <h2>我的订单</h2>
      </div>
      <div style="display:flex; align-items:center; gap: 12px;">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
          <el-button type="info" size="small" @click="go('/notifications')">通知</el-button>
        </el-badge>
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
            {{ row.request?.pet?.petName }} ({{ row.request?.pet?.breed || row.request?.pet?.petType }})
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
            {{ row.request?.serviceType === 'HOME_VISIT' ? '上门喂养' : '寄养' }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">
            ¥{{ row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.orderStatus)">{{ statusText(row.orderStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="结算" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.orderStatus === 'COMPLETED'" type="success" size="small">已结算</el-tag>
            <el-tag v-else-if="row.orderStatus === 'IN_PROGRESS'" type="warning" size="small">托管中</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="评价" width="180">
          <template #default="{ row }">
            <div v-if="row.review">
              <el-rate v-model="row.review.rating" disabled size="small" />
              <div style="font-size: 12px; color: #606266;">{{ row.review.comment }}</div>
            </div>
            <div v-else>未评价</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-space wrap>
              <el-button v-if="user?.role === 'OWNER' && row.orderStatus === 'IN_PROGRESS'" type="primary" size="small" @click="completeOrder(row.id)">确认完成</el-button>
              <el-button v-if="row.sitterId === user?.id && row.orderStatus === 'IN_PROGRESS'" type="success" size="small" @click="openUploadDialog(row.id)">上传记录</el-button>
              <el-button type="info" size="small" @click="viewRecords(row.id)">查看记录</el-button>
              <el-button v-if="user?.role === 'OWNER' && row.orderStatus === 'COMPLETED' && !row.review" type="warning" size="small" @click="openReviewDialog(row)">评价</el-button>
              <el-button v-if="row.review" type="info" size="small" @click="openReviewDialog(row, true)">查看评价</el-button>
              <el-button v-if="row.sitter?.id && user?.role === 'OWNER'" type="text" size="small" @click="viewSitterProfile(row.sitter.id)">查看宠托师</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="uploadDialogVisible" title="上传托管记录" width="520px">
        <el-form label-width="100px">
          <el-form-item label="记录内容">
            <el-input type="textarea" v-model="uploadContent" placeholder="请输入托管记录说明" :rows="3" />
          </el-form-item>
          <el-form-item label="图片（最多9张）">
            <input type="file" accept="image/*" multiple @change="handleOrderFilesChange" />
            <div style="font-size: 12px; color: #909399; margin-top: 4px;">已选择 {{ uploadFiles.length }} 张</div>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitServiceRecord">提交</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="recordDialogVisible" title="托管记录" width="720px">
        <el-timeline>
          <el-timeline-item v-for="record in serviceRecords" :key="record.id" :timestamp="new Date(record.created_at).toLocaleString()" placement="top">
            <el-card>
              <p>{{ record.content || '无文字描述' }}</p>
              <el-space v-if="parseImages(record.images).length" wrap style="margin-top: 8px;">
                <img v-for="img in parseImages(record.images)" :key="img" :src="img" style="height: 100px; border-radius: 6px; object-fit: cover;" />
              </el-space>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <div v-if="!serviceRecords.length" style="text-align: center; color: #909399; padding: 24px;">暂无托管记录</div>
        <template #footer>
          <el-button type="primary" @click="recordDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="reviewDialogVisible" :title="reviewModalTitle" width="520px">
        <el-form label-width="100px">
          <el-form-item label="评分" v-if="!reviewViewOnly">
            <el-rate v-model="reviewRating" />
          </el-form-item>
          <el-form-item v-else label="评分">
            <el-rate v-model="reviewRating" disabled />
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

      <el-dialog v-model="sitterDialogVisible" title="宠托师档案" width="600px">
        <div v-if="sitterProfile">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="昵称">{{ sitterProfile.nickname }}</el-descriptions-item>
            <el-descriptions-item label="认证状态">
              <el-tag v-if="sitterProfile.isCertified" type="success">已认证</el-tag>
              <el-tag v-else type="info">未认证</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="综合评分">{{ sitterProfile.avgRating }} / 5</el-descriptions-item>
            <el-descriptions-item label="评价数">{{ sitterProfile.reviewCount }}</el-descriptions-item>
            <el-descriptions-item label="完成订单">{{ sitterProfile.completedOrders }}</el-descriptions-item>
          </el-descriptions>
          <el-divider content-position="left">历史评价</el-divider>
          <div v-if="sitterProfile.reviews?.length">
            <div v-for="review in sitterProfile.reviews.slice(0, 5)" :key="review.id" style="margin-bottom: 12px; padding: 8px; background: #f5f7fa; border-radius: 6px;">
              <el-rate v-model="review.rating" disabled style="margin-bottom: 4px;" />
              <div style="font-size: 13px; color: #606266;">{{ review.comment || '无评论' }}</div>
            </div>
          </div>
          <div v-else style="color: #909399; text-align: center; padding: 16px;">暂无评价</div>
        </div>
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
const unreadCount = ref(0);
const reviewDialogVisible = ref(false);
const reviewComment = ref('');
const reviewRating = ref(5);
const reviewViewOnly = ref(false);
const selectedReviewOrder = ref(null);

const statusTagType = (status) => {
  const map = { CREATED: 'info', IN_PROGRESS: 'warning', COMPLETED: 'success', CANCELLED: 'danger' };
  return map[status] || 'info';
};

const statusText = (status) => {
  const map = { CREATED: '已创建', IN_PROGRESS: '进行中', COMPLETED: '已完成', CANCELLED: '已取消' };
  return map[status] || status;
};

const loadOrders = async () => {
  try {
    const res = await api.get('/orders/my');
    orders.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const loadUnreadCount = async () => {
  try {
    const res = await api.get('/notifications/unread-count');
    unreadCount.value = res.data.count;
  } catch (error) {
    console.error(error);
  }
};

const completeOrder = async (orderId) => {
  try {
    await api.post(`/orders/${orderId}/complete`);
    ElMessage.success('已确认完成');
    await loadOrders();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败');
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
    if (uploadFiles.value.length > 9) {
      ElMessage.warning('最多上传9张图片');
      return;
    }
    const formData = new FormData();
    formData.append('content', uploadContent.value);
    uploadFiles.value.forEach((file) => formData.append('images', file));
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };
    await api.post(`/service-records/${selectedOrderId.value}/records`, formData, config);
    uploadDialogVisible.value = false;
    ElMessage.success('托管记录已上传');
    await loadOrders();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '上传记录失败');
  }
};

const handleOrderFilesChange = (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 9) {
    ElMessage.warning('最多上传9张图片');
    uploadFiles.value = files.slice(0, 9);
  } else {
    uploadFiles.value = files;
  }
};

const recordDialogVisible = ref(false);
const serviceRecords = ref([]);

const reviewModalTitle = computed(() => {
  return reviewViewOnly.value ? '查看评价' : '提交评价';
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
    ElMessage.error('获取记录失败');
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
    ElMessage.success('评价已提交');
    await loadOrders();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '提交评价失败');
  }
};

const sitterDialogVisible = ref(false);
const sitterProfile = ref(null);

const viewSitterProfile = async (sitterId) => {
  try {
    const res = await api.get(`/users/sitter/${sitterId}`);
    sitterProfile.value = res.data;
    sitterDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取宠托师信息失败');
  }
};

const go = (path) => router.push(path);

onMounted(async () => {
  await loadUser();
  await loadOrders();
  await loadUnreadCount();
});
</script>
