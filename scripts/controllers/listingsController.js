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

const db = admin.firestore();

function stripHtml(html) {
  return html.replace(/<\/?[^>]+(>|$)/g, ''); // Remove HTML tags
}

export async function createListing(req, res) {
  try {
    const listing = req.body;
    if (listing.description) {
      listing.description = stripHtml(listing.description); // Convert to plain text
    }
    const docRef = await db.collection('listings').add(listing);
    res.status(201).json({ id: docRef.id, ...listing });
  } catch (error) {
    res.status(500).json({ message: 'Error creating listing', error });
  }
}

export async function getListings(req, res) {
  try {
    const snapshot = await db.collection('listings').get();
    const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listings', error });
  }
}

export async function updateListing(req, res) {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    if (updatedData.description) {
      updatedData.description = stripHtml(updatedData.description); // Convert to plain text
    }
    await db.collection('listings').doc(id).update(updatedData);
    res.status(200).json({ message: 'Listing updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating listing', error });
  }
}

export async function deleteListing(req, res) {
  try {
    const { id } = req.params;
    await db.collection('listings').doc(id).delete();
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting listing', error });
  }
}
