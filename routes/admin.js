const express = require("express");
const router = express.Router();

const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
  "/admin/dashboard",
  middleware.ensureAdminLoggedIn,
  async (req, res) => {
    try {
      const totalDonations = await Donation.countDocuments();

      const totalDonors = await User.countDocuments({
        role: "donor",
      });

      
      const totalNGOs = await User.countDocuments({
        role: "ngo",
      });

      const pendingApprovals = await Donation.countDocuments({
        status: "pending",
      });

      const rejectedDonations = await Donation.countDocuments({
        status: "rejected",
      });

      const successfulDeliveries = await Donation.countDocuments({
        status: "collected",
      });

      const activeDonations = await Donation.countDocuments({
        status: {
          $in: ["accepted", "assigned"],
        },
      });

      // Recent donations
      const recentDonations = await Donation.find()
        .populate("donor")
        .sort({ _id: -1 })
        .limit(5);

      // Recent rejected donations
      const recentRejectedDonations = await Donation.find({
        status: "rejected",
      })
        .populate("donor")
        .sort({ _id: -1 })
        .limit(5);

      res.render("admin/dashboard", {
        title: "Admin Dashboard",

        totalDonations,
        totalDonors,
        totalNGOs,
        pendingApprovals,
        rejectedDonations,
        successfulDeliveries,
        activeDonations,

        recentDonations,
        recentRejectedDonations,
      });
    } catch (err) {
      console.log(err);

      req.flash("error", "Some error occurred on the server.");

      res.redirect("back");
    }
  },
);

// =====================================================
// PENDING DONATION APPROVALS
// =====================================================

router.get(
  "/admin/donations/pending",
  middleware.ensureAdminLoggedIn,
  async (req, res) => {
    try {
      const pendingDonations = await Donation.find({
        status: "pending",
      })
        .populate("donor")
        .sort({ _id: -1 });

      res.render("admin/pendingDonations", {
        title: "Pending Approvals",
        pendingDonations,
      });
    } catch (err) {
      console.log(err);

      req.flash("error", "Some error occurred on the server.");

      res.redirect("back");
    }
  },
);

// =====================================================
// ALL / PREVIOUS DONATIONS
// =====================================================

router.get(
  "/admin/donations/previous",
  middleware.ensureAdminLoggedIn,
  async (req, res) => {
    try {
      const previousDonations = await Donation.find({
        status: {
          $in: ["accepted", "assigned", "collected", "rejected"],
        },
      })
        .populate("donor")
        .populate("agent")
        .sort({ _id: -1 });

      res.render("admin/previousDonations", {
        title: "Donation Management",
        previousDonations,
      });
    } catch (err) {
      console.log(err);

      req.flash("error", "Some error occurred on the server.");

      res.redirect("back");
    }
  },
);

// =====================================================
// DONATION DETAILS
// =====================================================

router.get(
  "/admin/donation/view/:donationId",
  middleware.ensureAdminLoggedIn,
  async (req, res) => {
    try {
      const donation = await Donation.findById(req.params.donationId)
        .populate("donor")
        .populate("agent");

      if (!donation) {
        req.flash("error", "Donation not found.");

        return res.redirect("/admin/donations/pending");
      }

      res.render("admin/donation", {
        title: "Donation Details",
        donation,
      });
    } catch (err) {
      console.log(err);

      req.flash("error", "Some error occurred on the server.");

      res.redirect("back");
    }
  },
);

// =====================================================
// APPROVE DONATION
// =====================================================

router.get(
  "/admin/donation/accept/:donationId",
  middleware.ensureAdminLoggedIn,
  async (req, res) => {
    try {
      const donation = await Donation.findById(req.params.donationId);

      if (!donation) {
        req.flash("error", "Donation not found.");

        return res.redirect("/admin/donations/pending");
      }

      await Donation.findByIdAndUpdate(req.params.donationId, {
        status: "accepted",
      });

      req.flash("success", "Donation approved and made available to NGOs.");

      res.redirect(`/admin/donation/view/${req.params.donationId}`);
    } catch (err) {
      console.log(err);

      req.flash("error", "Some error occurred on the server.");

      res.redirect("back");
    }
  },
);

// =====================================================
// REJECT DONATION
// =====================================================

router.get(
  "/admin/donation/reject/:donationId",
  middleware.ensureAdminLoggedIn,
  async (req, res) => {
    try {
      const donation = await Donation.findById(req.params.donationId);

      if (!donation) {
        req.flash("error", "Donation not found.");

        return res.redirect("/admin/donations/pending");
      }

      await Donation.findByIdAndUpdate(req.params.donationId, {
        status: "rejected",
      });

      req.flash("success", "Donation rejected successfully.");

      res.redirect(`/admin/donation/view/${req.params.donationId}`);
    } catch (err) {
      console.log(err);

      req.flash("error", "Some error occurred on the server.");

      res.redirect("back");
    }
  },
);

// =====================================================
// MANAGE NGOs
// =====================================================


router.get(
  "/admin/agents",
  middleware.ensureAdminLoggedIn,
  async (req, res) => {
    try {
      const ngos = await User.find({
        role: "ngo",
      });

      res.render("admin/agents", {
        title: "Manage NGOs",
        ngos,
      });
    } catch (err) {
      console.log(err);

      req.flash("error", "Some error occurred on the server.");

      res.redirect("back");
    }
  },
);

// =====================================================
// ADMIN PROFILE
// =====================================================

router.get("/admin/profile", middleware.ensureAdminLoggedIn, (req, res) => {
  res.render("admin/profile", {
    title: "My Profile",
  });
});

// =====================================================
// UPDATE ADMIN PROFILE
// =====================================================

// =====================================================
// UPDATE ADMIN PROFILE
// =====================================================

router.put(
  "/admin/profile",
  middleware.ensureAdminLoggedIn,
  async (req, res) => {
    try {

      console.log("===== ADMIN PROFILE UPDATE =====");
      console.log("Logged in admin ID:", req.user._id);
      console.log("Received data:", req.body.admin);

      const admin = await User.findById(req.user._id);

      if (!admin) {
        console.log("Admin not found");

        req.flash("error", "Admin profile not found.");
        return res.redirect("/admin/profile");
      }

      const data = req.body.admin;

      // Update fields
      admin.firstName = data.firstName;
      admin.lastName = data.lastName;
      admin.gender = data.gender;
      admin.address = data.address;

      if (data.phone) {
        admin.phone = Number(data.phone);
      } else {
        admin.phone = undefined;
      }

      // Save to MongoDB
      const savedAdmin = await admin.save();

      console.log("Updated admin:");
      console.log(savedAdmin);

      req.flash("success", "Profile updated successfully.");

      return res.redirect("/admin/profile");

    } catch (err) {

      console.log("PROFILE UPDATE ERROR:", err);

      req.flash("error", "Profile update failed.");

      return res.redirect("/admin/profile");
    }
  }
);

module.exports = router;
