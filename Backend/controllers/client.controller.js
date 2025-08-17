// controllers/clientController.js
import Client from '../models/client.model.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new client
 * @route   POST /api/clients
 * @access  Private/Admin
 */
export const createClient = async (req, res) => {
  try {
    const { client, ownerName, phoneNumber, email } = req.body;

    // Validate required fields
    if (!client || !ownerName || !phoneNumber) {
      return res.status(400).json({ message: 'Client, ownerName, and phoneNumber are required' });
    }

    // Optional: Validate email format
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check for duplicate client by name + phone
    const existingClient = await Client.findOne({ client, phoneNumber });
    if (existingClient) {
      return res.status(409).json({ message: 'Client with this name and phone number already exists' });
    }

    const newClient = new Client({ client, ownerName, phoneNumber, email });
    const savedClient = await newClient.save();

    res.status(201).json({ success: true, data: savedClient });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all clients with optional pagination
 * @route   GET /api/clients
 * @access  Private/Admin
 */
export const getClients = async (req, res) => {
  try {
    let { page, limit, search } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    const skip = (page - 1) * limit;

    // Search by client name or ownerName
    const query = search
      ? { $or: [{ client: { $regex: search, $options: 'i' } }, { ownerName: { $regex: search, $options: 'i' } }] }
      : {};

    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: clients,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get a single client by ID
 * @route   GET /api/clients/:id
 * @access  Private/Admin
 */
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json({ success: true, data: client });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a client
 * @route   PUT /api/clients/:id
 * @access  Private/Admin
 */
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { client, ownerName, phoneNumber, email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const existingClient = await Client.findById(id);
    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Update only fields that are provided
    if (client) existingClient.client = client;
    if (ownerName) existingClient.ownerName = ownerName;
    if (phoneNumber) existingClient.phoneNumber = phoneNumber;
    if (email) {
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      existingClient.email = email;
    }

    const updatedClient = await existingClient.save();
    res.status(200).json({ success: true, data: updatedClient });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a client
 * @route   DELETE /api/clients/:id
 * @access  Private/Admin
 */
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json({ success: true, message: 'Client deleted successfully' });

  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
