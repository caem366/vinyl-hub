import express from 'express';

const router = express.Router();

// Placeholder route for wishlist
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Wishlist route is working!' });
});

export { router as wishlistRoutes };
