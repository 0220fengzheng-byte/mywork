const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['未开始', '进行中', '已完成', '暂停', '取消'],
    default: '未开始'
  },
  priority: {
    type: String,
    enum: ['高', '中', '低'],
    default: '中'
  },
  deadline: {
    type: Date
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  documentUrl: {
    type: String,
    default: ''
  },
  documentTitle: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  notes: {
    type: String,
    default: ''
  },
  workHours: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // 工时记录
  timeEntries: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    hours: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// 索引优化
projectSchema.index({ status: 1, deadline: 1 });
projectSchema.index({ requesterId: 1 });
projectSchema.index({ assigneeId: 1 });
projectSchema.index({ createdDate: 1 });
projectSchema.index({ name: 'text', description: 'text', notes: 'text' });

// 虚拟字段：计算总工时
projectSchema.virtual('totalWorkHours').get(function() {
  return this.timeEntries.reduce((total, entry) => total + entry.hours, 0);
});

// 虚拟字段：是否逾期
projectSchema.virtual('isOverdue').get(function() {
  if (!this.deadline) return false;
  return new Date() > this.deadline && this.status !== '已完成';
});

// 确保虚拟字段在JSON序列化时包含
projectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);