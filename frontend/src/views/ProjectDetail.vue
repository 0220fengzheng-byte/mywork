<template>
  <div class="project-detail">
    <div class="header">
      <el-page-header @back="goBack" :title="project.name" />
    </div>
    
    <!-- 项目基本信息 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>项目信息</span>
          <el-tag :type="getStatusType(project.status)">{{ project.status }}</el-tag>
        </div>
      </template>
      <div class="info-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <p><strong>提需人:</strong> {{ project.requesterName || '未指定' }}</p>
            <p><strong>负责人:</strong> {{ project.assigneeName || '未指定' }}</p>
          </el-col>
          <el-col :span="8">
            <p><strong>优先级:</strong> 
              <el-tag :type="getPriorityType(project.priority)" size="small">
                {{ project.priority || '中' }}
              </el-tag>
            </p>
            <p><strong>截止日期:</strong> {{ project.deadline || '未设置' }}</p>
          </el-col>
          <el-col :span="8">
            <p><strong>创建时间:</strong> {{ formatDate(project.createdAt) }}</p>
            <p><strong>状态:</strong> {{ project.status }}</p>
          </el-col>
        </el-row>
        <div class="description-section">
          <p><strong>项目描述:</strong></p>
          <div class="description-content">
            {{ project.description || '暂无描述' }}
          </div>
        </div>
      </div>
    </el-card>

    <!-- 需求文档区域 -->
    <el-card class="document-card" v-if="project.documentUrl">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><Document /></el-icon>
            需求文档
          </span>
        </div>
      </template>
      <div class="document-content">
        <div class="document-info">
          <h3 class="document-title">{{ project.documentTitle || '项目需求文档' }}</h3>
          <p class="document-meta">
            <el-icon><Link /></el-icon>
            文档链接: 
            <el-link :href="project.documentUrl" target="_blank" type="primary">
              {{ project.documentUrl }}
            </el-link>
          </p>
        </div>
        <div class="document-actions">
          <el-button type="primary" @click="openDocument" size="large">
            <el-icon><View /></el-icon>
            在新窗口中打开文档
          </el-button>
          <el-button @click="copyDocumentLink" size="large">
            <el-icon><CopyDocument /></el-icon>
            复制链接
          </el-button>
        </div>
        
        <!-- 文档预览区域 (如果是支持的类型) -->
        <div class="document-preview" v-if="isPreviewableDocument">
          <div class="preview-header">
            <span>文档预览</span>
            <el-button size="small" @click="refreshPreview">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="preview-container">
            <iframe 
              :src="getPreviewUrl(project.documentUrl)" 
              frameborder="0"
              class="document-iframe"
              @load="onPreviewLoad"
              @error="onPreviewError"
            ></iframe>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 无文档提示 -->
    <el-card class="document-card" v-else>
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><Document /></el-icon>
            需求文档
          </span>
        </div>
      </template>
      <el-empty description="暂无需求文档" />
    </el-card>

    <!-- 项目图片区域 -->
    <el-card class="image-card">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><Picture /></el-icon>
            项目图片
          </span>
          <span class="image-count">{{ imageFiles.length }} 张图片</span>
        </div>
      </template>
      <div class="image-content">
        <div v-if="imageFiles.length > 0" class="image-gallery">
          <div class="image-grid">
            <div 
              v-for="(image, index) in imageFiles" 
              :key="index" 
              class="image-item"
              @click="previewImage(image, index)"
            >
              <div class="image-preview">
                <img :src="image.url" :alt="image.name" />
                <div class="image-overlay">
                  <el-icon><ZoomIn /></el-icon>
                  <span>点击查看</span>
                </div>
              </div>
              <div class="image-info">
                <h4 class="image-name">{{ image.name }}</h4>
                <p class="image-meta">
                  大小: {{ formatFileSize(image.size) }} | 
                  类型: {{ image.type }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无项目图片" />
      </div>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog 
      v-model="imagePreviewVisible" 
      title="图片预览" 
      width="90%"
      class="image-preview-dialog"
    >
      <div class="image-preview-container">
        <div class="preview-header">
          <div class="image-nav">
            <el-button 
              @click="prevImage" 
              :disabled="currentImageIndex === 0"
              circle
            >
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <span class="image-counter">
              {{ currentImageIndex + 1 }} / {{ imageFiles.length }}
            </span>
            <el-button 
              @click="nextImage" 
              :disabled="currentImageIndex === imageFiles.length - 1"
              circle
            >
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="preview-actions">
            <el-button @click="downloadImage" size="small">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
          </div>
        </div>
        <div class="preview-image-container">
          <img 
            :src="currentPreviewImage?.url" 
            :alt="currentPreviewImage?.name"
            class="preview-image"
          />
        </div>
        <div class="preview-info">
          <h3>{{ currentPreviewImage?.name }}</h3>
          <p>
            大小: {{ formatFileSize(currentPreviewImage?.size) }} | 
            类型: {{ currentPreviewImage?.type }}
          </p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectsStore } from '../stores/projects'
import { ElMessage } from 'element-plus'
import { 
  Document, 
  Link, 
  View, 
  Picture, 
  ZoomIn, 
  ArrowLeft, 
  ArrowRight, 
  Download,
  CopyDocument,
  Refresh
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const store = useProjectsStore()
const projectId = parseInt(route.params.id)

// 项目数据
const project = ref(store.getProjectById(projectId) || {
  id: projectId,
  name: '未知项目',
  status: '未开始',
  deadline: '',
  description: '',
  requesterName: '',
  assigneeName: '',
  priority: '中',
  documentUrl: '',
  documentTitle: '',
  imageFiles: []
})

// 图片相关状态
const imageFiles = computed(() => project.value.imageFiles || [])
const imagePreviewVisible = ref(false)
const currentImageIndex = ref(0)
const currentPreviewImage = computed(() => imageFiles.value[currentImageIndex.value])

// 文档预览相关
const isPreviewableDocument = computed(() => {
  if (!project.value.documentUrl) return false
  const url = project.value.documentUrl.toLowerCase()
  return url.includes('docs.google.com') || 
         url.includes('feishu.cn') || 
         url.includes('figma.com')
})

// 方法
const goBack = () => {
  router.push('/projects')
}

const getStatusType = (status) => {
  const map = {
    '未开始': 'info',
    '进行中': 'warning', 
    '已完成': 'success',
    '暂停': 'danger',
    '取消': 'danger'
  }
  return map[status] || 'info'
}

const getPriorityType = (priority) => {
  const map = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return map[priority] || 'warning'
}

const formatDate = (dateString) => {
  if (!dateString) return '未设置'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatFileSize = (bytes) => {
  if (!bytes) return '未知'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 文档相关方法
const openDocument = () => {
  if (project.value.documentUrl) {
    window.open(project.value.documentUrl, '_blank')
  }
}

const copyDocumentLink = async () => {
  try {
    await navigator.clipboard.writeText(project.value.documentUrl)
    ElMessage.success('链接已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const getPreviewUrl = (url) => {
  // 根据不同的文档类型返回预览URL
  if (url.includes('docs.google.com')) {
    return url.replace('/edit', '/preview')
  }
  if (url.includes('feishu.cn')) {
    return url
  }
  if (url.includes('figma.com')) {
    return url.replace('/file/', '/embed?embed_host=share&url=')
  }
  return url
}

const refreshPreview = () => {
  // 刷新预览iframe
  const iframe = document.querySelector('.document-iframe')
  if (iframe) {
    iframe.src = iframe.src
  }
}

const onPreviewLoad = () => {
  console.log('文档预览加载完成')
}

const onPreviewError = () => {
  ElMessage.warning('文档预览加载失败，请点击"在新窗口中打开文档"查看')
}

// 图片相关方法
const previewImage = (image, index) => {
  currentImageIndex.value = index
  imagePreviewVisible.value = true
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const nextImage = () => {
  if (currentImageIndex.value < imageFiles.value.length - 1) {
    currentImageIndex.value++
  }
}

const downloadImage = () => {
  const image = currentPreviewImage.value
  if (image) {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.name
    link.click()
  }
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (imagePreviewVisible.value) {
    if (event.key === 'ArrowLeft') {
      prevImage()
    } else if (event.key === 'ArrowRight') {
      nextImage()
    } else if (event.key === 'Escape') {
      imagePreviewVisible.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.project-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 20px;
}

.info-card, .document-card, .image-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.card-header .el-icon {
  margin-right: 8px;
}

.image-count {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

/* 项目信息样式 */
.info-content {
  line-height: 1.8;
}

.info-content p {
  margin: 10px 0;
  color: #606266;
}

.info-content strong {
  color: #303133;
}

.description-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.description-content {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-top: 8px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
}

/* 文档区域样式 */
.document-content {
  padding: 20px 0;
}

.document-info {
  margin-bottom: 20px;
}

.document-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.document-meta {
  margin: 0;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}

.document-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.document-preview {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  background: #f5f7fa;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.preview-container {
  height: 600px;
  position: relative;
}

.document-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 图片区域样式 */
.image-content {
  padding: 20px 0;
}

.image-gallery {
  min-height: 200px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.image-item {
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: all 0.3s ease;
  cursor: pointer;
}

.image-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-item:hover .image-preview img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 16px;
  gap: 8px;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-overlay .el-icon {
  font-size: 32px;
}

.image-info {
  padding: 16px;
}

.image-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-meta {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

/* 图片预览对话框样式 */
.image-preview-dialog :deep(.el-dialog) {
  border-radius: 12px;
}

.image-preview-container {
  text-align: center;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.image-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.image-counter {
  font-weight: 600;
  color: #303133;
  min-width: 80px;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-image-container {
  margin: 20px 0;
  max-height: 70vh;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.preview-info {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.preview-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.preview-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-detail {
    padding: 10px;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .document-actions {
    flex-direction: column;
  }
  
  .preview-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .image-nav {
    order: 2;
  }
  
  .preview-actions {
    order: 1;
  }
}

/* 优化样式 */
:deep(.el-card) {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-link) {
  font-weight: 500;
}
</style>