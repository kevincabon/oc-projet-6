const express = require('express');
const router = express.Router();

const saucesController = require('../controllers/sauces');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, saucesController.createSauce);

router.put('/:id', auth, multer, saucesController.modifySauce);
router.delete('/:id', auth, saucesController.deleteSauce);

router.get('/', auth, saucesController.getAllSauces);
router.get('/:id', auth, saucesController.getOneSauce);

router.post('/:id/like', auth, saucesController.addLike);

module.exports = router;