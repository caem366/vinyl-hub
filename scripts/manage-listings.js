import app from '../config/firebase-config.js';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, onSnapshot, getDoc } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

const db = getFirestore(app);

async function loadListings() {
    const listingsTable = document.getElementById('listingsTable');
    listingsTable.innerHTML = ''; // Clear existing content

    try {
        const querySnapshot = await getDocs(collection(db, 'listings'));
        querySnapshot.forEach((doc) => {
            const listing = doc.data();
            listingsTable.innerHTML += `
                <tr id="listing-${doc.id}">
                    <td>${listing.albumTitle}</td>
                    <td>${listing.artist}</td>
                    <td>${listing.genre}</td>
                    <td>${listing.releaseYear}</td>
                    <td>${listing.condition}</td>
                    <td>$${listing.price}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editListing('${doc.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteListing('${doc.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        if (querySnapshot.empty) {
            listingsTable.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No listings available.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading listings:', error);
        alert('Failed to load listings. Please try again later.');
    }
}

// Real-time listener for Firestore updates
function listenForListingsUpdates() {
    const listingsCollection = collection(db, 'listings');
    onSnapshot(listingsCollection, () => {
        loadListings(); // Reload listings whenever there is a change
    });
}

async function editListing(id) {
    const docRef = doc(db, 'listings', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const listing = docSnap.data();
        const newTitle = prompt('Edit Album Title:', listing.albumTitle);
        const newArtist = prompt('Edit Artist:', listing.artist);
        const newPrice = prompt('Edit Price:', listing.price);

        if (newTitle && newArtist && newPrice) {
            try {
                await updateDoc(docRef, { albumTitle: newTitle, artist: newArtist, price: parseFloat(newPrice) });
                alert('Listing updated successfully!');
                loadListings();
            } catch (error) {
                console.error('Error updating listing:', error);
            }
        }
    } else {
        alert('Listing not found.');
    }
}

async function deleteListing(id) {
    if (confirm('Are you sure you want to delete this listing?')) {
        try {
            await deleteDoc(doc(db, 'listings', id));
            alert('Listing deleted successfully!');
            loadListings();
        } catch (error) {
            console.error('Error deleting listing:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadListings();
    listenForListingsUpdates(); // Start listening for real-time updates
});
