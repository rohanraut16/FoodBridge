const express = require("express");
const router = express.Router();

const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");


// =====================================================
// NGO DASHBOARD
// =====================================================

router.get(
    "/agent/dashboard",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const agentId = req.user._id;


            // Available donations approved by Admin
            const numAvailableDonations =
                await Donation.countDocuments({
                    status: "accepted",
                    $or: [
                        { agent: { $exists: false } },
                        { agent: null }
                    ]
                });


            // Donations accepted by this NGO
            const numAcceptedDonations =
                await Donation.countDocuments({
                    agent: agentId,
                    status: "assigned"
                });


            // Pending pickups
            const numPendingPickups =
                await Donation.countDocuments({
                    agent: agentId,
                    status: "assigned"
                });


            // Completed pickups
            const numCompletedPickups =
                await Donation.countDocuments({
                    agent: agentId,
                    status: "collected"
                });


            // Recent available donations
            const recentAvailableDonations =
                await Donation.find({
                    status: "accepted",
                    $or: [
                        { agent: { $exists: false } },
                        { agent: null }
                    ]
                })
                .populate("donor")
                .sort({ _id: -1 })
                .limit(5);


            // Recent completed pickups
            const recentCompletedPickups =
                await Donation.find({
                    agent: agentId,
                    status: "collected"
                })
                .populate("donor")
                .sort({ collectionTime: -1 })
                .limit(5);


            res.render("agent/dashboard", {

                title: "Dashboard",

                numAvailableDonations,

                numAcceptedDonations,

                numPendingPickups,

                numCompletedPickups,

                recentAvailableDonations,

                recentCompletedPickups

            });


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred on the server."
            );

            res.redirect("back");
        }
    }
);



// =====================================================
// AVAILABLE DONATIONS
// =====================================================

router.get(
    "/agent/donations/available",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const availableDonations =
                await Donation.find({

                    status: "accepted",

                    $or: [
                        { agent: { $exists: false } },
                        { agent: null }
                    ]

                })
                .populate("donor")
                .sort({ _id: -1 });


            res.render(
                "agent/availableDonations",
                {
                    title: "Available Donations",
                    availableDonations
                }
            );


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred on the server."
            );

            res.redirect("back");
        }
    }
);



// =====================================================
// DONATION DETAILS
// =====================================================

router.get(
    "/agent/donation/view/:donationId",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const donation =
                await Donation.findOne({

                    _id: req.params.donationId,

                    status: "accepted",

                    $or: [
                        { agent: { $exists: false } },
                        { agent: null }
                    ]

                })
                .populate("donor");


            if (!donation) {

                req.flash(
                    "error",
                    "Donation is no longer available."
                );

                return res.redirect(
                    "/agent/donations/available"
                );
            }


            res.render(
                "agent/donationDetails",
                {
                    title: "Donation Details",
                    donation
                }
            );


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred on the server."
            );

            res.redirect(
                "/agent/donations/available"
            );
        }
    }
);



// =====================================================
// PHYSICAL VERIFICATION PAGE
// =====================================================

router.get(
    "/agent/donation/verify/:donationId",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const donation =
                await Donation.findOne({

                    _id: req.params.donationId,

                    status: "accepted",

                    $or: [
                        { agent: { $exists: false } },
                        { agent: null }
                    ]

                })
                .populate("donor");


            if (!donation) {

                req.flash(
                    "error",
                    "Donation is no longer available."
                );

                return res.redirect(
                    "/agent/donations/available"
                );
            }


            // -----------------------------------------
            // SYSTEM BASED FRESHNESS INFORMATION
            // -----------------------------------------

            let freshnessScore = 100;

            let qualityStatus = "safe";

            let shelfLife = "8 Hours";


            const now = new Date();


            // Check expiry date
            if (donation.expiryDate) {

                const expiryDate =
                    new Date(donation.expiryDate);

                const difference =
                    expiryDate.getTime() - now.getTime();

                const hoursRemaining =
                    difference / (1000 * 60 * 60);


                if (hoursRemaining <= 0) {

                    freshnessScore = 0;

                    qualityStatus = "unsafe";

                    shelfLife = "Expired";

                }

                else if (hoursRemaining <= 4) {

                    freshnessScore = 60;

                    qualityStatus = "warning";

                    shelfLife =
                        `${Math.max(
                            1,
                            Math.floor(hoursRemaining)
                        )} Hours`;

                }

                else if (hoursRemaining <= 8) {

                    freshnessScore = 75;

                    qualityStatus = "warning";

                    shelfLife =
                        `${Math.floor(hoursRemaining)} Hours`;

                }

                else {

                    freshnessScore = 85;

                    qualityStatus = "safe";

                    shelfLife =
                        `${Math.floor(hoursRemaining)} Hours`;
                }
            }


            // Cooked food gets shorter shelf-life
            if (
                donation.foodCondition === "cooked" &&
                qualityStatus === "safe"
            ) {

                freshnessScore =
                    Math.min(freshnessScore, 85);

                shelfLife = "8 Hours";
            }


            res.render(
                "agent/physicalVerification",
                {
                    title: "Physical Food Verification",

                    donation,

                    freshnessScore,

                    qualityStatus,

                    shelfLife
                }
            );


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred on the server."
            );

            res.redirect(
                "/agent/donations/available"
            );
        }
    }
);



// =====================================================
// VERIFY & ACCEPT DONATION
// =====================================================

router.post(
    "/agent/donation/verify/:donationId",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const donation =
                await Donation.findOne({

                    _id: req.params.donationId,

                    status: "accepted",

                    $or: [
                        { agent: { $exists: false } },
                        { agent: null }
                    ]

                });


            if (!donation) {

                req.flash(
                    "error",
                    "This donation is no longer available."
                );

                return res.redirect(
                    "/agent/donations/available"
                );
            }


            // -----------------------------------------
            // NGO PHYSICAL CHECKS
            // -----------------------------------------

            const smellCheck =
                req.body.smellCheck === "on";

            const appearanceCheck =
                req.body.appearanceCheck === "on";

            const packagingCheck =
                req.body.packagingCheck === "on";

            const expiryCheck =
                req.body.expiryCheck === "on";

            const storageCheck =
                req.body.storageCheck === "on";


            // -----------------------------------------
            // CHECK ALL CONDITIONS
            // -----------------------------------------

            const allChecksPassed =
                smellCheck &&
                appearanceCheck &&
                packagingCheck &&
                expiryCheck &&
                storageCheck;


            // -----------------------------------------
            // EXPIRY CHECK
            // -----------------------------------------

            let expired = false;

            if (donation.expiryDate) {

                const expiryDate =
                    new Date(donation.expiryDate);

                if (expiryDate <= new Date()) {

                    expired = true;
                }
            }


            // -----------------------------------------
            // CALCULATE FRESHNESS SCORE
            // -----------------------------------------

            let freshnessScore = 0;


            if (allChecksPassed) {

                freshnessScore = 85;

            } else {

                let passedChecks = 0;

                if (smellCheck) passedChecks++;

                if (appearanceCheck) passedChecks++;

                if (packagingCheck) passedChecks++;

                if (expiryCheck) passedChecks++;

                if (storageCheck) passedChecks++;


                freshnessScore =
                    passedChecks * 15;
            }


            // -----------------------------------------
            // DETERMINE QUALITY STATUS
            // -----------------------------------------

            let qualityStatus = "warning";

            let shelfLife = "4 Hours";


            if (expired) {

                qualityStatus = "unsafe";

                freshnessScore = 0;

                shelfLife = "Expired";

            }

            else if (allChecksPassed) {

                qualityStatus = "safe";

                shelfLife = "8 Hours";

            }

            else if (freshnessScore < 45) {

                qualityStatus = "unsafe";

                shelfLife = "Not Recommended";

            }

            else {

                qualityStatus = "warning";

                shelfLife = "4 Hours";
            }


            // -----------------------------------------
            // UNSAFE FOOD CANNOT BE ACCEPTED
            // -----------------------------------------

            if (qualityStatus === "unsafe") {

                await Donation.findByIdAndUpdate(

                    req.params.donationId,

                    {

                        freshnessScore,

                        qualityStatus,

                        shelfLife,

                        smellCheck,

                        appearanceCheck,

                        packagingCheck,

                        expiryCheck,

                        storageCheck,

                        qualityVerified: true,

                        qualityVerifiedAt: new Date(),

                        status: "rejected"

                    }

                );


                req.flash(
                    "error",
                    "Food failed physical verification and was rejected."
                );


                return res.redirect(
                    "/agent/donations/available"
                );
            }


            // -----------------------------------------
            // ACCEPT + ASSIGN TO CURRENT NGO
            // -----------------------------------------

            const verifiedDonation =
                await Donation.findOneAndUpdate(

                    {
                        _id: req.params.donationId,

                        status: "accepted",

                        $or: [
                            { agent: { $exists: false } },
                            { agent: null }
                        ]
                    },

                    {

                        agent: req.user._id,

                        status: "assigned",

                        freshnessScore,

                        qualityStatus,

                        shelfLife,

                        smellCheck,

                        appearanceCheck,

                        packagingCheck,

                        expiryCheck,

                        storageCheck,

                        qualityVerified: true,

                        qualityVerifiedAt: new Date()

                    },

                    {
                        new: true
                    }
                );


            if (!verifiedDonation) {

                req.flash(
                    "error",
                    "This donation was already accepted by another NGO."
                );

                return res.redirect(
                    "/agent/donations/available"
                );
            }


            req.flash(
                "success",
                "Food verified and donation accepted successfully."
            );


            res.redirect(
                `/agent/collection/view/${verifiedDonation._id}`
            );


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred during verification."
            );

            res.redirect(
                `/agent/donation/verify/${req.params.donationId}`
            );
        }
    }
);



// =====================================================
// ACCEPT DONATION
// =====================================================

router.post(
    "/agent/donation/accept/:donationId",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const donation =
                await Donation.findOne({

                    _id: req.params.donationId,

                    status: "accepted",

                    $or: [
                        { agent: { $exists: false } },
                        { agent: null }
                    ]

                });


            if (!donation) {

                req.flash(
                    "error",
                    "This donation is no longer available."
                );

                return res.redirect(
                    "/agent/donations/available"
                );
            }


            // Instead of directly accepting,
            // open Physical Verification page.
            res.redirect(
                `/agent/donation/verify/${donation._id}`
            );


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred on the server."
            );

            res.redirect(
                "/agent/donations/available"
            );
        }
    }
);



// =====================================================
// REJECT DONATION
// =====================================================

router.post(
    "/agent/donation/reject/:donationId",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const donation =
                await Donation.findOneAndUpdate(

                    {
                        _id: req.params.donationId,

                        status: "accepted",

                        $or: [
                            { agent: { $exists: false } },
                            { agent: null }
                        ]
                    },

                    {
                        status: "rejected"
                    },

                    {
                        new: true
                    }
                );


            if (!donation) {

                req.flash(
                    "error",
                    "This donation is no longer available."
                );

                return res.redirect(
                    "/agent/donations/available"
                );
            }


            req.flash(
                "success",
                "Donation rejected."
            );


            res.redirect(
                "/agent/donations/available"
            );


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred on the server."
            );

            res.redirect(
                "/agent/donations/available"
            );
        }
    }
);



// =====================================================
// PENDING PICKUPS
// =====================================================

router.get(
    "/agent/collections/pending",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const pendingCollections =
                await Donation.find({

                    agent: req.user._id,

                    status: "assigned"

                })
                .populate("donor")
                .sort({ _id: -1 });


            res.render(
                "agent/pendingCollections",
                {
                    title: "Pending Pickups",
                    pendingCollections
                }
            );


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred on the server."
            );

            res.redirect("back");
        }
    }
);



// =====================================================
// COMPLETED PICKUPS
// =====================================================

router.get(
    "/agent/collections/previous",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const previousCollections =
                await Donation.find({

                    agent: req.user._id,

                    status: "collected"

                })
                .populate("donor")
                .sort({ collectionTime: -1 });


            res.render(
                "agent/previousCollections",
                {
                    title: "Completed Pickups",
                    previousCollections
                }
            );


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred on the server."
            );

            res.redirect("back");
        }
    }
);



// =====================================================
// COLLECTION DETAILS
// =====================================================

router.get(
    "/agent/collection/view/:collectionId",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const collection =
                await Donation.findById(
                    req.params.collectionId
                )
                .populate("donor");


            if (!collection) {

                req.flash(
                    "error",
                    "Donation not found."
                );

                return res.redirect(
                    "/agent/dashboard"
                );
            }


            res.render(
                "agent/collection",
                {
                    title: "Collection Details",
                    collection
                }
            );


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred on the server."
            );

            res.redirect("back");
        }
    }
);



// =====================================================
// MARK DONATION AS COLLECTED
// =====================================================

router.get(
    "/agent/collection/collect/:collectionId",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const collection =
                await Donation.findOne({

                    _id: req.params.collectionId,

                    agent: req.user._id,

                    status: "assigned"

                });


            if (!collection) {

                req.flash(
                    "error",
                    "Donation not found or it is not assigned to you."
                );

                return res.redirect(
                    "/agent/collections/pending"
                );
            }


            await Donation.findByIdAndUpdate(

                req.params.collectionId,

                {
                    status: "collected",

                    collectionTime: Date.now()
                }

            );


            req.flash(
                "success",
                "Donation collected successfully."
            );


            res.redirect(
                `/agent/collection/view/${req.params.collectionId}`
            );


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred on the server."
            );

            res.redirect("back");
        }
    }
);



// =====================================================
// NGO PROFILE
// =====================================================

router.get(
    "/agent/profile",
    middleware.ensureNGOLoggedIn,
    (req, res) => {

        res.render(
            "agent/profile",
            {
                title: "My Profile"
            }
        );

    }
);



// =====================================================
// UPDATE NGO PROFILE
// =====================================================

router.put(
    "/agent/profile",
    middleware.ensureNGOLoggedIn,
    async (req, res) => {

        try {

            const id = req.user._id;

            const updateObj = req.body.agent;


            await User.findByIdAndUpdate(

                id,

                updateObj,

                {
                    new: true
                }

            );


            req.flash(
                "success",
                "Profile updated successfully."
            );


            res.redirect(
                "/agent/profile"
            );


        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Some error occurred on the server."
            );

            res.redirect("back");
        }
    }
);



module.exports = router;