import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import admin from 'firebase-admin';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccount = path.resolve(__dirname, '../config/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://vinyl-hub-default-rtdb.firebaseio.com',
});

const app = express();
const PORT = 5501;

// Middleware
const corsConfig = (await import('../cors.json', { with: { type: 'json' } })).default;
app.use(cors(corsConfig[0]));
app.use(bodyParser.json());

// Middleware to serve static files
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

// Serve static files from the root directory
app.use(express.static(path.resolve(__dirname, '../'), {
  extensions: ['html', 'js'], 
}));

// Serve static files from the "config" directory
app.use('/config', express.static(path.resolve(__dirname, '../config'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    },
}));

// Ensure fallback for MIME type issues
app.get('/config/firebase-config.js', (req, res) => {
    const filePath = path.resolve(__dirname, '../config/firebase-config.js');
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

// Serve static files from the "scripts/config" directory
app.use('/scripts/config', express.static(path.resolve(__dirname, '../scripts/config'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    },
}));

// Ensure fallback for MIME type issues
app.get('/scripts/config/firebase-config.js', (req, res) => {
    const filePath = path.resolve(__dirname, '../scripts/config/firebase-config.js');
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

// File upload middleware
const upload = multer({ dest: 'uploads/' });

// Modular routes
app.use('/api/auth', (await import('./routes/auth.js')).authRoutes);
app.use('/api/listings', (await import('./routes/reviews.js')).default); // Updated to match the new route
app.use('/api/blogs', (await import('./routes/blogs.js')).blogsRoutes);
app.use('/api/wishlist', (await import('./routes/wishlist.js')).wishlistRoutes);
app.use('/api/vinyls', (await import('./routes/reviews.js')).default); 

// Serve static files from the "ui mockup" directory
app.use(express.static(path.resolve(__dirname, '../'), { extensions: ['html'] }));

// Serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

// Fallback route to serve other HTML pages
app.get('*', (req, res) => {
  const filePath = path.resolve(__dirname, '../', req.path);
  if (path.extname(filePath) === '') {
    res.sendFile(path.resolve(__dirname, '../index.html')); // Default to index.html for SPA routing
  } else {
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).send('Page not found');
      }
    });
  }
});

// Handle file uploads and form data
app.post('/api/listings', upload.single('albumCover'), (req, res) => {
  console.log(req.file); // Uploaded file
  console.log(req.body); // Form data
});

// Handle checkout endpoint
app.post('/api/checkout', (req, res) => {
  try {
    const { id, title, artist, price } = req.body;

    if (!id || !title || !artist || typeof price !== 'number') {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    const selectedListing = { id, title, artist, price };
    res.status(200).json({ message: 'Item added to checkout', selectedListing });
  } catch (error) {
    console.error('Error in /api/checkout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Messaging API
app.post('/api/messages', async (req, res) => {
    try {
        const { senderId, senderUsername, receiverId, receiverUsername, message } = req.body;

        if (!senderId || !senderUsername || !receiverId || !receiverUsername || !message) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        const db = admin.firestore();
        const timestamp = new Date().toISOString();

        const messageData = {
            senderId,
            senderUsername,
            receiverId,
            receiverUsername,
            message,
            timestamp,
        };

        await db.collection('messages').add(messageData);
        res.status(200).json({ message: 'Message sent successfully', messageData });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/messages/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const db = admin.firestore();

        const inboxQuery = db.collection('messages').where('receiverId', '==', userId);
        const sentQuery = db.collection('messages').where('senderId', '==', userId);

        const [inboxSnapshot, sentSnapshot] = await Promise.all([inboxQuery.get(), sentQuery.get()]);

        const inboxMessages = inboxSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sentMessages = sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ inboxMessages, sentMessages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});