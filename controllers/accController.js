const utilities = require("../utilities/");
const accModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();



/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    let tools = await utilities.getHeader(req);
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
      tools,
    })
};

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    let tools = await utilities.getHeader(req);
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      tools,
    })
}

/* ****************************************
*  Deliver account view
* *************************************** */
async function buildAccountPage(req, res, next) {
    let nav = await utilities.getNav()
    let tools = await utilities.getHeader(req);
    let token = req.cookies.jwt;
    let userId;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send('Invalid token');
      }
      userId = decoded.account_id;
    });
    let userInfo = await accModel.getAccountById(userId);
    let greet = '<h2>Welcome ' + userInfo.account_firstname + '</h2>';
    greet += '<p><a title="Account Management Page" href="/account/update/' + userInfo.account_id + '">Update account information</a></p>';
    if (userInfo.account_type == 'Employee' || userInfo.account_type == 'Admin'){
        greet += '<h3>Manage Inventory</h3>';
        greet += '<p><a title="inventory management page" href="/inv/">Inventory management page</a></p>';
    }
    res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        tools,
        greet,
    })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdatePage(req, res) {
    let nav = await utilities.getNav()
    let tools = await utilities.getHeader(req);
    let token = req.cookies.jwt;
    let userId;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send('Invalid token');
      }
      userId = decoded.account_id;
    });
    let userInfo = await accModel.getAccountById(userId);
    res.render("account/update", {
        title: "Update Account Information",
        nav,
        errors: null,
        tools,
        account_firstname: userInfo.account_firstname,
        account_lastname: userInfo.account_lastname,
        account_email: userInfo.account_email,
        account_id: userInfo.account_id,
      })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    let tools = await utilities.getHeader(req);
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    // Hash the password before storing
    let hashedPassword
    try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        tools,
    })
    }
    
    const regResult = await accModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        tools,
        errors: null,
        account_email,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        tools,
        errors: null,
      })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    let tools = await utilities.getHeader(req);
    const { account_email, account_password } = req.body
    const accountData = await accModel.getAccountByEmail(account_email)
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        tools,
      })
      return
    }
    try {
      if (await bcrypt.compare(account_password, accountData.account_password)) {
        delete accountData.account_password
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
        if(process.env.NODE_ENV === 'development') {
          res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        } else {
          res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }
        return res.redirect("/account/")
      }
      else {
        req.flash("message notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
          title: "Login",
          nav,
          tools,
          errors: null,
          account_email,
        })
      }
    } catch (error) {
      throw new Error('Access Forbidden')
    }
}

async function accountLogout(req, res) {
    try{
        res.clearCookie('jwt');
        res.redirect("/");
        req.flash("notice", "Successfully logged out")
    } catch (err) {
        throw new Error(err)
    }
}


async function updateAccount(req, res) {
    let nav = await utilities.getNav()
    let tools = await utilities.getHeader(req);
    const { account_firstname, account_lastname, account_email, account_id } = req.body;
    
    const updateResult = await accModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id
    )
  
    if (updateResult) {
      req.flash(
        "notice",
        `Congratulations, your account information has been updated.`
      )
      res.redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/update", {
        title: "Update Account Information",
        nav,
        errors: null,
        tools,
        account_firstname,
        account_lastname,
        account_email,
        account_id,
      })
    }
}

async function changePassword(req, res) {
    let nav = await utilities.getNav()
    let tools = await utilities.getHeader(req);
    const { account_firstname, account_lastname, account_email, account_id, account_password } = req.body;

    // Hash the password before storing
    let hashedPassword
    try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing password update.')
    res.status(500).render("account/update", {
        title: "Update Account Information",
        nav,
        errors: null,
        tools,
        account_firstname,
        account_lastname,
        account_email,
        account_id,
    })
    }

    const updateResult = await accModel.changePassword(
      hashedPassword,
      account_id
    )
  
    if (updateResult) {
      req.flash(
        "notice",
        `Congratulations, your password has been updated.`
      )
      res.redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the process failed.")
      res.status(501).render("account/update", {
        title: "Update Account Information",
        nav,
        errors: null,
        tools,
        account_firstname,
        account_lastname,
        account_email,
        account_id,
      })
    }
}



module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountPage, accountLogout, updateAccount, changePassword, buildUpdatePage }