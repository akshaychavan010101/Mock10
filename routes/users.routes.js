const express = require("express");
const { User } = require("../models/users.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const sendgrid = require("@sendgrid/mail");
const { Blacklist } = require("../models/blacklist.models");

const UserRouter = express.Router();

UserRouter.post("/register", async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const newUser = new User({ username, name, email, password });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: "akki010102@gmail.com",
      subject: "Verify your email",
      text: "Please verify your email",
      html: `<a href="https://mock10-u35w.onrender.com/verify/${token}">Click here to verify your email</a>`,
    };
    await sendgrid.send(msg);

    res.status(201).json({
      message: "User Registered Successfully, Please check your mail",
      ok: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

UserRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Please register first" });
    }

    if (!user.verified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ message: "User Logged In", token, ok: true });
  } catch (error) {}
});

UserRouter.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const isBlacklisted = await Blacklist.findOne({ token });

    if (isBlacklisted) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(id, { verified: true });

    const newBlacklist = new Blacklist({ token });
    await newBlacklist.save();

    res.redirect(
      "https://celebrated-raindrop-6b2703.netlify.app/index.html"
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

UserRouter.get("/validate/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const isvalid = jwt.verify(token, process.env.JWT_SECRET);

    const id = isvalid.id;

    const user = await User.findById(id);

    if (!isvalid) {
      res.status(400).json({ message: "Invalid Token", ok: false });
    }
    return res.status(200).json({ message: "Valid Token", user, ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { UserRouter };
