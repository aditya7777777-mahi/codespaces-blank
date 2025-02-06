const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { protect, authorize } = require('../middleware/authMiddleware');

// Create ticket
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { title } = req.body;
    const ticketId = 'TIC' + Date.now();
    
    const ticket = await Ticket.create({
      ticketId,
      title,
      customer: req.user._id
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get tickets (filtered by role)
router.get('/', protect, async (req, res) => {
  try {
    let tickets;
    if (req.user.role === 'customer') {
      tickets = await Ticket.find({ customer: req.user._id })
        .populate('customer', 'name')
        .sort({ lastUpdated: -1 });
    } else {
      tickets = await Ticket.find()
        .populate('customer', 'name')
        .sort({ lastUpdated: -1 });
    }
    res.json(tickets);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get specific ticket
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('assignedTo', 'name')
      .populate('notes.addedBy', 'name role');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user has permission to view ticket
    if (req.user.role === 'customer' && ticket.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add note to ticket
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const { content, attachment } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.notes.push({
      content,
      attachment,
      addedBy: req.user._id
    });
    ticket.lastUpdated = Date.now();
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update ticket status
router.patch('/:id/status', protect, authorize('agent', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, lastUpdated: Date.now() },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;