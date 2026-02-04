import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve('../config/serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        databaseURL: 'https://vinyl-hub-default-rtdb.firebaseio.com',
    });
}

const db = admin.firestore();

async function updateConditions() {
    try {
        const listingsCollection = db.collection('listings');
        const querySnapshot = await listingsCollection.get();

        for (const docSnap of querySnapshot.docs) {
            const listing = docSnap.data();

            if (listing.condition) {
                const normalizedCondition = listing.condition[0].toUpperCase() + listing.condition.slice(1).toLowerCase();
                if (listing.condition !== normalizedCondition) {
                    await listingsCollection.doc(docSnap.id).update({ condition: normalizedCondition });
                    console.log(`Updated condition for listing ${docSnap.id} to "${normalizedCondition}"`);
                }
            }
        }

        console.log('All listings updated successfully!');
    } catch (error) {
        console.error('Error updating conditions:', error);
    }
}

updateConditions();
