import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the path to serviceAccountKey.json
const serviceAccountPath = path.resolve(__dirname, '../config/serviceAccountKey.json');

// Check if the serviceAccountKey.json file exists
if (!fs.existsSync(serviceAccountPath)) {
    console.error(`Service account key file not found at: ${serviceAccountPath}`);
    process.exit(1); // Exit the process with an error code
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        databaseURL: 'https://vinyl-hub-default-rtdb.firebaseio.com',
    });
}

const db = admin.firestore();

async function updateListingsDescriptions() {
    try {
        const listingsCollection = db.collection('listings');
        const querySnapshot = await listingsCollection.get();

        for (const docSnap of querySnapshot.docs) {
            const listing = docSnap.data();

            // Update description to plain text
            if (listing.description) {
                const plainTextDescription = stripHtml(listing.description); // Convert to plain text
                await listingsCollection.doc(docSnap.id).update({ description: plainTextDescription });
                console.log(`Updated listing ${docSnap.id} with plain text description.`);
            }

            // Add albumPhotoUrls if not present
            if (!listing.albumPhotoUrls) {
                const updatedData = {
                    albumPhotoUrls: listing.albumCoverUrl ? [listing.albumCoverUrl] : [], // Initialize with albumCoverUrl if available
                };
                await listingsCollection.doc(docSnap.id).update(updatedData);
                console.log(`Updated listing ${docSnap.id} with albumPhotoUrls.`);
            }

            // Update genre mappings
            if (listing.genre === "Hip-Hop") {
                await listingsCollection.doc(docSnap.id).update({ genre: "Hip-Hop/Rap" });
                console.log(`Updated genre for listing ${docSnap.id} to "Hip-Hop/Rap".`);
            } else if (listing.genre === "R&B" || listing.genre === "Soul") {
                await listingsCollection.doc(docSnap.id).update({ genre: "R&B/Soul" });
                console.log(`Updated genre for listing ${docSnap.id} to "R&B/Soul".`);
            }
        }

        console.log('All listings updated successfully!');
    } catch (error) {
        console.error('Error updating listings:', error);
    }
}

function stripHtml(html) {
    return html.replace(/<\/?[^>]+(>|$)/g, ''); // Remove HTML tags
}

async function updateListings() {
    try {
        const listingsCollection = db.collection('listings');
        const querySnapshot = await listingsCollection.get();

        for (const docSnap of querySnapshot.docs) {
            const listing = docSnap.data();

            // Update genre mappings
            if (listing.genre === "Hip-Hop") {
                await listingsCollection.doc(docSnap.id).update({ genre: "Hip-Hop/Rap" });
                console.log(`Updated genre for listing ${docSnap.id} to "Hip-Hop/Rap".`);
            } else if (listing.genre === "R&B" || listing.genre === "Soul") {
                await listingsCollection.doc(docSnap.id).update({ genre: "R&B/Soul" });
                console.log(`Updated genre for listing ${docSnap.id} to "R&B/Soul".`);
            }

        
        }

        console.log('All listings updated successfully!');
    } catch (error) {
        console.error('Error updating listings:', error);
    }
}

// Call the function to update listings
updateListings();

updateListingsDescriptions();
