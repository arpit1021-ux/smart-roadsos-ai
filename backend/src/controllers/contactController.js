const User = require('../models/User');

// @desc    Get user's emergency contacts
// @route   GET /api/contacts
// @access  Private
exports.getContacts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('emergencyContacts');

    res.status(200).json({
      success: true,
      contacts: user.emergencyContacts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add emergency contact
// @route   POST /api/contacts
// @access  Private
exports.addContact = async (req, res, next) => {
  try {
    const { name, phone, relationship, isPrimary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    const user = await User.findById(req.user._id);

    // If setting as primary, unset any existing primary
    if (isPrimary) {
      user.emergencyContacts.forEach(contact => {
        contact.isPrimary = false;
      });
    }

    user.emergencyContacts.push({
      name,
      phone,
      relationship: relationship || '',
      isPrimary: isPrimary || false
    });

    await user.save();

    res.status(201).json({
      success: true,
      contact: user.emergencyContacts[user.emergencyContacts.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update emergency contact
// @route   PUT /api/contacts/:id
// @access  Private
exports.updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, relationship, isPrimary } = req.body;

    const user = await User.findById(req.user._id);
    const contact = user.emergencyContacts.id(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Update fields
    if (name) contact.name = name;
    if (phone) contact.phone = phone;
    if (relationship !== undefined) contact.relationship = relationship;

    // Handle primary flag
    if (isPrimary && !contact.isPrimary) {
      user.emergencyContacts.forEach(c => {
        if (c._id.toString() !== id) {
          c.isPrimary = false;
        }
      });
      contact.isPrimary = true;
    } else if (!isPrimary && contact.isPrimary) {
      contact.isPrimary = false;
    }

    await user.save();

    res.status(200).json({
      success: true,
      contact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/contacts/:id
// @access  Private
exports.deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);
    const contact = user.emergencyContacts.id(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    contact.remove();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contact removed'
    });
  } catch (error) {
    next(error);
  }
};
