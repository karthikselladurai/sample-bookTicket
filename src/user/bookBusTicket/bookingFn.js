const logger = require('../../../services/logger');
const busSchema = require('../../../services/models/busSchema')
const moment = require('moment');
let body;

exports.update = async (req, res) => {
    try {
        let filter;
        body = req.body
        let updateSeatId = body.seatId
        console.log(body.busNumber, body.seatId, body.userId);
        // let resp = await busSchema.updateOne({ busNumber: body.busNumber, "seats.seatId": [{ $in: updateSeatId }] }, { $set: { "seats.$.isBooked": "true", "seats.$.userId": body.userId } }, { multi: true });
        // let result = await busSchema.find({ busNumber: body.busNumber });
        // result[0].seats.map(data => {
        //     updateSeatId.forEach(id => {
        //         if (data.seatId == id) {
        //             if (body.booking) {
        //                 data["isBooked"] = true
        //                 data["userId"] = body.userId
        //             } else {
        //                 data["isBooked"] = false
        //                 data["userId"] = null
        //             }
        //         }
        //     })
        // })
        // let resp = await busSchema.updateOne({ busNumber: body.busNumber }, { seats: result[0].seats })
        if(body.booking){
            filter = {"seats.$[element].isBooked" : true,"seats.$[element].userId":body.userId}
        }else{
             filter = {"seats.$[element].isBooked" : false,"seats.$[element].userId":null}
        }        
        let resp = await busSchema.updateMany(
            {_id: body.busId}, 
            {$set:filter }, 
            { arrayFilters: [
                { "element.seatId": { $in:updateSeatId}}
                ]
            })
            console.log(resp);
        if (resp.acknowledged && resp.modifiedCount === 1) {
            logger.info({ status: "success", message: body.booking?"Seat Booked successfully":"Seat Cancelled successfully", data: {} })
            return { status: "success", message: body.booking?"Seat Booked successfully":"Seat Cancelled successfully", data: {} }
        } else {
            logger.info({ status: "Unsuccess", message: "seat Updated failed", data: {} })
            return { status: "unsuccess", message: "seat Updated failed", data: {} }
        }
    } catch (err) {
        logger.error({ status: "unsuccess", message: "Updated Bus Api failed", data: err })
        return { status: "unsuccess", message: "Updated Bus Api failed", data: err }
    }
}

exports.read = async (req, res) => {
    try{
        body = req.body
        let resp = await busSchema.find(/*{ busDate:body.busDate,from:body.from, to:body.to}*/);
       if(resp.length <=0){
        logger.info({ status: "success", message:"Sorry No Bus Available", data: {} })
        return { status: "success", message:"Sorry No Bus Available", data: {} }
       }
       logger.info({ status: "success", message:"Get Bus List Successfully", data: {resp} })
       return { status: "success", message:"Get Bus List Successfully", data: resp }

    }catch(err){
        logger.error({ status: "unsuccess", message: " User Read Bus Api failed", data: err })
        return { status: "unsuccess", message: " User Read Bus Api failed", data: err }
    }
}