const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const path = require('path');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is a video
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Initialize Firebase Storage bucket
const bucket = admin.storage().bucket();

// In-memory storage for video metadata (in production, use a database)
let videos = [];

// Get all videos
router.get('/', async (req, res) => {
  try {
    // Return video metadata
    const videoList = videos.map(video => ({
      id: video.id,
      filename: video.filename,
      originalName: video.originalName,
      size: video.size,
      mimeType: video.mimeType,
      uploadedAt: video.uploadedAt,
      url: video.url
    }));

    res.json({
      success: true,
      videos: videoList
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch videos'
    });
  }
});

// Upload video
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file provided'
      });
    }

    const file = req.file;
    const videoId = uuidv4();
    const filename = `videos/${videoId}_${Date.now()}${path.extname(file.originalname)}`;

    // Upload to Firebase Storage
    const fileUpload = bucket.file(filename);
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    stream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload video'
      });
    });

    stream.on('finish', async () => {
      try {
        // Make file publicly accessible
        await fileUpload.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        // Store video metadata
        const videoData = {
          id: videoId,
          filename: filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date().toISOString(),
          url: publicUrl
        };

        videos.push(videoData);

        res.json({
          success: true,
          video: videoData,
          message: 'Video uploaded successfully'
        });
      } catch (error) {
        console.error('Error making file public:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to make video publicly accessible'
        });
      }
    });

    stream.end(file.buffer);
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload video'
    });
  }
});

// Delete video
router.delete('/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const videoIndex = videos.findIndex(v => v.id === videoId);

    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const video = videos[videoIndex];

    // Delete from Firebase Storage
    await bucket.file(video.filename).delete();

    // Remove from memory
    videos.splice(videoIndex, 1);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete video'
    });
  }
});

// Get random video for ads
router.get('/random', (req, res) => {
  try {
    if (videos.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No videos available'
      });
    }

    // Get random video
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    res.json({
      success: true,
      video: randomVideo
    });
  } catch (error) {
    console.error('Error getting random video:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get random video'
    });
  }
});

module.exports = router;