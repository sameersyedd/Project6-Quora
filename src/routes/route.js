const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const auth = require('../middleware/midware')
module.exports = router



router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', auth.userAuth, userController.getUser)