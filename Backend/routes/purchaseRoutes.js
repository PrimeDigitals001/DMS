import { Router } from 'express';
import {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  getPurchasesByCustomer,
  getPurchasesByClient,
  deletePurchase
} from '../controllers/purchase.controller.js';

const router = Router();

// Create a new purchase
router.post('/create', createPurchase);

// Get all purchases
router.get('/all', getAllPurchases);

// Get purchase by ID
router.get('/:purchaseId', getPurchaseById);

// Get purchases by customer ID
router.get('/customer/:customerId', getPurchasesByCustomer);

// Get purchases by client ID
router.get('/client/:clientId', getPurchasesByClient);

// Delete purchase
router.delete('/:purchaseId', deletePurchase);

export default router;
