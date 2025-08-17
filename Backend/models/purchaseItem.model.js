import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema(
  {
    purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 }, // quantity * unitPrice
  },
  { timestamps: true }
);

purchaseItemSchema.index({ purchaseId: 1 });
purchaseItemSchema.index({ itemId: 1 });

const PurchaseItem = mongoose.model('PurchaseItem', purchaseItemSchema);
export default PurchaseItem;
