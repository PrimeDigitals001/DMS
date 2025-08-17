import mongoose from 'mongoose';

const monthlyReportSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Date, required: true }, // first day of month
    pdfUrl: { type: String },
    totalAmount: { type: Number, required: true, min: 0 },
    qrCodeData: { type: String },
  },
  { timestamps: true }
);

monthlyReportSchema.index({ clientId: 1 });
monthlyReportSchema.index({ customerId: 1 });

const MonthlyReport = mongoose.model('MonthlyReport', monthlyReportSchema);
export default MonthlyReport;
