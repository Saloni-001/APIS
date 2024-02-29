const express = require("express");
const router = express.Router();
const { signUp, signIn, signInForToday, signOutForToday, getAttendanceReport, getAdminReport, getUserAttendanceDetails } = require("../controller/auth");
const {  
  isRequestValidated,
  validateSignUpRequest,
  validateSignInRequest,
} = require("../auth");

router.post("/login", validateSignInRequest, isRequestValidated, signIn);
router.post("/signup", validateSignUpRequest, isRequestValidated, signUp);
router.post("/attendance/signin", signInForToday);
router.post("/attendance/signout", signOutForToday);
router.get("/attendance/report", getAttendanceReport);
router.get("/admin/report", getAdminReport);
router.get("/admin/user/:userId/attendance", getUserAttendanceDetails);

module.exports = router;
