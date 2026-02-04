import app from '../config/firebase-config.js';
import { getFirestore, collection, addDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';
import sanitizeHtml from 'sanitize-html';

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

async function createListing(listingData, albumCover, albumPhotos) {
  try {
    let albumCoverUrl = '';
    if (albumCover) {
      const coverRef = ref(storage, `album-covers/${Date.now()}-${albumCover.name}`);
      await uploadBytes(coverRef, albumCover);
      albumCoverUrl = await getDownloadURL(coverRef);
    }

    const albumPhotoUrls = [];
    for (const photo of albumPhotos) {
      const photoRef = ref(storage, `album-photos/${Date.now()}-${photo.name}`);
      await uploadBytes(photoRef, photo);
      const photoUrl = await getDownloadURL(photoRef);
      albumPhotoUrls.push(photoUrl);
    }

    const listingWithImages = {
      ...listingData,
      albumCoverUrl,
      albumPhotoUrls, // Save all photo URLs
    };

    await addDoc(collection(db, 'listings'), listingWithImages);
    alert('Listing created successfully!');
  } catch (error) {
    console.error('Error creating listing:', error);
    alert('Failed to create listing. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const createListingForm = document.getElementById('createListingForm');
  const quill = new Quill('#listingDescriptionEditor', {
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'], // Formatting options
        ['link'], // Embed links
        [{ list: 'ordered' }, { list: 'bullet' }], // Lists
      ],
    },
  });

  // Redirect unauthenticated users to the login page
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert('You must be logged in to access this page.');
      window.location.href = 'login.html';
    } else {
      createListingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const albumTitle = document.getElementById('albumTitle').value;
        const artist = document.getElementById('artist').value;
        const genre = document.getElementById('genre').value;
        if (!["Rock", "Jazz", "Pop", "Alternative", "Hip-Hop/Rap", "R&B/Soul", "Country", "Electronic", "Blues", "Experimental", "Metal", "Other"].includes(genre)) {
          alert('Invalid genre selected.');
          return;
        }
        const releaseYear = document.getElementById('releaseYear').value;
        const condition = document.getElementById('condition').value;
        const price = document.getElementById('price').value;
        const albumCover = document.getElementById('albumCover').files[0];
        const albumPhotos = document.getElementById('albumPhotos').files;
        const description = sanitizeHtml(quill.root.innerHTML); 
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const username = userDoc.exists() ? userDoc.data().username : 'Anonymous';

          // Prepare listing data
          const listingData = {
            userId: user.uid,
            username, 
            albumTitle,
            artist,
            genre,
            releaseYear,
            condition,
            price,
            description,
            createdAt: new Date(),
          };

          // Send listing data to the server
          await createListing(listingData, albumCover, albumPhotos);

          createListingForm.reset();
          quill.setContents([]); // Clear the Quill editor
        } catch (error) {
          console.error('Error creating listing:', error);
          alert('Failed to create listing. Please try again.');
        }
      });
    }
  });
});