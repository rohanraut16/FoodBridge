const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const passport = require("passport");
const middleware = require("../middleware/index.js");


// ================= SIGNUP =================

router.get("/auth/signup", middleware.ensureNotLoggedIn, (req, res) => {
    res.render("auth/signup", {
        title: "User Signup"
    });
});


router.post("/auth/signup", middleware.ensureNotLoggedIn, async (req, res) => {

    const {
        firstName,
        lastName,
        email,
        password1,
        password2,
        role
    } = req.body;

    // Admin cannot signup from public signup
    if (!["donor", "ngo"].includes(role)) {
    req.flash("error", "Invalid signup role.");
    return res.redirect("/auth/signup");
    }
       
    let errors = [];

    if (!firstName || !lastName || !email || !password1 || !password2) {
        errors.push({
            msg: "Please fill in all the fields"
        });
    }

    if (password1 !== password2) {
        errors.push({
            msg: "Passwords are not matching"
        });
    }

    if (password1.length < 4) {
        errors.push({
            msg: "Password length should be atleast 4 characters"
        });
    }

    if (errors.length > 0) {
        return res.render("auth/signup", {
            title: "User Signup",
            errors,
            firstName,
            lastName,
            email,
            password1,
            password2
        });
    }

    try {

        const user = await User.findOne({
            email: email
        });

        if (user) {

            errors.push({
                msg: "This Email is already registered. Please try another email."
            });

            return res.render("auth/signup", {
                title: "User Signup",
                firstName,
                lastName,
                errors,
                email,
                password1,
                password2
            });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: password1,
            role
        });

        const salt = bcrypt.genSaltSync(10);

        const hash = bcrypt.hashSync(
            newUser.password,
            salt
        );

        newUser.password = hash;

        await newUser.save();

        req.flash(
            "success",
            "You are successfully registered and can log in."
        );

        res.redirect("/auth/login");

    } catch (err) {

        console.log(err);

        req.flash(
            "error",
            "Some error occurred on the server."
        );

        res.redirect("back");
    }
});


// ================= LOGIN PAGE =================

router.get(
    "/auth/login",
    middleware.ensureNotLoggedIn,
    (req, res) => {

        res.render("auth/login", {
            title: "User login"
        });
    }
);


// ================= LOGIN =================

router.post(
    "/auth/login",
    middleware.ensureNotLoggedIn,

    (req, res, next) => {

        console.log("========== LOGIN ATTEMPT ==========");

        console.log("Email:", req.body.email);
        console.log("Role Selected:", req.body.role);

        passport.authenticate(
            "local",
            (err, user, info) => {

                console.log("Passport Error:", err);
                console.log(
                    "User Found:",
                    user ? user.email : "NO USER"
                );
                console.log(
                    "User Role:",
                    user ? user.role : "NO ROLE"
                );
                console.log("Passport Info:", info);

                if (err) {
                    return next(err);
                }

                if (!user) {

                    req.flash(
                        "error",
                        info && info.message
                            ? info.message
                            : "Invalid email or password."
                    );

                    return res.redirect("/auth/login");
                }


                req.logIn(user, (err) => {

                    if (err) {
                        return next(err);
                    }

                    const selectedRole = req.body.role;

                    console.log(
                        "Selected Role:",
                        selectedRole
                    );

                    console.log(
                        "Database Role:",
                        user.role
                    );


                    // Selected role must exactly match DB role
                    if (user.role !== selectedRole) {

                        req.logout(function (logoutErr) {

                            if (logoutErr) {
                                return next(logoutErr);
                            }

                            req.flash(
                                "error",
                                "Selected role does not match this account."
                            );

                            return res.redirect("/auth/login");
                        });

                        return;
                    }


                    // ================= DASHBOARDS =================

                    if (selectedRole === "donor") {

                        return res.redirect(
                            "/donor/dashboard"
                        );
                    }


                    if (selectedRole === "ngo") {

                        return res.redirect(
                            "/agent/dashboard"
                        );
                    }


                    if (selectedRole === "admin") {

                        return res.redirect(
                            "/admin/dashboard"
                        );
                    }


                    return res.redirect("/auth/login");

                });

            }
        )(req, res, next);
    }
);


// ================= LOGOUT =================

router.get(
    "/auth/logout",
    (req, res, next) => {

        req.logout(function (err) {

            if (err) {
                return next(err);
            }

            req.session.destroy(function (err) {

                if (err) {
                    console.log(err);
                }

                res.redirect("/");
            });

        });

    }
);


module.exports = router;