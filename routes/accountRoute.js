const express = require("express");
const router = new express.Router();
const accController = require("../controllers/accController");
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation');


router.get("/login", utilities.handleErrors(accController.buildLogin));
router.get("/register", utilities.handleErrors(accController.buildRegister));
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accController.registerAccount)
);
// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData
);

module.exports = router;