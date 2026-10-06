const express = require('express');
const { reportClientError } = require('../controllers/clientErrorController');

const router = express.Router();

router.post('/', reportClientError);

module.exports = router;
