const middleware = {
    ensureLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }

        req.flash("warning", "Please log in first to continue");
        res.redirect("/auth/login");
    },

    // =========================
    // ADMIN
    // =========================
    ensureAdminLoggedIn: (req, res, next) => {
        if (req.isUnauthenticated()) {
            req.session.returnTo = req.originalUrl;
            req.flash("warning", "Please log in first to continue");
            return res.redirect("/auth/login");
        }

        if (req.user.role !== "admin") {
            req.flash("warning", "This route is allowed for admin only!!");
            return res.redirect("back");
        }

        next();
    },

    // =========================
    // DONOR
    // =========================
    ensureDonorLoggedIn: (req, res, next) => {
        if (req.isUnauthenticated()) {
            req.session.returnTo = req.originalUrl;
            req.flash("warning", "Please log in first to continue");
            return res.redirect("/auth/login");
        }

        if (req.user.role !== "donor") {
            req.flash("warning", "This route is allowed for donor only!!");
            return res.redirect("back");
        }

        next();
    },

    // =========================
    // NGO
    // =========================
    ensureNGOLoggedIn: (req, res, next) => {
        if (req.isUnauthenticated()) {
            req.session.returnTo = req.originalUrl;
            req.flash("warning", "Please log in first to continue");
            return res.redirect("/auth/login");
        }

        if (req.user.role !== "ngo") {
            req.flash("warning", "This route is allowed for NGO only!!");
            return res.redirect("/auth/login");
        }

        next();
    },

    // =========================
    // NOT LOGGED IN
    // =========================
    ensureNotLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()) {
            req.flash("warning", "Please logout first to continue");

            if (req.user.role === "admin") {
                return res.redirect("/admin/dashboard");
            }

            if (req.user.role === "donor") {
                return res.redirect("/donor/dashboard");
            }

            if (req.user.role === "ngo") {
                return res.redirect("/agent/dashboard");
            }
        }

        next();
    }
};

module.exports = middleware;