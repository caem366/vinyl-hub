import admin from 'firebase-admin';

export async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(400).json({ message: 'Login failed', error });
  }
}

export function logoutUser(req, res) {
  res.status(200).json({ message: 'Logout successful' });
}

export async function checkAuthStatus(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await admin.auth().getUser(decodedToken.uid);
    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized', error });
  }
}
