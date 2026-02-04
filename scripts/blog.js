import app from '../config/firebase-config.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async () => {
    const blogForm = document.getElementById('blogForm');
    const blogContainer = document.getElementById('blogContainer');

    if (blogForm) {
        blogForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('blogTitle').value;
            const description = window.descriptionQuill.root.innerHTML;
            const content = window.contentQuill.root.innerHTML;
            const mainImageFile = document.getElementById('mainImage').files[0];

            if (!mainImageFile) {
                alert('Please upload a main image.');
                return;
            }

            const user = auth.currentUser;
            if (!user) {
                alert('You must be logged in to create a blog.');
                return;
            }

            try {
                // Fetch the username of the logged-in user
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const username = userDoc.exists() ? userDoc.data().username : 'Anonymous';

                // Upload the main image to Firebase Storage
                const imageRef = ref(storage, `blog-images/${Date.now()}-${mainImageFile.name}`);
                await uploadBytes(imageRef, mainImageFile);
                const mainImageUrl = await getDownloadURL(imageRef);

                // Add the blog to Firestore
                const blogData = {
                    title,
                    description,
                    content,
                    mainImage: mainImageUrl,
                    userId: user.uid,
                    username, // Add username to the blog document
                    date: new Date().toISOString(),
                };

                await addDoc(collection(db, 'blogs'), blogData);

                alert('Blog posted successfully!');
                window.location.href = 'blog.html'; // Redirect to the blogs page
            } catch (error) {
                console.error('Error submitting blog:', error);
                alert('Failed to post blog. Please try again.');
            }
        });
    }

    try {
        // Fetch blogs from Firestore
        const querySnapshot = await getDocs(collection(db, 'blogs'));
        blogContainer.innerHTML = ''; // Clear existing content

        querySnapshot.forEach((doc) => {
            const blog = doc.data();
            const blogCard = `
                <div class="col-md-4 mb-4">
                    <div class="card blog-card">
                        <img src="${blog.mainImage}" class="card-img-top" alt="${blog.title}">
                        <div class="card-body">
                            <h5 class="card-title">${blog.title}</h5>
                            <p class="card-text">${blog.description}</p>
                            <p class="text-muted">By ${blog.username || 'Anonymous'} on ${new Date(blog.date).toLocaleDateString()}</p>
                            <a href="blog-details.html?id=${doc.id}" class="btn btn-primary">View More</a>
                        </div>
                    </div>
                </div>
            `;
            blogContainer.innerHTML += blogCard;
        });

        if (querySnapshot.empty) {
            blogContainer.innerHTML = '<p class="text-muted">No blogs available.</p>';
        }
    } catch (error) {
        console.error('Error loading blogs:', error);
        blogContainer.innerHTML = '<p class="text-danger">Failed to load blogs. Please try again later.</p>';
    }
});