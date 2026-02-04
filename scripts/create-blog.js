import sanitizeHtml from 'sanitize-html';
import app from '../config/firebase-config.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

document.getElementById('blogForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const title = document.getElementById('blogTitle').value;
  const description = sanitizeHtml(descriptionQuill.root.innerHTML); // Sanitize description
  const content = sanitizeHtml(contentQuill.root.innerHTML); // Sanitize content
  const mainImageFile = document.getElementById('mainImage').files[0];

  if (!mainImageFile) {
    alert('Please upload a main image.');
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to create a blog.');
      return;
    }

    // Upload main image
    const mainImageRef = ref(storage, `blog-images/${Date.now()}-${mainImageFile.name}`);
    await uploadBytes(mainImageRef, mainImageFile);
    const mainImageUrl = await getDownloadURL(mainImageRef);

    // Save blog post to Firestore
    const blogData = {
      title,
      description,
      content,
      mainImage: mainImageUrl,
      userId: user.uid,
      username: user.displayName || 'Anonymous',
      date: new Date().toISOString(),
    };

    await addDoc(collection(db, 'blogs'), blogData);

    alert('Blog posted successfully!');
    window.location.href = 'blog.html'; // Redirect to the blogs page
  } catch (error) {
    console.error('Error submitting blog:', error);
    alert('Failed to post blog. Please check your network connection or contact support.');
  }
});