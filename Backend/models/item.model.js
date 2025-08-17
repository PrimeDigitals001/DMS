import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    name: { type: String, required: [true, 'Item name is required'] },
    unitPrice: { type: Number, required: [true, 'Unit price is required'], min: 0 },
    unit: { type: String, default: 'unit' }, // e.g., L, g, kg
  },
  { timestamps: true }
);

itemSchema.index({ clientId: 1 });

const Item = mongoose.model('Item', itemSchema);
export default Item;
