require('dotenv').config();
const Users = require('@/database/models/UsersModel.js');
const MailService = require('@/database/models/EmailServicesModel.js');
const { sendVerificationEmail } = require('@my_module/services/emailService.js');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const crypto = require('crypto');

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Users.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const validPassword = await user.validPassword(password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const expiresInSeconds = 60 * 60;
        const token = jwt.sign({
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: expiresInSeconds });

        const refreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTokenExpiresInSeconds = 60 * 60 * 24 * 7; // 7 days

        await user.update({
            refreshToken,
            refreshTokenExpiresAt: moment().tz('Asia/Jakarta').add(refreshTokenExpiresInSeconds, 'seconds').toDate()
        });

        res.json({ _token: token, refreshToken });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const Logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        const user = await Users.findOne({
            where: { refreshToken: refreshToken }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid refresh token' });
        }

        // Invalidate the refresh token
        await user.update({ refreshToken: null, refreshTokenExpiresAt: null });

        res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        const user = await Users.findOne({
            where: { refreshToken: refreshToken }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid refresh token' });
        }

        if (moment().isAfter(user.refreshTokenExpiresAt)) {
            return res.status(401).json({ message: 'Refresh token has expired' });
        }

        const expiresInSeconds = 60 * 60;
        const newToken = jwt.sign({
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: expiresInSeconds });

        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTokenExpiresInSeconds = 60 * 60 * 24 * 7; // 7 days

        await user.update({
            refreshToken: newRefreshToken,
            refreshTokenExpiresAt: moment().tz('Asia/Jakarta').add(refreshTokenExpiresInSeconds, 'seconds').toDate()
        });

        res.json({ _token: newToken, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

const ResetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Temukan pengguna berdasarkan email
        const user = await Users.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }

        // Buat token reset password
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiresInSeconds = 60 * 60; // 1 hour

        // Simpan token reset password ke database
        await user.update({
            resetPasswordToken: resetToken,
            resetPasswordExpiresAt: moment().tz('Asia/Jakarta').add(resetTokenExpiresInSeconds, 'seconds').toDate()
        });

        // Kirim email dengan token reset password
        const mailService = await MailService.findOne();
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`; // URL reset password, sesuaikan dengan frontend Anda
        sendVerificationEmail(email, resetUrl, mailService);

        res.json({ message: 'Reset password successful. Verification email sent.' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

module.exports = {
    Login,
    Logout,
    ResetPassword,
    refreshToken
};