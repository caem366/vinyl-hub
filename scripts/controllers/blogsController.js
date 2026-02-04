import admin from 'firebase-admin';

const db = admin.firestore();

export async function createBlog(req, res) {
  try {
    const blog = req.body;
    const docRef = await db.collection('blogs').add(blog);
    res.status(201).json({ id: docRef.id, ...blog });
  } catch (error) {
    res.status(500).json({ message: 'Error creating blog', error });
  }
}

export async function getBlogs(req, res) {
  try {
    const snapshot = await db.collection('blogs').get();
    const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error });
  }
}

export async function getBlogById(req, res) {
  try {
    const { id } = req.params;
    const doc = await db.collection('blogs').doc(id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Blog not found' });

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog', error });
  }
}

export async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    await db.collection('blogs').doc(id).update(updatedData);
    res.status(200).json({ message: 'Blog updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog', error });
  }
}

export async function deleteBlog(req, res) {
  try {
    const { id } = req.params;
    await db.collection('blogs').doc(id).delete();
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error });
  }
}
