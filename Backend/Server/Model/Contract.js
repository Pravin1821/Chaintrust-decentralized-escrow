const mongoose = require('mongoose');
const contractSchema = new mongoose.Schema({
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true  
    },
    freelancer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    applications: [
    {
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    amount:{
        type: Number,
        required: true,
        min: 0
    },
    deadline:{
        type: Date,
        required: true
    },
    status:{
        type: String,
        enum: ["Created", "Assigned", "Funded", "Submitted", "Approved", "Paid", "Disputed", "Resolved"],
        default: "Created"
    },
    blockchainContrctId:{
        type: Number,
        default: null
    },
    escrowAddress:{
        type: String,
        default: null
    },
    escrowStatus:{
        type: String,
        enum: ["NotFunded", "Funded","Refunded"],
        default: "NotFunded"
    },
    fundedAt:{
        type: Date,
    },
    ipfsHash:{
        type: String,
        default: null
    },
    submittedAt:{
        type: Date,
        default: null
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    approvedAt:{
        type: Date,
        default: null
    },
    paidAt:{
        type: Date,
        default: null
    }
});
module.exports = mongoose.model('Contract', contractSchema);