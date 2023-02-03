const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    _id: String,
    adminId: {
        type: String,
        required: true
    },
    adminName:{
        type: String,
        required: true,
    },
    busId: {
        type: String,
        required: true,
    },
    from: {
        type: String,
        required: true
    },
    to: {   
        type: String,
        required: true
    },
    travelDate: {
        type: String,
        required: true
    },
    seats: {
        type: Array,
        required: true
    },
    pickUpTime: {
        type: String,
        required: true,
    },
    dropTime: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})
let bus = mongoose.model('busDetails', busSchema);

module.exports = bus;
