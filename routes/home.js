const express = require("express");

const router = express.Router();


// =========================
// HOME PAGE
// =========================

router.get("/", (req, res) => {
    res.render("home/welcome", {
        title: "FoodBridge - Home"
    });
});


// =========================
// ABOUT PAGE
// =========================

router.get("/about", (req, res) => {
    res.render("home/aboutUs", {
        title: "About FoodBridge"
    });
});

router.get("/aboutUs", (req, res) => {
    res.render("home/aboutUs", {
        title: "About FoodBridge"
    });
});


// =========================
// HOW IT WORKS
// =========================

router.get("/mission", (req, res) => {
    res.render("home/mission", {
        title: "How It Works"
    });
});

router.get("/how-it-works", (req, res) => {
    res.render("home/mission", {
        title: "How It Works"
    });
});

router.get("/howItWorks", (req, res) => {
    res.render("home/mission", {
        title: "How It Works"
    });
});


// =========================
// CONTACT PAGE
// =========================

router.get("/contact", (req, res) => {
    res.render("home/contactUs", {
        title: "Contact FoodBridge"
    });
});

router.get("/contactUs", (req, res) => {
    res.render("home/contactUs", {
        title: "Contact FoodBridge"
    });
});


// =========================
// WELCOME PAGE
// =========================

router.get("/welcome", (req, res) => {
    res.render("home/welcome", {
        title: "FoodBridge - Home"
    });
});


module.exports = router;