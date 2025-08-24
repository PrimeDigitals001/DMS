import Purchase from '../models/purchase.model.js';
import PurchaseItem from '../models/purchaseItem.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a new purchase
const createPurchase = asyncHandler(async (req, res) => {
  const { clientId, customerId, itemList, totalAmount } = req.body;

  // Validate required fields
  if (!clientId || !customerId || !itemList || !Array.isArray(itemList) || itemList.length === 0) {
    throw new ApiError(400, "All fields are required and itemList must be a non-empty array");
  }

  // Validate itemList structure
  for (const item of itemList) {
    if (!item.itemId || !item.qty || item.qty <= 0) {
      throw new ApiError(400, "Each item must have valid itemId and qty");
    }
  }

  // Create the purchase
  const purchase = await Purchase.create({
    clientId,
    customerId,
    totalAmount,
    purchaseDate: new Date()
  });

  // Create purchase items
  const purchaseItems = await Promise.all(
    itemList.map(item => 
      PurchaseItem.create({
        purchaseId: purchase._id,
        itemId: item.itemId,
        quantity: item.qty,
        amount: item.qty * item.unitPrice // Assuming unitPrice is provided in itemList
      })
    )
  );

  // Fetch the created purchase with populated references
  const populatedPurchase = await Purchase.findById(purchase._id)
    .populate('clientId', 'name')
    .populate('customerId', 'name email');

  res.status(201).json(
    new ApiResponse(201, populatedPurchase, "Purchase created successfully")
  );
});

// Get all purchases
const getAllPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find()
    .populate('clientId', 'name')
    .populate('customerId', 'name email')
    .sort({ purchaseDate: -1 });

  res.status(200).json(
    new ApiResponse(200, purchases, "Purchases retrieved successfully")
  );
});

// Get purchase by ID
const getPurchaseById = asyncHandler(async (req, res) => {
  const { purchaseId } = req.params;

  const purchase = await Purchase.findById(purchaseId)
    .populate('clientId', 'name')
    .populate('customerId', 'name email');

  if (!purchase) {
    throw new ApiError(404, "Purchase not found");
  }

  // Get purchase items
  const purchaseItems = await PurchaseItem.find({ purchaseId })
    .populate('itemId', 'name price capacity image');

  const purchaseWithItems = {
    ...purchase.toObject(),
    items: purchaseItems
  };

  res.status(200).json(
    new ApiResponse(200, purchaseWithItems, "Purchase retrieved successfully")
  );
});

// Get purchases by customer ID
const getPurchasesByCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const purchases = await Purchase.find({ customerId })
    .populate('clientId', 'name')
    .populate('customerId', 'name email')
    .sort({ purchaseDate: -1 });

  res.status(200).json(
    new ApiResponse(200, purchases, "Customer purchases retrieved successfully")
  );
});

// Get purchases by client ID
const getPurchasesByClient = asyncHandler(async (req, res) => {
  const { clientId } = req.params;

  const purchases = await Purchase.find({ clientId })
    .populate('clientId', 'name')
    .populate('customerId', 'name email')
    .sort({ purchaseDate: -1 });

  res.status(200).json(
    new ApiResponse(200, purchases, "Client purchases retrieved successfully")
  );
});

// Delete purchase
const deletePurchase = asyncHandler(async (req, res) => {
  const { purchaseId } = req.params;

  const purchase = await Purchase.findById(purchaseId);

  if (!purchase) {
    throw new ApiError(404, "Purchase not found");
  }

  // Delete associated purchase items first
  await PurchaseItem.deleteMany({ purchaseId });

  // Delete the purchase
  await Purchase.findByIdAndDelete(purchaseId);

  res.status(200).json(
    new ApiResponse(200, {}, "Purchase deleted successfully")
  );
});

export {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  getPurchasesByCustomer,
  getPurchasesByClient,
  deletePurchase
};
