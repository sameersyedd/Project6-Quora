const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')
const questionController = require('../controllers/questionController.js')
const auth = require('../middleware/midware')
module.exports = router


//User Routes
router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', auth.userAuth, userController.getUser)
router.put('/user/:userId/profile', auth.userAuth, userController.updateUser)

//Question Routes
router.post('/question', auth.userAuth, questionController.createQuestion)
router.get('/questions', questionController.getAllQuestion)
router.get('/questions/:questionId', questionController.getQuestionById)