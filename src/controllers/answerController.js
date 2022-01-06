const mongoose = require('mongoose')
const questionModel = require('../models/questionModel.js')
const answerModel = require('../models/answerModel.js')

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true;
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

//feature 3 - API 1 - create answer

const createAns = async function(req, res) {
    try {
        const requestBody = req.body
        const tokenId = req.userId

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, Message: "Invalid request params, please provide answer details" })
        }

        //extract params
        let { answeredBy, text, questionId } = requestBody

        if (!isValid(answeredBy)) {
            return res.status(400).send({ status: false, Message: "Please provide text" })
        }

        if (!isValidObjectId(answeredBy)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild answeredBy ID" })
        }

        if (!isValid(text)) {
            return res.status(400).send({ status: false, Message: "Please provide text" })
        }

        if (!isValid(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide questionId" })
        }

        if (!isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild question ID" })
        }

        const question = await questionModel.findOne({ _id: questionId, isDeleted: false })
        console.log(question)

        if (!question) {
            return res.status(404).send({ status: false, Message: "No question found with provided question id" })
        }

        if (!(tokenId == answeredBy)) {
            return res.status(401).send({ status: false, Message: "Unauthorized, please provide your own answeredBy id" })
        }

        const answerData = { answeredBy, text, questionId }
        const newAns = await answerModel.create(answerData)
        return res.status(201).send({ status: true, Message: "Answer created successfully", data: newAns })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//Feature 3 - API 2 - Get Answers by question ID

const getAns = async function(req, res) {
    try {


        const qId = req.params.questionId
        if (!isValidObjectId(qId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild question ID" })
        }

        const question = await questionModel.findOne({ _id: qId, isDeleted: false })

        if (!question) {
            return res.status(404).send({ status: false, Message: "No question found with provided ID" })
        }
        const answer = await answerModel.find({ questionId: qId, isDeleted: false })

        if (answer.length === 0) {
            return res.status(404).send({ status: true, Message: "No answers found for this question" })
        }
        var ansArr = {
            description: question.description,
            tag: question.tag,
            askedBy: question.askedBy,
            answers: answer
        }
        return res.status(200).send({ status: true, data: ansArr })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

// Feature 3 -  API 3 - update answer

const updateAns = async function(req, res) {

    try {
        const requestBody = req.body
        const ansId = req.params.answerId
        const text = req.body.text
        const tokenId = req.userId
        if (!isValidObjectId(ansId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild answer ID" })
        }

        if (!isValidRequestBody(requestBody)) {
            return res.status(200).send({ status: false, Message: "No data updated, details are changed" })
        }

        const answer = await answerModel.findOne({ _id: ansId }, { isDeleted: false })

        if (!answer) {
            return res.status(404).send({ status: true, Message: "No answers found for this ID" })
        }

        if (!(answer.answeredBy == tokenId.toString())) {
            return res.status(401).send({ status: false, Message: "Unauthorized, You can't update this answer " })
        }


        if (!isValid(text)) {
            return res.status(400).send({ status: false, Message: "Please provide text" })
        }
        answer['text'] = text

        const updatedAns = await answer.save()
        return res.status(200).send({ status: false, Message: "Answer updated successfully", data: updatedAns })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//Feature 3 - API 4 - Delete Answer

const delAns = async function(req, res) {

    try {
        const requestBody = req.body
        const ansId = req.params.answerId
        const tokenId = req.userId
        const userId = req.body.userId
        const questionId = req.body.questionId

        if (!isValidObjectId(ansId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild answer ID" })
        }

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, Message: "Please provide body" })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild userId" })
        }

        if (!isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild questionId" })
        }

        if (!isValid(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide questionId" })
        }

        if (!isValid(userId)) {
            return res.status(400).send({ status: false, Message: "Please provide userId" })
        }


        const answer = await answerModel.findOne({ _id: ansId, isDeleted: false })
        console.log(answer)

        if (!answer) {
            return res.status(404).send({ status: true, Message: "No answers found for this ID" })
        }

        if (!(questionId == answer.questionId)) {
            return res.status(400).send({ status: false, Message: "Provided answer is not of the provided question" })
        }


        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, Message: "Unauthorized, You can't update this answer " })
        }

        const deletedAns = await answerModel.findOneAndUpdate({ _id: ansId }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        return res.status(200).send({ status: true, msg: "Answer Deleted", data: deletedAns })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { createAns, getAns, updateAns, delAns }