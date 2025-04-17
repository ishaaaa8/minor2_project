const express = require("express");
const { loginUser, registerUser } = require("../controllers/authController"); // Ensure these functions exist

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);

module.exports = router;
