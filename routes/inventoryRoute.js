const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inv-validation");


// Route to build inventory by classification view
router.get("/type/:classificationId",utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));
router.get("/", utilities.handleErrors(invController.buildManagement));
router.get("/add-classification", utilities.handleErrors(invController.buildAddClass));
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInv));

router.post("/add-classification", 
    invValidate.addClassRules(),
    invValidate.checkClassData,
    utilities.handleErrors(invController.addClass)
);

router.post("/add-inventory",
    invValidate.addInvRules(),
    invValidate.checkInvData,
    utilities.handleErrors(invController.addInv)
);


module.exports = router;