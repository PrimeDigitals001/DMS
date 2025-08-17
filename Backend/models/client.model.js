import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    client: { type: String, required: [true, 'Client name is required'] },
    ownerName: { type: String, required: [true] },
    phoneNumber: { type: String, required: [true]},
    email: { type: String },
  },
  { timestamps: true }
);

const Client = mongoose.model('Client', clientSchema);
export default Client;
