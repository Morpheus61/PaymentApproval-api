const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  payeeName: {
    type: String,
    required: [true, 'Payee name is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Travel', 'Office Supplies', 'Equipment', 'Services', 'Other']
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitter is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: Date
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
voucherSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;
