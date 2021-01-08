const express = require("express");
const validator = require("validator");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config.js");
const { cryptPassword } = require("../utils/encryption");
const bcrypt = require("bcrypt");

// outlook.com, hotmail.com, msn.com, live.com
// those emails may not work with sendgrid

// user forgets its password
// user askes to reset it and provides its email address
// user gets link with a token on their email
// user clicks the email link and resets its password
// user's new password get saved on the database with a hash
// user can sign in with a new password

const app = express();

app.post("/forgot", async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ where: { email } });
    if (!email) {
      return res.status(400).send({ error: "Email is required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).send({ error: "Invalid email" });
    }
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const payload = { email };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1h",
    });
    const link = `${req.protocol}://localhost:3000/verify/${token}/?id=${user.user_id}`;
    // for huroku please use ${req.headers.host}  instead of localhost:3000 ;

    await sendEmail(
      email,
      "info.voxbox@gmail.com",
      "Reset Password",
      `  
<!doctype html>
<html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                          <a href="https://voxbox.herokuapp.com/" title="logo" target="_blank">
                            <img width="60" src="https://voxbox.herokuapp.com/static/media/logoVox.0a50ddd3.png" title="logo" alt="logo">
                          </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                    <h1> Hello${user.firstName}
                                        <h2 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                            requested to reset your password</h2>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            We cannot simply send you your old password. A unique link to reset your
                                            password has been generated for you. To reset your password, click the
                                            following link and follow the instructions.
                                        </p>
                                        <a href =${link}
                                            style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                            Password</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>

</html>   
        `
    );
    return res.status(200).send({
      message: "Password reset link has been successfully sent to your inbox",
    });
  } catch (e) {
    return next(new Error(e));
  }
});
const user = {};
app.get("/reset/:token/:id", (req, res) => {
  const id = req.params;
  console.log("id", id);
  User.findOne({
    where: { user_id: id.id },
  })
    .then((data) => {
      Object.assign(user, data);
      console.log(data);
      console.log("user test :", user);
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

app.post("/update_password", (req, res) => {
  const { password, id } = req.body;
  User.findOne({ where: { user_id: id } }).then((user) => {
    //console.log(user);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    bcrypt
      .hash(password, 12)
      .then((hash) => {
        user.password = hash;
        user.save().then((saveduser) => {
          res.send({ message: "password updated success!" });
        });
      })
      .catch((e) => {
        console.log(e);
      });
  });
});
module.exports = app;