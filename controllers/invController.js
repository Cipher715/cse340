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
  let tools = await utilities.getHeader(req);
  const className = data[0].classification_name
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    tools,
    grid,
  })
};

/* ***************************
 *  Build inventory details view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getVehicleByInvId(inv_id)
  const detail = await utilities.buildVehicleDetail(data[0])
  let nav = await utilities.getNav()
  let tools = await utilities.getHeader(req);
  const year = data[0].inv_year
  const make = data[0].inv_make
  const model = data[0].inv_model

  res.render("inventory/detail", {
    title: year + ' ' + make +  ' ' + model,
    nav,
    tools,
    detail,
  })
};

/* ***************************
 *  Build inv/management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  let tools = await utilities.getHeader(req);
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    tools,
    classificationSelect,
  })
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClass = async function (req, res, next) {
  let nav = await utilities.getNav()
  let tools = await utilities.getHeader(req);
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    tools,
    errors: null,
  })
};

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInv = async function (req, res, next) {
  let nav = await utilities.getNav()
  let tools = await utilities.getHeader(req);
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    tools,
    errors: null,
    classificationList,
  })
};

/* ***************************
 *  Build stock view
 * ************************** */
invCont.buildStock = async function (req, res, next) {
  let nav = await utilities.getNav()
  let tools = await utilities.getHeader(req);
  let sortList = await utilities.buildSortList();
  res.render("inventory/stock", {
    title: "Our Stock",
    nav,
    tools,
    errors: null,
    sortList,
  })
};


/* ***************************
 *  Insert new classification and examine
 * ************************** */
invCont.addClass = async function (req, res) {
  const { classification_name } = req.body;

  const addResult = await invModel.addClass(classification_name);
  let nav = await utilities.getNav()
  let tools = await utilities.getHeader(req);
  if (addResult) {
    req.flash(
      "notice",
      `Successfully added new classification ${classification_name}.`
    )
    res.status(201).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      tools,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the process is failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      tools,
      errors: null,
    })
  }
} 

/* ***************************
 *  Insert new inventory and examine
 * ************************** */
invCont.addInv = async function (req, res) {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body

  const addResult = await invModel.addInv(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);
  let nav = await utilities.getNav()
  let tools = await utilities.getHeader(req);
  if (addResult) {
    req.flash(
      "notice",
      `Successfully added new inventory.`
    )
    res.status(201).render("inventory/management", {
      title: "Management",
      nav,
      tools,
    })
  } else {
    let classificationList = await utilities.buildClassificationList(classification_id);
    req.flash("notice", "Sorry, the process is failed.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      tools,
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

/* ***************************
 *  Update inventory and examine
 * ************************** */
invCont.updateInventory = async function (req, res) {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id } = req.body

  const updateResult = await invModel.updateInventory(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);
  let nav = await utilities.getNav()
  let tools = await utilities.getHeader(req);
  if (updateResult) {
    const itemName = updateResult[0].inv_make + " " + updateResult[0].inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    let classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the process is failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      tools,
      errors: null,
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
  }
}

/* ***************************
 *  Delete inventory
 * ************************** */
invCont.deleteInventory = async function (req, res) {
  const { inv_make, inv_model, inv_price, inv_year, inv_id } = req.body

  const deleteResult = await invModel.deleteInventory(inv_id);
  let nav = await utilities.getNav()
  let tools = await utilities.getHeader(req);
  if (deleteResult) {
    const itemName = inv_make + " " + inv_model;
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the process is failed.")
    res.status(501).render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      tools,
      errors: null,
      inv_make,
      inv_model,
      inv_price,
      inv_year,
      inv_id,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Return Sorted Inventory As JSON
 * ************************** */
invCont.sortInventory = async (req, res, next) => {
  const order = req.params.order
  const invData = await invModel.sortInventory(order)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build inventory edit view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  let tools = await utilities.getHeader(req);
  const data = await invModel.getVehicleByInvId(inv_id)
  const itemData = data[0]
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    tools,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Build inventory deletion view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  let tools = await utilities.getHeader(req);
  const data = await invModel.getVehicleByInvId(inv_id)
  const itemData = data[0]
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    tools,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

module.exports = invCont;