const express = require("express");
const router = new express.Router();
const accController = require("../controllers/accController");
const utilities = require("../utilities/");
const accValidate = require('../utilities/account-validation');


router.get("/login", utilities.handleErrors(accController.buildLogin));
router.get("/register", utilities.handleErrors(accController.buildRegister));
router.get("/", utilities.checkLogin, utilities.handleErrors(accController.buildAccountPage));
router.get("/logout", utilities.checkLogin, utilities.handleErrors(accController.accountLogout));
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accController.buildUpdatePage));



// Process the registration data
router.post(
    "/register",
    accValidate.registationRules(),
    accValidate.checkRegData,
    utilities.handleErrors(accController.registerAccount)
);
// Process the login request
router.post("/login",
    accValidate.loginRules(),
    accValidate.checkLoginData,
    utilities.handleErrors(accController.accountLogin)
);
// Process the update user information request
router.post("/update",
    accValidate.accountUpdateRules(),
    accValidate.checkUpdateData,
    utilities.handleErrors(accController.updateAccount)
);
// Process the change password request
router.post("/update-password",
    accValidate.passwordUpdateRules(),
    accValidate.checkNewPassword,
    utilities.handleErrors(accController.changePassword)
);

module.exports = router;