const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inv-validation");


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));
// Route to build inventory management view
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));
// Route to build add classification view
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClass));
// Route to build add inventory view
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInv));
// Route to build management view with table
router.get("/getInventory/:classification_id", utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON));
// Route to build inventory edit view
router.get("/edit/:invId", utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView))
// Route to build inventory deletion view
router.get("/delete/:invId", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryView));

// Enhancement. Route to build stock view
router.get("/stock", utilities.handleErrors(invController.buildStock));
// Route to build stock view table
router.get("/stock/:order", utilities.handleErrors(invController.sortInventory));


// Route to post new classification
router.post("/add-classification", 
    utilities.checkAccountType,
    invValidate.addClassRules(),
    invValidate.checkClassData,
    utilities.handleErrors(invController.addClass)
);

// Route to post new inventory
router.post("/add-inventory",
    utilities.checkAccountType,
    invValidate.addInvRules(),
    invValidate.checkInvData,
    utilities.handleErrors(invController.addInv)
);

// Route ro post update to an inventory
router.post("/update", 
    utilities.checkAccountType,
    invValidate.addInvRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);

router.post("/delete", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory));


module.exports = router;