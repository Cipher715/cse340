const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inv-validation");


// Route to build inventory by classification view
router.get("/type/:classificationId",utilities.handleErrors(invController.buildByClassificationId));
// Route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));
// Route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement));
// Route to build add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClass));
// Route to build add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInv));
// Route to build management view with table
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));
// Route to build inventory edit view
router.get("/edit/:invId", utilities.handleErrors(invController.editInventoryView))

// Route to post new classification
router.post("/add-classification", 
    invValidate.addClassRules(),
    invValidate.checkClassData,
    utilities.handleErrors(invController.addClass)
);

// Route to post new inventory
router.post("/add-inventory",
    invValidate.addInvRules(),
    invValidate.checkInvData,
    utilities.handleErrors(invController.addInv)
);

// Route ro post update to an inventory
router.post("/update", 
    invValidate.addInvRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);

module.exports = router;