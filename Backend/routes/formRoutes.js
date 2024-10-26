const express = require('express');
const router = express.Router();
const { submitForm } = require('../controllers/formController');
const upload = require('../middleware/multer');

router.post('/submit', upload, submitForm); 

module.exports = router;
