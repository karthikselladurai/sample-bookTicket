const logger = require('../../../services/logger');
const createBusSchema = require('../../../services/models/busSchema');
const { default: mongoose } = require('mongoose');
    const moment = require('moment');


exports.createBusService = async (req, res) => {
    try {
        let body = req.body
        let busData = new createBusSchema({
            createdBy:body.createdBy,
            busId: body.busId,
            from: body.from,
            to: body.to,
            travelDate: body.travelDate,
            seats: createSeats(),
            pickupTime: body.pickupTime,
            dropTime: body.dropTime
        })
        busData["_id"] = mongoose.Types.ObjectId().toString();
        // let validationError = busData.validateSync()
        // console.log(validationError);
        // if (validationError) {
        //     console.log("...................", validationError);
        //     logger.error({ status: "unsuccess", message: validationError, data: {} })
        //     return { status: "unsuccess", message: "invalid parameters", data: {} }
        // }
        // console.log(validationError);
        return await busData.save().then(data => {
            logger.info({ status: "success", message: "Bus service created Register Successfully", data: data })
            return { status: "success", message: "Bus service created Successfully", data: data }
        }).catch(err => {
            if (err._message) {
                logger.error({ status: "unsuccess", message: "invalid details bus details", data: err._message })
                return { status: "unsuccess", message: "invalid details bus details", data: {} }
            }
            logger.error({ status: "unsuccess", message: "create bus service failed", data: err })
            return { status: "unsuccess", message: "create bus service failed", data: err }
        })
    } catch (err) {
        console.log(err);
        logger.error({ status: "unsuccess", message: "Create Bus  Api Failed", data: err })
        return { status: "unsuccess", message: "Create Bus  Api Failed", data: err }
    }
}
exports.updateBusService = async (req, res) => {
    try {
        let body = req.body
        let resp = await createBusSchema.findByIdAndUpdate(body._Id, {
            adminId: body.adminId,
            busNumber: body.busNumber,
            from: body.from,
            to: body.to,
            travelDate: body.travelDate,
            seats: createSeats(),
            pickupTime: body.pickupTime,
            dropTime: body.dropTime
        })
        if (resp === null) {
            logger.error({ status: "unsuccess", message: "Bus Service Not Found", data: {} })
            return { status: "unsuccess", message: "Bus Service Not Found", data: {} }
        } else {
            logger.info({ status: "success", message: "Bus Service Updated Successfully", data: {} })
            return { status: "success", message: "Bus Service Updated Successfully", data: {} }
        }
    } catch (err) {
        logger.error({ status: "unsuccess", message: "Update Bus Api failed", data: err })
        return { status: "unsuccess", message: "Update Bus Api failed", data: err }
    }
}
exports.readBusService = async (req, res) => {
    try {
        let resp = await createBusSchema.find({});
        console.log(moment().format('MM-DD-YY:HH.mm'));
        resp.forEach(data => {
            console.log(data.travelDate+":"+data.pickupTime>moment().format('MM-DD-YYYY:HH.mm'));
            if(data.travelDate+":"+data.pickupTime > moment().format('MM-DD-YYYY:HH.mm')){
               console.log(data)
            }
            let bookedSeatCount = 0
            data.seats.forEach(seat => {
                if (seat.isBooked) {
                    bookedSeatCount++
                }
            })
            data._doc['bookedSeats'] = bookedSeatCount;
            data['seats'] = 41;    
        })
        logger.info({ status: "success", message: "Bus Service Read Successfully", data: {} })
        return { status: "success", message: "Bus Service Read Successfully", data: resp }
    } catch (err) {
        // console.log(err);
        logger.error({ status: "unsuccess", message: "Read Bus Api failed", data: err })
        return { status: "unsuccess", message: "Read Bus Api failed", data: err }
    }
}
exports.deleteBusService = async (req, res) => {
    try {
        let body = req.body
        let resp = await createBusSchema.deleteOne({ busNumber: body.busNumber })
        console.log(resp);
        if (resp.deletedCount === 0) {
            logger.error({ status: "unsuccess", message: " Bus Service Not Found", data: {} })
            return { status: "unsuccess", message: "Bus Service Not Found", data: {} }
        } else {
            logger.info({ status: "success", message: " Delete Bus Service Successfully", data: resp })
            return { status: "success", message: " Delete Bus Service  Successfully", data: [] }
        }
    } catch (err) {
        logger.error({ status: "unsuccess", message: "Delete Bus Api failed", data: err })
        return { status: "unsuccess", message: "Delete Bus Api failed", data: err }
    }
}
function createSeats() {
    seats = [];
    for (let i = 0; i < 41; i++) {
        let data = {
            seatId: i,
            isBooked: false,
            userId: null
        }
        seats.push(data)
    }
    return seats
}