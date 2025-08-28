import express from 'express';
import { login, logout, getCurrentUser } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);

export default router;
