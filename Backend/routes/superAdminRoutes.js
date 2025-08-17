import express from 'express';
// import {protect , isAdmin} from '../middleware/auth.middleware.js'
import { createClient, deleteClient, getClientById, getClients, updateClient } from '../controllers/client.controller.js';

const router = express.Router();

// Client routes 
router.post('/clients/', createClient);
// Do not uncomment the isAdmin is yet to be tested and updated
// router.post('/clients/', protect, isAdmin, createClient);
router.get('/clients/', getClients);
router.get('/clients/:id', getClientById);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);



export default router;