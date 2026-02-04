import express from 'express';
import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    const serviceAccountPath = path.resolve('config/serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        databaseURL: 'https://vinyl-hub-default-rtdb.firebaseio.com',
    });
}

const router = express.Router();
const db = admin.firestore();

// POST /listings/:id/reviews
router.post('/listings/:id/reviews', async (req, res) => {
    console.log(`POST /listings/${req.params.id}/reviews - Body:`, req.body);

    const listingId = req.params.id;
    const { reviewerName, rating, content } = req.body;

    if (!reviewerName || !rating || !content) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const reviewData = {
            reviewerName,
            rating,
            content,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection('listings').doc(listingId).collection('reviews').add(reviewData);

        res.status(200).json({ message: "Review added successfully." });
    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).json({ error: "Failed to add review." });
    }
});

export default router;
