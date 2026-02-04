import express from 'express';
import {
  createListing,
  getListings,
  updateListing,
  deleteListing,
} from '../controllers/listingsController.js';

const router = express.Router();

router.post('/', createListing);
router.get('/', getListings);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);

export { router as listingsRoutes };
