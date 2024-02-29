const { StatusCodes } = require("http-status-codes");
const User = require("../models/userModel");
const Attendance = require("../models/reportModel");
const bcrypt = require("bcrypt");
const signUp = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please Provide Required Information",
            });
        }

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "User already registered",
            });
        }

        // Generate a unique username based on the email address
        const username = email.split("@")[0]; // Extract username from email
        const hash_password = await bcrypt.hash(password, 10);

        // Create the new user with unique username and email
        const newUser = await User.create({ email, username, hash_password });

        res.status(StatusCodes.CREATED).json({ message: "User created Successfully", user: newUser });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
};


const signIn = async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter email and password",
            });
        }

        const user = await User.findOne({ email: req.body.email });

        if (user) {
            if (user.authenticate(req.body.password)) {
                const { _id, email, role } = user;
                res.status(StatusCodes.OK).json({
                    user: { _id, email, role },
                });
            } else {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: "Something went wrong!",
                });
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: "User does not exist..!",
            });
        }
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error });
    }
};

const signInForToday = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const userId = user._id; // Retrieve user ID from authenticated request
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date without time
    try {
        // Check if the user has already signed in for today
        const existingAttendance = await Attendance.findOne({
            user: userId,
            date: today,
            signInTime: { $exists: true }, // Check if signInTime exists
        });

        if (existingAttendance) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "You have already signed in for today.",
            });
        }

        // Create a new attendance record for today's date and user ID
        await Attendance.create({ user: userId, date: today, signInTime: new Date() });

        res.status(StatusCodes.OK).json({
            message: "Sign-in recorded for today successfully.",
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error });
    }
};

const signOutForToday = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const userId = user._id;
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date without time
    try {
        // Find the attendance record for today and the current user
        const attendanceRecord = await Attendance.findOne({
            user: userId,
            date: today,
            signInTime: { $exists: true }, // Check if signInTime exists
            signOutTime: { $exists: false }, // Check if signOutTime does not exist
        });

        if (!attendanceRecord) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "You have not signed in for today or have already signed out.",
            });
        }

        // Update the existing attendance record with the sign-out time
        attendanceRecord.signOutTime = new Date();
        await attendanceRecord.save();

        res.status(StatusCodes.OK).json({
            message: "Sign-out recorded for today successfully.",
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error });
    }
};

const getAttendanceReport = async (req, res) => {
    try {
        // Fetch attendance records for the logged-in user
        // const userId = req.user._id; // Assuming user ID is available in the request object after authentication
        const user = await User.findOne({ email: req.body.email });
        const userId = user._id;
        const attendanceReport = await Attendance.find({ user: userId }).exec();

        // Respond with the attendance report data
        res.status(200).json({ success: true, data: attendanceReport });
    } catch (error) {
        console.error("Error fetching attendance report:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const getAdminReport = async (req, res) => {
    try {
        // Fetch all users
        const users = await User.find().exec();

        // Render the Admin Report Page view with the list of users
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

// Controller function to get the attendance details for a specific user
const getUserAttendanceDetails = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch user details
        const user = await User.findById(userId).exec();

        // Fetch attendance details for the user
        const attendanceDetails = await Attendance.find({ user: userId }).exec();

        res.status(200).json({ success: true, data: user, attendanceDetails});
    } catch (error) {
        console.error("Error fetching user attendance details:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

module.exports = { signUp, signIn, signInForToday, signOutForToday, getAttendanceReport, getAdminReport, getUserAttendanceDetails };
