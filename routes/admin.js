const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-guitar => GET
router.get('/add-guitar', adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// // /admin/add-guitar => POST
router.post('/add-guitar', [
    body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
], 
isAuth, 
adminController.postAddProduct);

router.get('/add-guitar/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-guitar', [
    body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('imageUrl')
        .isURL(),
    body('price')
        .isFloat(),
    body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
], isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
