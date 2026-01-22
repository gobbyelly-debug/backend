const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// File to store access keys locally
const KEYS_FILE = path.join(__dirname, '..', 'access_keys.json');

// Ensure keys file exists
async function ensureKeysFile() {
  try {
    await fs.access(KEYS_FILE);
  } catch {
    await fs.writeFile(KEYS_FILE, JSON.stringify({}));
  }
}

// Load keys from file
async function loadKeys() {
  try {
    await ensureKeysFile();
    const data = await fs.readFile(KEYS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading keys:', error);
    return {};
  }
}

// Save keys to file
async function saveKeys(keys) {
  try {
    await fs.writeFile(KEYS_FILE, JSON.stringify(keys, null, 2));
  } catch (error) {
    console.error('Error saving keys:', error);
  }
}

// Generate access key (6 characters: 2 digits hour + 1 char plan + 3 alphanumeric)
function generateAccessKey(planCode) {
  const now = new Date();
  const hour = now.getHours();
  const hourStr = ('0' + hour).slice(-2);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';

  for (let i = 0; i < 3; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return hourStr + planCode + randomPart;
}

// Generate and store access key
router.post('/generate', async (req, res) => {
  try {
    const { plan } = req.body; // 'week' or 'month'

    if (!plan || !['week', 'month'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Must be "week" or "month"' });
    }

    const planCode = plan === 'week' ? 'W' : 'M';
    const key = generateAccessKey(planCode);
    const days = plan === 'week' ? 7 : 30;

    const expiration = new Date();
    expiration.setDate(expiration.getDate() + days);

    // Store locally
    const keys = await loadKeys();
    keys[key] = {
      key,
      plan,
      planCode,
      expiration: expiration.toISOString(),
      createdAt: new Date().toISOString(),
      used: false,
      usedAt: null,
      usedBy: null
    };
    await saveKeys(keys);

    res.json({
      success: true,
      key,
      plan,
      expiration: expiration.toISOString()
    });

  } catch (error) {
    console.error('Error generating access key:', error);
    res.status(500).json({ error: 'Failed to generate access key' });
  }
});

// Validate access key
router.post('/validate', async (req, res) => {
  try {
    const { key, userId } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Access key is required' });
    }

    // Check key format (6 characters: 2 digits + 1 char + 3 alphanumeric)
    if (key.length !== 6 || !/^\d{2}[WM][A-Z0-9]{3}$/.test(key)) {
      return res.status(400).json({ error: 'Invalid access key format' });
    }

    const keys = await loadKeys();
    const keyData = keys[key];

    if (!keyData) {
      return res.status(404).json({ error: 'Access key not found' });
    }

    // Check if key is already used
    if (keyData.used) {
      return res.status(400).json({ error: 'Access key has already been used' });
    }

    // Check if key has expired
    const expiration = new Date(keyData.expiration);
    if (new Date() > expiration) {
      return res.status(400).json({ error: 'Access key has expired' });
    }

    // Check hour validation
    const keyHour = parseInt(key.substring(0, 2));
    const currentHour = new Date().getHours();
    if (keyHour !== currentHour) {
      return res.status(400).json({ error: 'Access key is from a different hour. Please get a new key' });
    }

    // Mark key as used
    keyData.used = true;
    keyData.usedAt = new Date().toISOString();
    keyData.usedBy = userId || 'anonymous';
    await saveKeys(keys);

    res.json({
      success: true,
      plan: keyData.plan,
      expiration: keyData.expiration
    });

  } catch (error) {
    console.error('Error validating access key:', error);
    res.status(500).json({ error: 'Failed to validate access key' });
  }
});

// Get all access keys (admin only)
router.get('/', async (req, res) => {
  try {
    const keys = await loadKeys();
    const keysArray = Object.values(keys);

    res.json({
      success: true,
      count: keysArray.length,
      keys: keysArray
    });

  } catch (error) {
    console.error('Error getting access keys:', error);
    res.status(500).json({ error: 'Failed to get access keys' });
  }
});

// Delete all access keys (admin only)
router.delete('/', async (req, res) => {
  try {
    await saveKeys({});

    res.json({
      success: true,
      message: 'All access keys deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting access keys:', error);
    res.status(500).json({ error: 'Failed to delete access keys' });
  }
});

module.exports = router;