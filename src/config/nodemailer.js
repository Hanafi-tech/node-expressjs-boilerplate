const nodemailer = require('nodemailer');
const mailConfig = require('./mailConfig.json')

const transporterDomain = nodemailer.createTransport({
    host: mailConfig.mailConf.host,
    port: mailConfig.mailConf.port, // Ganti dengan port yang diberikan oleh penyedia layanan email Anda
    secure: mailConfig.mailConf.scure, // Ubah menjadi true jika menggunakan SSL
    auth: {
        user: mailConfig.mailConf.user, // Ganti dengan alamat email Anda
        pass: mailConfig.mailConf.pass // Ganti dengan kata sandi email Anda
    }
});

module.exports = {
    transporterDomain,
};