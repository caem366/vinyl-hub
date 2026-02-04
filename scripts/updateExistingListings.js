import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve('config/serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        databaseURL: 'https://vinyl-hub-default-rtdb.firebaseio.com',
    });
}

const db = admin.firestore();

async function updateListings() {
    try {
        const listingsCollection = db.collection('listings');
        const querySnapshot = await listingsCollection.get();

        for (const docSnap of querySnapshot.docs) {
            const listing = docSnap.data();
            const updates = {};

            // Ensure albumPhotoUrls exists
            if (!listing.albumPhotoUrls) {
                updates.albumPhotoUrls = listing.albumCoverUrl ? [listing.albumCoverUrl] : [];
            }

            // Normalize other fields if needed
            if (listing.genre === "Hip-Hop") {
                updates.genre = "Hip-Hop/Rap";
            } else if (listing.genre === "R&B" || listing.genre === "Soul") {
                updates.genre = "R&B/Soul";
            }

            if (Object.keys(updates).length > 0) {
                await listingsCollection.doc(docSnap.id).update(updates);
                console.log(`Updated listing ${docSnap.id}`);
            }
        }

        console.log('All listings updated successfully!');
    } catch (error) {
        console.error('Error updating listings:', error);
    }
}

updateListings();
