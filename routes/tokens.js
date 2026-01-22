const express = require('express');
const router = express.Router();

// In-memory storage for FCM tokens (use database in production)
let userTokens = new Map(); // userId -> token
let tokenUsers = new Map(); // token -> userId

// Register FCM token
router.post('/register', (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    // Remove old token if user had one
    if (userId && userTokens.has(userId)) {
      const oldToken = userTokens.get(userId);
      tokenUsers.delete(oldToken);
    }

    // Store new token
    if (userId) {
      userTokens.set(userId, token);
    }
    tokenUsers.set(token, userId || 'anonymous');

    console.log(`FCM Token registered: ${token.substring(0, 20)}...`);

    res.json({
      success: true,
      message: 'Token registered successfully'
    });

  } catch (error) {
    console.error('Error registering token:', error);
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// Unregister FCM token
router.post('/unregister', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    const userId = tokenUsers.get(token);
    if (userId) {
      userTokens.delete(userId);
    }
    tokenUsers.delete(token);

    res.json({
      success: true,
      message: 'Token unregistered successfully'
    });

  } catch (error) {
    console.error('Error unregistering token:', error);
    res.status(500).json({ error: 'Failed to unregister token' });
  }
});

// Get all tokens (admin only - add authentication in production)
router.get('/', (req, res) => {
  try {
    const tokens = Array.from(userTokens.entries()).map(([userId, token]) => ({
      userId,
      token: token.substring(0, 20) + '...',
      registeredAt: new Date().toISOString()
    }));

    res.json({
      success: true,
      count: tokens.length,
      tokens: tokens
    });

  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).json({ error: 'Failed to get tokens' });
  }
});

// Get token for specific user
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const token = userTokens.get(userId);

    if (!token) {
      return res.status(404).json({ error: 'Token not found for user' });
    }

    res.json({
      success: true,
      userId,
      token: token.substring(0, 20) + '...',
      fullToken: token
    });

  } catch (error) {
    console.error('Error getting user token:', error);
    res.status(500).json({ error: 'Failed to get user token' });
  }
});

module.exports = router;