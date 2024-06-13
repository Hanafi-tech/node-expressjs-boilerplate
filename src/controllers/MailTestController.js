const { sendVerificationEmail } = require('@my_module/services/emailService.js');
const mailConfig = require('@/config/mailConfig.json')
const crypto = require('crypto');

const testMailService = async (req, res) => {
    try {
        const { email } = req.body
        const { host, port, scure, user, pass } = mailConfig.mailConf
        const testToken = crypto.randomBytes(32).toString('hex');

        const data = {
            form: user,
            to: email,
            subject: 'Test Mail',
            verificationToken: testToken,
            config: {
                host: host,
                port: port,
                scure: scure,
                user: user,
                pass: pass
            }
        }

        sendVerificationEmail(data);

        res.json({ message: 'Reset password successful. Verification email sent.' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

module.exports = {
    testMailService
};