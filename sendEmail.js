require('dotenv').config();
const nodemailer = require('nodemailer');

const config = {
  service: 'qq',
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  secureConnection: true,
  tls: {
    ciphers: 'SSLv3'
  }
};

const transporter = nodemailer.createTransport(config);

module.exports = function nodemail(email) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(email, (error, info) => {
      if (error) {
        console.log('邮件发送失败：', error);
        reject(error);
      } else {
        console.log('邮件发送成功：', info.response);
        resolve(info);
      }
    });
  });
}