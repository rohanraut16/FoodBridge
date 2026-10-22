const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({

    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },

    foodType: {
        type: String,
        required: true
    },

    quantity: {
        type: String,
        required: true
    },

    foodCondition: {
        type: String,
        enum: ["cooked", "packaged"],
        required: true
    },

    foodImage: {
        type: String
    },

    cookingTime: {
        type: Date
    },

    manufactureDate: {
        type: Date
    },

    expiryDate: {
        type: Date
    },

    address: {
        type: String,
        required: true
    },

    phone: {
        type: Number,
        required: true
    },

    donorToAdminMsg: String,

    adminToAgentMsg: String,

    // NGO Physical Food Verification
    freshnessScore: {
        type: Number,
        min: 0,
        max: 100
    },

    qualityStatus: {
        type: String,
        enum: ["safe", "warning", "unsafe"]
    },

    shelfLife: {
        type: String
    },

    smellCheck: {
        type: Boolean,
        default: false
    },

    appearanceCheck: {
        type: Boolean,
        default: false
    },

    packagingCheck: {
        type: Boolean,
        default: false
    },

    expiryCheck: {
        type: Boolean,
        default: false
    },

    storageCheck: {
        type: Boolean,
        default: false
    },

    qualityVerified: {
        type: Boolean,
        default: false
    },

    qualityVerifiedAt: {
        type: Date
    },

    collectionTime: {
        type: Date
    },

    status: {
        type: String,
        enum: [
            "pending",
            "rejected",
            "accepted",
            "assigned",
            "collected"
        ],
        required: true
    }

});

const Donation = mongoose.model("donations", donationSchema);

module.exports = Donation;