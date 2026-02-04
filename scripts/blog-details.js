import app from '../config/firebase-config.js';
import { getFirestore, doc, getDoc, collection, addDoc, getDocs, deleteDoc, query, where } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';

const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Authentication

document.addEventListener('DOMContentLoaded', async () => {
    const blogDetailsContainer = document.getElementById('blogDetails');
    const blogId = new URLSearchParams(window.location.search).get('id');

    if (!blogId) {
        blogDetailsContainer.innerHTML = '<p class="text-danger">No blog ID provided.</p>';
        return;
    }

    try {
        const blogDoc = await getDoc(doc(db, 'blogs', blogId));
        if (!blogDoc.exists()) {
            blogDetailsContainer.innerHTML = '<p class="text-danger">Blog not found.</p>';
            return;
        }

        const blog = blogDoc.data();
        blogDetailsContainer.innerHTML = `
            <div class="col-12">
                <h1>${blog.title}</h1>
                <p class="text-muted">By ${blog.username || 'Anonymous'} on ${new Date(blog.date).toLocaleDateString()}</p>
                <img src="${blog.mainImage}" class="img-fluid mb-4" alt="${blog.title}">
                <div id="blogDescription"></div>
                <div id="blogContent" class="mb-5"></div> 
            </div>
        `;

        // Render blog description and content as HTML with proper formatting
        document.getElementById('blogDescription').innerHTML = blog.description.replace(/\n/g, '<br>');
        document.getElementById('blogContent').innerHTML = blog.content.replace(/\n/g, '<br>');

        const commentsContainer = document.createElement('div');
        commentsContainer.id = 'commentsContainer';
        commentsContainer.innerHTML = `
            <h3>Comments</h3>
            <div id="commentsList"></div>
            <form id="commentForm" class="mt-3">
                <input type="text" id="commentUsername" class="form-control mb-2" placeholder="Your Name" required>
                <textarea id="commentContent" class="form-control mb-2" rows="3" placeholder="Write a comment..." required></textarea>
                <button type="submit" class="btn btn-primary">Post Comment</button>
            </form>
        `;
        blogDetailsContainer.appendChild(commentsContainer);

        const loadComments = async () => {
            const commentsList = document.getElementById('commentsList');
            commentsList.innerHTML = '';
            const commentsQuery = query(collection(db, 'blogcomments'), where('blogId', '==', blogId));
            const querySnapshot = await getDocs(commentsQuery);

            querySnapshot.forEach((doc) => {
                const comment = doc.data();
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <div class="text-content">
                        <p><strong>${comment.username || 'Anonymous'}:</strong> ${comment.content}</p>
                        <small class="text-muted">${new Date(comment.date).toLocaleString()}</small>
                    </div>
                    ${comment.userId === auth.currentUser?.uid ? `<button class="delete-btn" data-id="${doc.id}">Delete</button>` : ''}
                `;
                commentsList.appendChild(commentElement);
            });

            // Add delete functionality
            document.querySelectorAll('.delete-btn').forEach((button) => {
                button.addEventListener('click', async (e) => {
                    const commentId = e.target.getAttribute('data-id');
                    await deleteDoc(doc(db, 'blogcomments', commentId));
                    loadComments();
                });
            });
        };

        document.getElementById('commentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('commentUsername').value.trim();
            const content = document.getElementById('commentContent').value.trim();
            if (!username || !content) return;

            try {
                const user = auth.currentUser; // Use the initialized auth object
                if (!user) {
                    alert('You must be logged in to post a comment.');
                    return;
                }

                await addDoc(collection(db, 'blogcomments'), {
                    blogId,
                    content,
                    username,
                    userId: user.uid,
                    date: new Date().toISOString(),
                });

                document.getElementById('commentUsername').value = '';
                document.getElementById('commentContent').value = '';
                loadComments();
            } catch (error) {
                console.error('Error posting comment:', error);
                alert('Failed to post comment. Please try again.');
            }
        });

        loadComments();

    } catch (error) {
        console.error('Error fetching blog details:', error);
        blogDetailsContainer.innerHTML = '<p class="text-danger">Failed to load blog details. Please try again later.</p>';
    }
});
