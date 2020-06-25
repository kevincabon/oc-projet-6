const express = require('express');
const router = express.Router();

const saucesController = require('../controllers/sauces');

router.get('/', saucesController.getAllSauces);

module.exports = router;