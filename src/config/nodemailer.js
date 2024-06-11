const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-password'
    }
});

const transporterDomain = nodemailer.createTransport({
    host: 'smtp.your-domain.com',
    port: 587, // Ganti dengan port yang diberikan oleh penyedia layanan email Anda
    secure: false, // Ubah menjadi true jika menggunakan SSL
    auth: {
        user: 'your-email@your-domain.com', // Ganti dengan alamat email Anda
        pass: 'your-password' // Ganti dengan kata sandi email Anda
    }
});

module.exports = {
    transporter,
    transporterDomain,
};