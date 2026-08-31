const express = require("express");
const router = express.Router();

// =========================
// HOME PAGE
// =========================
router.get("/", (req, res) => {
    res.render("home/welcome");
});

// =========================
// ABOUT PAGE
// =========================
router.get("/about", (req, res) => {
    res.render("home/aboutUs");
});

// Also support /aboutUs
router.get("/aboutUs", (req, res) => {
    res.render("home/aboutUs");
});

// =========================
// HOW IT WORKS / MISSION
// =========================
router.get("/mission", (req, res) => {
    res.render("home/mission");
});

// Also support /how-it-works
router.get("/how-it-works", (req, res) => {
    res.render("home/mission");
});

// Also support /howItWorks
router.get("/howItWorks", (req, res) => {
    res.render("home/mission");
});

// =========================
// CONTACT PAGE
// =========================
router.get("/contact", (req, res) => {
    res.render("home/contactUs");
});

// Also support /contactUs
router.get("/contactUs", (req, res) => {
    res.render("home/contactUs");
});

// =========================
// WELCOME PAGE
// =========================
router.get("/welcome", (req, res) => {
    res.render("home/welcome");
});

module.exports = router;