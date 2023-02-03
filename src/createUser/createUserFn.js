const logger = require('../../services/logger');
const userSchema = require('../../services/models/userSchema');
const createUserValidation = require('./dbValidation')
var Validator = require('jsonschema').Validator;
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');
const env = process.env
var v = new Validator();
const busServiceFn = require('../admin/busService/busServiceFn');
const moment = require('moment');


//register
exports.create = async (req) => {
    try {
        let body = req.body
        const user = new userSchema({
            userFirstName: body.userFirstName,
            userLastName: body.userLastName,
            userDob: body.userDob,
            userMobileNumber: body.userMobileNumber,
            userEmail: body.userEmail,
            userAddress: body.userAddress,
            userIsAdmin: body.userIsAdmin,
            userName: body.userName,
            userPassword: await bcrypt.hash(body.userPassword, parseInt(env.SALT)),
            tickets: []
        })
        user["_id"] = mongoose.Types.ObjectId().toString();
        console.log(user);
        let validationError = user.validateSync();
        if (validationError) {
            console.log("...................", validationError);
            logger.error({ status: "unsuccess", message: validationError, data: {} })
            return { status: "unsuccess", message: "invalid parameters", data: {} }
        }
        // console.log(validationError);
        console.log(user);
        return await user.save().then(data => {
            logger.info({ status: "success", message: "User Data Register Successfully", data: data })
            return { status: "success", message: "User Data Register Successfully", data: data }
        }).catch(err => {
            // console.log(err.code);
            if (err.code === 11000) {
                return { status: "unsuccess", message: "User Name Already exit", data: {} }
            }
            logger.error({ status: "unsuccess", message: "User Data Register failed", data: err })
            return { status: "unsuccess", message: "User Data Register failed", data: err }
        })
    } catch (err) {
        logger.error({ status: "unsuccess", message: "User create Api failed", data: err })
        return { status: "unsuccess", message: "User create Api failed", data: err }
    }
}
exports.update = async (req) => {
    try {
        let body = req.body
        let id = body.id
        if (!id || id.length < 0) {
            logger.error({ status: "unsuccess", message: "User id can't be null ", data: {} })
            return { status: "unsuccess", message: "User id can't be null ", data: {} }
        }
        //  await userSchema.findById(id, async (err) => {
        //     if (err) {
        //         logger.error({ status: "unsuccess", message: "Invalid User id ", data: {} })
        //         return { status: "unsuccess", message: "Invalid User id ", data: {} }
        //     } else {
        //         let resp = await userSchema.findByIdAndUpdate(body.id, {
        //             userFirstName: body.userFirstName,
        //             userLastName: body.userLastName,
        //             userDob: body.userDob,
        //             userMobileNumber: body.userMobileNumber,
        //             userEmail: body.userEmail,
        //             userAddress: body.userAddress,
        //             userIdAmin: body.userIdAmin,
        //             userName: body.userName,
        //         });
        //         console.log(resp);
        //     }
        // })
        // var hex = /[0-9A-Fa-f]{6}/g;
        // i = (hex.test(id))? ObjectId(id) : id;
        let resp = await userSchema.findByIdAndUpdate(id, {
            userFirstName: body.userFirstName,
            userLastName: body.userLastName,
            userDob: body.userDob,
            userMobileNumber: body.userMobileNumber,
            userEmail: body.userEmail,
            userAddress: body.userAddress,
            userIdAmin: body.userIdAmin,
            userName: body.userName,
        })
        // console.log("?>>>>>>>>>>>>>>>>>>>>>>>>>>>>",resp);
        if (resp === null) {
            logger.error({ status: "unsuccess", message: "User not found", data: {} })
            return { status: "unsuccess", message: "User not found", data: {} }
        } else {
            logger.error({ status: "success", message: "User updated successfully", data: {} })
            return { status: "success", message: "User updated successfully", data: {} }
        }
    } catch (err) {
        logger.error({ status: "unsuccess", message: "User Api failed", data: err })
        return { status: "unsuccess", message: "User update Api failed", data: err }
    }
}
exports.ticketHistoryUpdate = async (req) => {
    try {
        let filter;
        let body = req.body
        let busDetailsResp = await busServiceFn.readBusServiceById(req);
        if (busDetailsResp.data[0].length <= 0) {
            logger.info({ status: "success", message: "No Bus Service Available", data: {} })
            return { status: "success", message: "No Bus Service Available", data: busDetailsResp.data }
        }
        console.log(busDetailsResp.data[0].pickupTime);
        if (body.booking == 'true') {
            let ticketDetails = {
                busId: body.userId,
                busId: body.busId,
                from: busDetailsResp.data[0].from,
                to: busDetailsResp.data[0].to,
                pickUpTime: busDetailsResp.data[0].pickUpTime,
                dropTime: busDetailsResp.data[0].dropTime,
                travelDate: busDetailsResp.data[0].travelDate,
                seats: body.seatId,
                dateOfBooking: moment().format('DD-mm-yyyy'),
                isCompleted: false,
            }
            filter = { $push: { tickets: ticketDetails } }
        } else {
            filter = { $pull: { tickets: { busId: body.busId } } }
        }
        let resp = await userSchema.updateOne({ _id: body.userId }, filter);
        if (resp.acknowledged && resp.modifiedCount === 1) {
            logger.info({ status: "Success", message: "Ticket History Updated Successfully", data: {} })
            return { status: "Success", message: "Ticket History Updated Successfully", data: {} }
        } else {
            logger.info({ status: "Success", message: "Ticket History Updated Failed", data: {} })
            return { status: "Success", message: "Ticket History Updated Failed", data: {} }
        }

    } catch (err) {
        console.log(err);
        logger.error({ status: "unsuccess", message: "ticket Update Api failed", data: err })
        return { status: "unsuccess", message: "ticket Update Api failed", data: err }
    }
}