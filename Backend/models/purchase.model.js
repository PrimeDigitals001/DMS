import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    purchaseDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

purchaseSchema.index({ clientId: 1 });
purchaseSchema.index({ customerId: 1 });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
