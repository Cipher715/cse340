const utilities = require(".");
const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const validate = {};

validate.addClassRules = () => {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .isAlpha()
            .withMessage("Name must be alphabetic characters only.")
            .custom(async (classification_name) => {
                const classExists = await invModel.checkExistingClass(classification_name)
                if (classExists){
                    throw new Error("The classification already exists. Try another one.")
                }
            }),
    ]
};

validate.addInvRules = () => {
    return [
        body("classification_id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please select classification.")
            .custom(async (classification_id) => {
                const classExists = await invModel.checkClass(classification_id)
                if (!classExists){
                    throw new Error("Selected classification doesn't exist. Please check the database.");
                }
            }),
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Make must be at least 3 characters long."),
        
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Model must be at least 3 characters long."),

        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide some description."),

        body("inv_image")
            .trim()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide image location."),

        body("inv_thumbnail")
            .trim()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide thumbnail image location."),

        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Price must be numeric."),

        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .isLength({ min: 4, max: 4})
            .withMessage("Year must be 4-digit number."),

        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Miles must be numeric."),

        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide color."),
    ]
};

validate.checkClassData = async (req, res, next) => {
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let tools = await utilities.getHeader(req);
      res.render("inventory/add-classification", {
        errors,
        title: "Add New Classification",
        nav,
        tools,
      })
      return
    }
    next()
};

/************************
 * Check if the new inventory data is valid.
************************/
validate.checkInvData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let tools = await utilities.getHeader(req);
      let classificationList = await utilities.buildClassificationList(classification_id);
      res.render("inventory/add-inventory", {
        errors,
        title: "Add New Inventory",
        nav,
        tools,
        classificationList,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
      })
      return
    }
    next()
};

/************************
 * Check if the update data is valid.
************************/
validate.checkUpdateData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let tools = await utilities.getHeader(req);
      let classificationSelect = await utilities.buildClassificationList(classification_id);
      res.render("inventory/edit-inventory", {
        errors,
        title: "Edit " + inv_make + " " + inv_model,
        nav,
        tools,
        classificationSelect,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        inv_id,
      })
      return
    }
    next()
};
  
module.exports = validate