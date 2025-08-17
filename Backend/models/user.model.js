import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null }, // null for super admin
    name: { type: String, required: [true, 'User name is required'] },
    email: { type: String, required: function() { return this.role !== 'customer'; }, unique: true },
    phoneNumber: { type: String },
    passwordHash: { type: String, required: function() { return this.role !== 'customer'; } },
    role: { type: String, enum: ['super_admin', 'admin', 'customer'], required: true },
    rfidCardId: { type: String, required: function() { return this.role === 'customer'; }, unique: true, sparse: true },
  },
  { timestamps: true }
);

userSchema.index({ clientId: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User;
