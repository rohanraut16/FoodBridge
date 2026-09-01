const express = require("express");
const router = express.Router();

const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");
const upload = require("../middleware/upload.js");


// ===============================
// DONOR DASHBOARD
// ===============================

router.get(
    "/donor/dashboard",
    middleware.ensureDonorLoggedIn,
    async (req, res) => {

        try {

            const donorId = req.user._id;

            const numPendingDonations =
                await Donation.countDocuments({
                    donor: donorId,
                    status: "pending"
                });

            const numAcceptedDonations =
                await Donation.countDocuments({
                    donor: donorId,
                    status: "accepted"
                });

            const numAssignedDonations =
                await Donation.countDocuments({
                    donor: donorId,
                    status: "assigned"
                });

            const numCollectedDonations =
                await Donation.countDocuments({
                    donor: donorId,
                    status: "collected"
                });

            res.render("donor/dashboard", {
                title: "Dashboard",
                numPendingDonations,
                numAcceptedDonations,
                numAssignedDonations,
                numCollectedDonations
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


// ===============================
// DONATE FOOD PAGE
// ===============================

router.get(
    "/donor/donate",
    middleware.ensureDonorLoggedIn,
    (req, res) => {

        res.render("donor/donate", {
            title: "Donate"
        });

    }
);


// ===============================
// SUBMIT DONATION
// ===============================

router.post(
    "/donor/donate",
    middleware.ensureDonorLoggedIn,
    upload.single("foodImage"),

    async (req, res) => {

        try {

            const donation = req.body.donation;

            // Basic donation information
            donation.status = "pending";
            donation.donor = req.user._id;

            // Save uploaded image path
            if (req.file) {

                donation.foodImage =
                    "/assets/uploads/" + req.file.filename;

            }

            const newDonation =
                new Donation(donation);

            await newDonation.save();

            req.flash(
                "success",
                "Donation request sent successfully"
            );

            res.redirect("/donor/donations/pending");

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


// ===============================
// PENDING / ACTIVE DONATIONS
// ===============================

router.get(
    "/donor/donations/pending",
    middleware.ensureDonorLoggedIn,
    async (req, res) => {

        try {

            const pendingDonations =
                await Donation.find({
                    donor: req.user._id,
                    status: {
                        $in: [
                            "pending",
                            "rejected",
                            "accepted",
                            "assigned"
                        ]
                    }
                }).populate("agent");

            res.render(
                "donor/pendingDonations",
                {
                    title: "Pending Donations",
                    pendingDonations
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


// ===============================
// PREVIOUS / COMPLETED DONATIONS
// ===============================

router.get(
    "/donor/donations/previous",
    middleware.ensureDonorLoggedIn,
    async (req, res) => {

        try {

            const previousDonations =
                await Donation.find({
                    donor: req.user._id,
                    status: "collected"
                }).populate("agent");

            res.render(
                "donor/previousDonations",
                {
                    title: "Previous Donations",
                    previousDonations
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


// ===============================
// DELETE REJECTED DONATION
// ===============================

router.get(
    "/donor/donation/deleteRejected/:donationId",
    middleware.ensureDonorLoggedIn,
    async (req, res) => {

        try {

            const donationId =
                req.params.donationId;

            await Donation.findByIdAndDelete(
                donationId
            );

            res.redirect(
                "/donor/donations/pending"
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


// ===============================
// DONOR PROFILE
// ===============================

router.get(
    "/donor/profile",
    middleware.ensureDonorLoggedIn,
    (req, res) => {

        res.render("donor/profile", {
            title: "My Profile"
        });

    }
);


// ===============================
// UPDATE DONOR PROFILE
// ===============================

router.put(
    "/donor/profile",
    middleware.ensureDonorLoggedIn,
    async (req, res) => {

        try {

            const id = req.user._id;

            const updateObj =
                req.body.donor;

            await User.findByIdAndUpdate(
                id,
                updateObj
            );

            req.flash(
                "success",
                "Profile updated successfully"
            );

            res.redirect("/donor/profile");

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