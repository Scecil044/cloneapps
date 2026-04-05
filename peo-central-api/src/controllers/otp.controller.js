const { ObjectId } = require("mongodb");

const { Otp } = require('../models');
const { otpService } = require('../services');

const sendOtp = async (req, res) => {
    try {
        const otp = otpService.GenerateOtp();
        const body = req.body;
        const otpToBeSaved = {
            otp: otp,
            date: moment(),
            is_verified: false,
            // project: ObjectId(body.project),

        };
        const created_otp = await Otp.create(otpToBeSaved)
        console.log(created_otp)
        return res.status(200).json({ message: "OTP sent", _id: created_otp._id })
    } catch (error) {
        res.status(500).json({ message: "Server side error" })
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { id } = req.params;
        const otp = req.body.otp;
        const findExistingOtp = await Otp.findOne({ _id: ObjectId(id) });
        if (!findExistingOtp) {
            return res.status(404).json({ status: 404, message: "OTP Validation filed!" });
        }
        const nowTime = moment();
        const timeSpan = nowTime.diff(findExistingOtp.date, 'days');

        if (timeSpan > 7) {
            return res.status(403).json({ status: 403, message: "OTP has expired" });
        }
        else if (findExistingOtp.is_verified) {
            return res.status(409).json({ status: 409, message: "OTP has been used already" });
        } else if (findExistingOtp.otp != otp) {
            return res.status(403).json({ status: 403, message: "Wrong otp" });
        }
        else {
            const updated = await Otp.findOneAndUpdate({ _id: ObjectId(id) }, {
                $set: {
                    is_verified: true,
                    verified_date: nowTime,
                    expiry: nowTime
                }
            });
            return res.status(200).json({ status: 200, message: "The OTP has been sent. Check your email." });
        }
    } catch (error) {
        res.status(500).json({ message: "Server side error" });
    }
}


const resendOtp = async (req, res) => {
    try {
        const { id } = req.params;
        const findExistingOtp = await Otp.findOne({ _id: ObjectId(id) }); s

        if (!findExistingOtp) {
            return res.status(404).json({ message: "Not found" });
        }

        const nowTime = moment();
        const timeSpan = nowTime.diff(findExistingOtp.date, 'minutes');

        if (timeSpan < 10) {
            return res.status(409).json({ message: "Please wait for 10 minutes before resending OTP" });
        } else {
            const newOtp = otpService.GenerateOtp(0, 1000000000);
            const updated = await Otp.findOneAndUpdate({ _id: ObjectId(id) }, {
                $set: {
                    otp: newOtp,
                    date: nowTime,
                    is_verified: false,
                }
            });
            return res.status(200).json({ message: "A new OTP has been sent.", _id: updated._id });
        }
    } catch (error) {
        res.status(500).json({ message: "Server side error" });
    }
}


module.exports = {
    sendOtp,
    verifyOtp,
    resendOtp
}