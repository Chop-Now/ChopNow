const express = require('express');
const { sendContact, sendVendorInterestForm } = require('../controllers/contactController');

const router = express.Router();

router.post('/', sendContact);
router.post('/vendor-interest', sendVendorInterestForm);

module.exports = router;
