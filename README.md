# Mines Predictor Backend

Node.js backend server for Mines Predictor app with Firebase Cloud Messaging notifications and access key management.

## Features
- Send notifications to all users via FCM topics
- Store and manage FCM tokens
- Access key generation and validation with Firebase Firestore
- One-time use access keys
- REST API for web admin integration
- Rate limiting and security middleware

## 🚀 Deployment to Render

### Prerequisites
- Render account (https://render.com)
- Firebase project with Firestore enabled
- Firebase service account key

### Step 1: Prepare Firebase Service Account Key
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key (JSON)
3. Save the file as `firebase-service-account.json` in the backend folder

### Step 2: Deploy to Render
1. Connect your GitHub repository to Render
2. Create a new **Web Service**
3. Configure the service:
   - **Name**: `mines-predictor-backend`
   - **Runtime**: `Node.js`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables
In Render dashboard, add these environment variables:
```
NODE_ENV=production
FIREBASE_PROJECT_ID=mines-predictor-edf74
```

### Step 4: Upload Firebase Key
In Render dashboard:
1. Go to your service settings
2. Upload the `firebase-service-account.json` file as a secret file

### Step 5: Deploy
Click "Create Web Service" to deploy!

## 🔧 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key → Download JSON file
3. Rename to `firebase-service-account.json` and place in root directory

### 3. Environment Variables
Create a `.env` file:
```
PORT=3001
FIREBASE_PROJECT_ID=mines-predictor-edf74
```

### 4. Run Server
```bash
npm start          # Production
npm run dev        # Development with nodemon
```

## API Endpoints

### Access Keys

#### Generate Access Key
```http
POST /api/access-keys/generate
Content-Type: application/json

{
  "plan": "week" | "month"
}
```

**Response:**
```json
{
  "success": true,
  "key": "15WABC",
  "plan": "week",
  "expiration": "2026-01-29T12:32:48.048Z"
}
```

#### Validate Access Key
```http
POST /api/access-keys/validate
Content-Type: application/json

{
  "key": "15WABC",
  "userId": "user_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "plan": "week",
  "expiration": "2026-01-29T12:32:48.048Z"
}
```

#### Get All Access Keys (Admin)
```http
GET /api/access-keys
```

#### Delete All Access Keys (Admin)
```http
DELETE /api/access-keys
```

### Notifications

#### Send Notification to All Users
```http
POST /api/notifications/send
Content-Type: application/json

{
  "title": "New Update Available!",
  "body": "Check out the latest features in Mines Predictor",
  "type": "update"
}
```

### Send Notification to Specific Topic
```http
POST /api/notifications/send-topic
Content-Type: application/json

{
  "topic": "premium_users",
  "title": "Premium Feature",
  "body": "New premium prediction algorithm available",
  "type": "feature"
}
```

### Register FCM Token
```http
POST /api/tokens/register
Content-Type: application/json

{
  "token": "fcm_token_here",
  "userId": "user123"
}
```

### Get All Tokens (Admin)
```http
GET /api/tokens
Authorization: Bearer your-admin-token
```

## Web Admin Integration

Update your `web/admin.html` to call the backend:

```javascript
async function sendNotificationToAll(title, message) {
  try {
    const response = await fetch('http://your-server:3001/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        body: message,
        type: 'admin'
      }),
    });

    if (response.ok) {
      showModal('Success', 'Notification sent to all users!');
    } else {
      showModal('Error', 'Failed to send notification');
    }
  } catch (error) {
    showModal('Error', 'Network error');
  }
}
```

## 🧪 Testing

After deployment, test the API:
```bash
# Health check
curl -X GET https://mines-predictor-backend.onrender.com/health

# Generate access key
curl -X POST https://mines-predictor-backend.onrender.com/api/access-keys/generate \
  -H "Content-Type: application/json" \
  -d '{"plan": "week"}'

# Validate access key (replace KEY with actual key)
curl -X POST https://mines-predictor-backend.onrender.com/api/access-keys/validate \
  -H "Content-Type: application/json" \
  -d '{"key": "KEY", "userId": "test_user"}'
```

## 📱 Updating Flutter App

The Flutter app is configured to use the production URL by default. For development testing:

```bash
# Test with local server
flutter run --dart-define=API_BASE_URL=http://localhost:3001

# Test with Android emulator
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3001
```

## 🔒 Security Notes
- Add authentication to admin endpoints
- Use HTTPS in production
- Store service account key securely
- Implement rate limiting# backend
