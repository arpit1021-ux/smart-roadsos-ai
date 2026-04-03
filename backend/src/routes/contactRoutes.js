const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getContacts,
  addContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// Validation
const contactValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
];

// Routes
router.get('/', protect, getContacts);
router.post('/', protect, contactValidation, addContact);
router.put('/:id', protect, updateContact);
router.delete('/:id', protect, deleteContact);

module.exports = router;
