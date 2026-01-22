const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Store FCM tokens in memory (in production, use a database)
let fcmTokens = new Set();

// Send notification to all users
router.post('/send', async (req, res) => {
  try {
    const { title, body, type = 'info', data = {} } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Send to all users topic
    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        type: type,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        ...data
      },
      topic: 'all_users',
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);

    console.log('Notification sent successfully:', response);

    res.json({
      success: true,
      messageId: response,
      recipients: 'all_users_topic'
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send notification to specific topic
router.post('/send-topic', async (req, res) => {
  try {
    const { topic, title, body, type = 'info', data = {} } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({ error: 'Topic, title, and body are required' });
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        type: type,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        ...data
      },
      topic: topic,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);

    res.json({
      success: true,
      messageId: response,
      topic: topic
    });

  } catch (error) {
    console.error('Error sending topic notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send notification to specific token
router.post('/send-token', async (req, res) => {
  try {
    const { token, title, body, type = 'info', data = {} } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({ error: 'Token, title, and body are required' });
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        type: type,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        ...data
      },
      token: token,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);

    res.json({
      success: true,
      messageId: response,
      token: token.substring(0, 20) + '...'
    });

  } catch (error) {
    console.error('Error sending token notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

module.exports = router;