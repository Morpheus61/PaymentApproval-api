const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
const auth = require('../middleware/auth');

// Get all pending vouchers
router.get('/pending', auth, async (req, res) => {
  try {
    const vouchers = await Voucher.find({ status: 'Pending' })
      .populate('submittedBy', 'username fullName department')
      .sort({ createdAt: -1 });
    
    res.json(vouchers);
  } catch (error) {
    console.error('Error fetching pending vouchers:', error);
    res.status(500).json({ 
      message: 'Error fetching pending vouchers',
      error: error.message 
    });
  }
});

// Get all approved vouchers
router.get('/approved', auth, async (req, res) => {
  try {
    const vouchers = await Voucher.find({ status: 'Approved' })
      .populate('submittedBy', 'username fullName department')
      .sort({ updatedAt: -1 });
    
    res.json(vouchers);
  } catch (error) {
    console.error('Error fetching approved vouchers:', error);
    res.status(500).json({ 
      message: 'Error fetching approved vouchers',
      error: error.message 
    });
  }
});

// Create a new voucher
router.post('/', auth, async (req, res) => {
  try {
    const {
      payeeName,
      amount,
      category,
      department,
      description,
      attachments = []
    } = req.body;

    // Validate required fields
    if (!payeeName || !amount || !category || !department || !description) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          payeeName: !payeeName ? 'Payee name is required' : null,
          amount: !amount ? 'Amount is required' : null,
          category: !category ? 'Category is required' : null,
          department: !department ? 'Department is required' : null,
          description: !description ? 'Description is required' : null
        }
      });
    }

    const voucher = new Voucher({
      payeeName,
      amount,
      category,
      department,
      description,
      attachments,
      submittedBy: req.user.id,
      status: 'Pending'
    });

    await voucher.save();
    
    // Populate submittedBy field before sending response
    await voucher.populate('submittedBy', 'username fullName department');
    
    res.status(201).json(voucher);
  } catch (error) {
    console.error('Error creating voucher:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        details: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    res.status(500).json({ 
      message: 'Error creating voucher',
      error: error.message 
    });
  }
});

// Update voucher status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, comment } = req.body;
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Status must be either Approved or Rejected' 
      });
    }

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    // Only allow status update if current status is Pending
    if (voucher.status !== 'Pending') {
      return res.status(400).json({ 
        message: 'Cannot update status of non-pending voucher' 
      });
    }

    voucher.status = status;
    if (comment) {
      voucher.comments.push({
        user: req.user.id,
        text: comment
      });
    }

    await voucher.save();
    await voucher.populate('submittedBy', 'username fullName department');
    await voucher.populate('comments.user', 'username fullName');
    
    res.json(voucher);
  } catch (error) {
    console.error('Error updating voucher status:', error);
    res.status(500).json({ 
      message: 'Error updating voucher status',
      error: error.message 
    });
  }
});

// Add comment to voucher
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    voucher.comments.push({
      user: req.user.id,
      text
    });

    await voucher.save();
    await voucher.populate('comments.user', 'username fullName');
    
    res.json(voucher.comments[voucher.comments.length - 1]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      message: 'Error adding comment',
      error: error.message 
    });
  }
});

module.exports = router;
