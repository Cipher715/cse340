const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
};

invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getVehicleByInvId(inv_id)
  const detail = await utilities.buildVehicleDetail(data[0])
  let nav = await utilities.getNav()
  const year = data[0].inv_year
  const make = data[0].inv_make
  const model = data[0].inv_model

  res.render("./inventory/detail", {
    title: year + ' ' + make +  ' ' + model,
    nav,
    detail,
  })
};

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
  })
};


invCont.buildAddClass = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
};

invCont.buildAddInv = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    errors: null,
    classificationList,
  })
};

invCont.addClass = async function (req, res) {
  const { classification_name } = req.body;

  const addResult = await invModel.addClass(classification_name);
  let nav = await utilities.getNav();
  if (addResult) {
    req.flash(
      "notice",
      `Successfully added new classification ${classification_name}.`
    )
    res.status(201).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the process is failed.")
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }
} 

invCont.addInv = async function (req, res) {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body

  const addResult = await invModel.addInv(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);
  let nav = await utilities.getNav();
  if (addResult) {
    req.flash(
      "notice",
      `Successfully added new inventory.`
    )
    res.status(201).render("./inventory/management", {
      title: "Management",
      nav,
    })
  } else {
    let classificationList = await utilities.buildClassificationList(classification_id);
    req.flash("notice", "Sorry, the process is failed.")
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      errors: null,
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
  }
} 



module.exports = invCont;