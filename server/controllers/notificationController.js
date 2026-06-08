const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    const unreadCount = await Notification.count({
      where: { userId, read: false }
    });

    return res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    console.error('GetNotifications Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    notification.read = true;
    await notification.save();

    return res.json({ success: true, data: notification });
  } catch (error) {
    console.error('MarkAsRead Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { read: true },
      { where: { userId, read: false } }
    );

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('MarkAllAsRead Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    await notification.destroy();

    return res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('DeleteNotification Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
