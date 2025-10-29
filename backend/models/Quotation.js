import mongoose from 'mongoose';


const QuotationSchema = new mongoose.Schema({
project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
items: [
{
description: String,
unit: String,
qty: Number,
unitPrice: Number,
total: Number
}
],
subtotal: Number,
taxPct: { type: Number, default: 0 },
taxAmount: Number,
total: Number,
status: { type: String, enum: ['draft','sent','accepted','rejected'], default: 'draft' }
}, { timestamps: true });


export default mongoose.model('Quotation', QuotationSchema);