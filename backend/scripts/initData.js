const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const UserNotificationSettings = require('../models/UserNotificationSettings');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const initData = async () => {
  try {
    await connectDB();

    // 检查是否已存在管理员用户
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // 创建默认管理员用户
    const adminUser = new User({
      email: 'admin@example.com',
      password: '123456', // 会被自动加密
      name: '系统管理员',
      role: 'admin',
      department: 'IT部门',
      phone: '13800138000',
      isActive: true,
      isEmailVerified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');

    // 创建默认通知设置
    const notificationSettings = new UserNotificationSettings({
      userId: adminUser._id,
      emailDeadlineReminder: true,
      emailStatusChange: true,
      emailAssignment: true,
      emailWeeklyReport: true,
      siteDeadlineReminder: true,
      siteStatusChange: true,
      siteAssignment: true,
      reminderDaysBefore: 3
    });

    await notificationSettings.save();
    console.log('Default notification settings created');

    // 创建一些测试用户
    const testUsers = [
      {
        email: 'user1@example.com',
        password: '123456',
        name: '张三',
        role: 'user',
        department: '产品部',
        phone: '13800138001',
        isActive: true,
        isEmailVerified: true
      },
      {
        email: 'user2@example.com',
        password: '123456',
        name: '李四',
        role: 'user',
        department: '开发部',
        phone: '13800138002',
        isActive: true,
        isEmailVerified: true
      },
      {
        email: 'manager@example.com',
        password: '123456',
        name: '王经理',
        role: 'manager',
        department: '项目部',
        phone: '13800138003',
        isActive: true,
        isEmailVerified: true
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        
        // 为每个用户创建默认通知设置
        const userNotificationSettings = new UserNotificationSettings({
          userId: user._id,
          emailDeadlineReminder: true,
          emailStatusChange: true,
          emailAssignment: true,
          emailWeeklyReport: false,
          siteDeadlineReminder: true,
          siteStatusChange: true,
          siteAssignment: true,
          reminderDaysBefore: 3
        });
        
        await userNotificationSettings.save();
        console.log(`Test user ${userData.name} created successfully`);
      }
    }

    console.log('Database initialization completed');
    
  } catch (error) {
    console.error('Init data error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// 运行初始化
initData();