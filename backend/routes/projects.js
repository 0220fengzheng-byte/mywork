const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const SupabaseProjectService = require('../services/supabaseProjectService');
const SupabaseUserService = require('../services/supabaseUserService');
const SupabaseNotificationService = require('../services/supabaseNotificationService');

const supabaseProjectService = new SupabaseProjectService();
const supabaseUserService = new SupabaseUserService();
const supabaseNotificationService = new SupabaseNotificationService();
const { auth } = require('../middleware/auth');

const router = express.Router();

// 配置图片上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/projects';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// 获取项目列表
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['未开始', '进行中', '已完成', '暂停', '取消']),
  query('priority').optional().isIn(['高', '中', '低']),
  query('view').optional().isIn(['new', 'thisweek', 'history'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assigneeId,
      requesterId,
      search,
      view,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // 构建查询选项
    const queryOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      priority,
      assigneeId,
      requesterId,
      search,
      view,
      sortBy,
      sortOrder
    };

    const result = await supabaseProjectService.getProjects(queryOptions);
    const { projects, total } = result;

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取项目详情
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await supabaseProjectService.getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建项目
router.post('/', auth, [
  body('name').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('assigneeId').optional().isMongoId(),
  body('status').optional().isIn(['未开始', '进行中', '已完成', '暂停', '取消']),
  body('priority').optional().isIn(['高', '中', '低']),
  body('deadline').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const projectData = {
      ...req.body,
      requester_id: req.user._id,
      created_by: req.user._id
    };

    if (req.body.deadline) {
      projectData.deadline = new Date(req.body.deadline);
    }

    const project = await supabaseProjectService.createProject(projectData);

    // 发送通知
    if (project.assignee_id && project.assignee_id !== req.user._id) {
      await supabaseNotificationService.sendProjectAssignmentNotification(
        project.assignee_id,
        req.user._id,
        project.id,
        project.name
      );
    }

    res.status(201).json({
      message: '项目创建成功',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新项目
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('assigneeId').optional().isMongoId(),
  body('status').optional().isIn(['未开始', '进行中', '已完成', '暂停', '取消']),
  body('priority').optional().isIn(['高', '中', '低']),
  body('deadline').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await supabaseProjectService.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    const canEdit = project.requester_id === req.user._id ||
                   project.assignee_id === req.user._id ||
                   req.user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({ message: '无权限修改此项目' });
    }

    const oldStatus = project.status;
    const oldAssigneeId = project.assignee_id;

    // 更新项目
    const updateData = { ...req.body, updated_by: req.user._id };
    if (req.body.deadline) {
      updateData.deadline = new Date(req.body.deadline);
    }

    const updatedProject = await supabaseProjectService.updateProject(req.params.id, updateData);

    // 发送状态变更通知
    if (oldStatus !== updatedProject.status) {
      await supabaseNotificationService.sendStatusChangeNotification(
        updatedProject.requester_id,
        updatedProject.assignee_id,
        req.user._id,
        updatedProject.id,
        updatedProject.name,
        updatedProject.status
      );
    }

    // 发送分配变更通知
    if (req.body.assigneeId && oldAssigneeId !== req.body.assigneeId) {
      await supabaseNotificationService.sendProjectAssignmentNotification(
        req.body.assigneeId,
        req.user._id,
        updatedProject.id,
        updatedProject.name
      );
    }

    res.json({
      message: '项目更新成功',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除项目
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    const canDelete = project.requesterId.toString() === req.user._id.toString() ||
                     req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({ message: '无权限删除此项目' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: '项目删除成功' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 上传项目图片
router.post('/:id/images', auth, upload.array('images', 5), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    const canEdit = project.requesterId.toString() === req.user._id.toString() ||
                   project.assigneeId?.toString() === req.user._id.toString() ||
                   req.user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({ message: '无权限修改此项目' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '请选择要上传的文件' });
    }

    const imageUrls = req.files.map(file => `/uploads/projects/${file.filename}`);
    project.images.push(...imageUrls);
    await project.save();

    res.json({
      message: '图片上传成功',
      images: imageUrls
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除项目图片
router.delete('/:id/images', auth, [
  body('imageUrl').exists()
], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限
    const canEdit = project.requesterId.toString() === req.user._id.toString() ||
                   project.assigneeId?.toString() === req.user._id.toString() ||
                   req.user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({ message: '无权限修改此项目' });
    }

    const { imageUrl } = req.body;
    const imageIndex = project.images.indexOf(imageUrl);
    
    if (imageIndex === -1) {
      return res.status(404).json({ message: '图片不存在' });
    }

    // 删除文件
    const imagePath = path.join(__dirname, '..', imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // 从数组中移除
    project.images.splice(imageIndex, 1);
    await project.save();

    res.json({ message: '图片删除成功' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加工时记录
router.post('/:id/time-entries', auth, [
  body('hours').isFloat({ min: 0.1, max: 24 }),
  body('description').optional().trim(),
  body('date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    const timeEntry = {
      userId: req.user._id,
      hours: req.body.hours,
      description: req.body.description || '',
      date: req.body.date ? new Date(req.body.date) : new Date()
    };

    project.timeEntries.push(timeEntry);
    await project.save();

    await project.populate('timeEntries.userId', 'name email');

    res.json({
      message: '工时记录添加成功',
      timeEntry: project.timeEntries[project.timeEntries.length - 1]
    });
  } catch (error) {
    console.error('Add time entry error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取项目统计
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Project.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalProjects = await Project.countDocuments({ isArchived: false });
    const myProjects = await Project.countDocuments({
      $or: [
        { requesterId: req.user._id },
        { assigneeId: req.user._id }
      ],
      isArchived: false
    });

    const overdueProjects = await Project.countDocuments({
      deadline: { $lt: new Date() },
      status: { $nin: ['已完成', '取消'] },
      isArchived: false
    });

    res.json({
      statusStats: stats,
      totalProjects,
      myProjects,
      overdueProjects
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;