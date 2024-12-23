const { user } = require("pg/lib/defaults");
const invModel = require("../models/inventory-model");
const accModel = require("../models/account-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" ></a>'
        grid += '<div class="namePrice">'
        grid += '<hr>'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
};

/* **************************************
* Build the detail view HTML
* ************************************ */
Util.buildVehicleDetail = async function(data) {
  let detail
  if(data){
    detail ='<div id="vehicle-detail">'
    detail += '<img src="' + data.inv_image + '" alt="Image of '
    + data.inv_make + ' ' + data.inv_model 
    +' on CSE Motors" >'
    detail += '<div id="vehicle-desc"> <h2>' + data.inv_make + ' ' + data.inv_model + ' Details </h2>'
    detail += '<p><b>Price: $</b>' + new Intl.NumberFormat('en-US').format(data.inv_price) + '</p>'
    detail += '<p><b>Description: </b>' + data.inv_description + '</p>'
    detail += '<p><b>Color: </b>' + data.inv_color + '</p>'
    detail += '<p><b>Miles: </b>' + new Intl.NumberFormat('en-US').format(data.inv_miles) + '</p>'
    detail += '</div></div>'
  } else { 
    detail += '<p class="notice">Sorry, the vehicle is currently not available.</p>'
  }
  return detail
};


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    list += '<li><a href="/inv/stock/" title="Stock Page">Stock</a></li>';
    data.rows.forEach((row) => {
        list += "<li>";
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>";
        list += "</li>";
    });
    list += "</ul>";
    return list;
};

Util.getHeader = async function (req, res, next) {
  let tools = '<a '
  if (req.cookies.jwt) {
    let token = req.cookies.jwt;
    let userId;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send('Invalid token');
      }
      userId = decoded.account_id;
    });
    let userInfo = await accModel.getAccountById(userId);
    tools += 'title="go to account page" href="/account">Welcome ' + userInfo.account_firstname + '</a>'
    tools += '<a title="Click to log out" href="/account/logout">LogOut</a>'
  } else {
    tools += 'title="Click to log in" href="/account/login">My Account</a>'
  }
  return tools
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
};


Util.buildSortList = async function () {
  let sortList = '<select name="inv_sort" id="inv_sort">'
  sortList += "<option value=''>Choose a Sort</option>"
  + "<option value='inv_price-ASC'>Price: Low to High</option>"
  + "<option value='inv_price-DESC'>Price: High to Low</option>"
  + "<option value='inv_miles-ASC'>Miles: Low to High</option>"
  + "<option value='inv_miles-DESC'>Miles: High to Low</option>"
  + "<option value='inv_year-DESC'>Build Year: Recent to Old</option>"
  + "<option value='inv_year-ASC'>Build Year: Old to Recent</option>"
  + "</select>";

  return sortList;
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = true
     next()
    })
  } else {
   next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

Util.checkAccountType = (req, res, next) => {
  if (req.cookies.jwt) {
    let token = req.cookies.jwt;
    let userInfo;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send('Invalid token');
      }
      userInfo = decoded;
    });
    if (userInfo.account_type == 'Employee' || userInfo.account_type == 'Admin'){
      next();
    } else {
      req.flash("notice", "Access denied. Please log in.")
      return res.redirect("/account/login")
    }
  } else {
    req.flash("notice", "Access denied. Please log in.")
    return res.redirect("/account/login")
  }
}

module.exports = Util;