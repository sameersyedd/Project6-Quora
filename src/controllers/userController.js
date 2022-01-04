const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const userModel = require('../models/userModel')
const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/
const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true;
}

const isValidPassword = function(password) {
    if (password.length > 7 && password.length < 16)
        return true
}
const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


const registerUser = async function(req, res) {

    try {
        const requestBody = req.body

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, Message: "Invalid request params, please provide user details in body" })
        }
        // extract prams
        let { fname, lname, email, phone, password } = requestBody

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, Message: "Please provide first name" })
        }
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, Message: "Please provide last name" })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, Message: "Please provide email" })
        }
        let Email = email.split(" ").join('')
        const isEmailAlready = await userModel.findOne({ email: Email })
        if (isEmailAlready) {
            return res.status(400).send({ status: false, Message: `${Email} is already used` })
        }
        if (!((emailRegex).test(Email))) {
            return res.status(400).send({ status: false, Message: "Please provide valid email" })
        }

        if (phone) {
            if (!((phoneRegex).test(phone.split(" ").join("")))) {
                return res.status(400).send({ status: false, Message: "Please provide valid phone number" })
            }
            const isPhoneAlreadyUsed = await userModel.findOne({ phone });
            if (isPhoneAlreadyUsed) {
                res.status(400).send({ status: false, message: `${phone}  phone is already registered` })
                return
            }
        }



        if (!isValid(password)) {
            return res.status(400).send({ status: false, Message: "Please provide password" })
        }

        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, Message: "Length of password should be 8-15 char." })
        }

        const encryptedPass = await bcrypt.hash(password, 10)
        const userData = { fname, lname, email: Email, phone, password: encryptedPass }
        const createUser = await userModel.create(userData)
        return res.status(201).send({ status: true, Message: "User registered successfully", data: createUser })
    } catch (error) {
        return res.status(500).send({ status: false, Message: error.message })
    }
}

// const loginUser = async function(req, res) {
//     try {
//         const requestBody = req.body
//         if (!isValidRequestBody(requestBody)) {
//             return res.status(400).send({ status: false, Message: "Please provide login credentials" })
//         }

//         //Extract prams
//         let { email, password } = requestBody

//         if (!isValid(email)) {
//             return res.status(400).send({ status: false, Message: "Please provide email" })
//         }

//         if (!isValid(password)) {
//             return res.status(400).send({ status: false, Message: "Please provide email" })
//         }

//     } catch (error) {

//     }
// }

module.exports = { registerUser }