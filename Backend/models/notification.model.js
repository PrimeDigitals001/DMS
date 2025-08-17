import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['instant', 'monthly'], required: true },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  },
  { timestamps: true }
);

notificationSchema.index({ clientId: 1 });
notificationSchema.index({ customerId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
