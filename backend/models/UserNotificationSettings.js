const mongoose = require('mongoose');

const userNotificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emailDeadlineReminder: {
    type: Boolean,
    default: true
  },
  emailStatusChange: {
    type: Boolean,
    default: true
  },
  emailAssignment: {
    type: Boolean,
    default: true
  },
  emailWeeklyReport: {
    type: Boolean,
    default: false
  },
  siteNotifications: {
    type: Boolean,
    default: true
  },
  reminderDaysBefore: {
    type: Number,
    default: 1,
    min: 0,
    max: 30
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserNotificationSettings', userNotificationSettingsSchema);