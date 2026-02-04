# VinylHub

A vinyl records marketplace platform.

## Setup Instructions

### 1. Firebase Configuration

1. Copy the example config file:
   ```
   cp config/firebase-config.example.js config/firebase-config.js
   ```

2. Go to your [Firebase Console](https://console.firebase.google.com/)
3. Select your project or create a new one
4. Go to Project Settings > General
5. Scroll down to "Your apps" and copy your Firebase configuration
6. Replace the placeholder values in `config/firebase-config.js` with your actual credentials

### 2. Service Account Key (for backend/functions)

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save the downloaded JSON file as `config/serviceAccountKey.json`

**⚠️ NEVER commit this file to Git!**

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Project

```bash
npm start
```

## Security Notes

- `config/firebase-config.js` and `config/serviceAccountKey.json` are ignored by Git
- Never commit API keys or service account credentials
- Use environment variables for production deployments
