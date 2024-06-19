require('dotenv').config();
const Users = require('@/database/models/UsersModel.js');
const MailService = require('@/database/models/EmailServicesModel.js');
const ResetPasswordUser = require('@/database/models/ResetPasswordModel.js');
const { sendVerificationEmail } = require('@my_module/services/emailService.js');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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
        // const expiresInSeconds = 60 * 5;
        const token = jwt.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: expiresInSeconds });

        const refreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTokenExpiresInSeconds = 60 * 60 * 24 * 7; // 7 days

        // Format the date to a string
        const refreshTokenExpiresAt = moment().tz('Asia/Jakarta').add(refreshTokenExpiresInSeconds, 'seconds').format('YYYY-MM-DD HH:mm:ss');

        await user.update({
            refreshToken,
            refreshTokenExpiresAt
        });

        res.json({ _token: token, refreshToken, role: user.role, expires: refreshTokenExpiresAt });
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

        const expiresInSeconds = 60 * 60; // 1 hour
        const newToken = jwt.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: expiresInSeconds });

        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTokenExpiresInSeconds = 60 * 60 * 24 * 7; // 7 days
        const refreshTokenExpiresAt = moment().tz('Asia/Jakarta').add(refreshTokenExpiresInSeconds, 'seconds').toISOString();

        await user.update({
            refreshToken: newRefreshToken,
            refreshTokenExpiresAt: refreshTokenExpiresAt
        });

        res.json({ _token: newToken, refreshToken: newRefreshToken, role: user.role, expires: refreshTokenExpiresAt });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

const ResetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email canot be empty' });
        }

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
        await ResetPasswordUser.create({
            to: email,
            token: resetToken,
            expireAt: moment().tz('Asia/Jakarta').add(resetTokenExpiresInSeconds, 'seconds').toDate()
        });

        // Kirim email dengan token reset password
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`; // URL reset password, sesuaikan dengan frontend Anda

        const mailService = await MailService.findOne();
        if (!mailService) {
            return res.status(404).json({ msg: "Mail service not found" });
        }

        const data = {
            form: mailService.user,
            to: email,
            subject: 'Test Mail',
            verificationToken: resetUrl,
            config: {
                host: mailService.host,
                port: mailService.port,
                scure: mailService.scure,
                user: mailService.user,
                pass: mailService.pass
            }
        }

        sendVerificationEmail(data);

        res.json({ message: 'Reset password successful. Verification email sent.' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

const verifResetPassword = async (req, res) => {
    try {
        const { token } = req.body;

        const resetPassword = await ResetPasswordUser.findOne({
            where: { token: token }
        });

        if (!resetPassword) {
            return res.status(400).json({ message: 'Invalid or expired reset password token' });
        }

        const currentTime = moment().tz('Asia/Jakarta');
        const tokenExpirationTime = moment(resetPassword.expiresAt);
        if (currentTime.isAfter(tokenExpirationTime)) {
            await resetPassword.destroy();
            return res.status(400).json({ message: 'Reset password token has expired' });
        }

        const user = await Users.findOne({
            where: { email: resetPassword.to }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newPassword = '12345';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();
        await resetPassword.destroy();
        res.json({ message: 'Valid reset password token' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

module.exports = {
    Login,
    Logout,
    refreshToken,
    ResetPassword,
    verifResetPassword
};