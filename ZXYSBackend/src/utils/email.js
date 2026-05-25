// utils/emailUtil.js
const nodemailer = require('nodemailer');

// 生成6位随机验证码
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 创建邮件传输器
const createTransporter = () => {
  return nodemailer.createTransport({
    secure: true,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
    }
  });
};

// 发送验证码邮件
const sendVerificationEmail = async (toEmail, code) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your_email@qq.com',
      to: toEmail,
      subject: '验证码 - 请查收',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">您的验证码</h2>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #1890ff; 
                         letter-spacing: 8px; background: #f5f5f5; 
                         padding: 15px 25px; border-radius: 6px;">
              ${code}
            </span>
          </div>
          <p style="color: #666; text-align: center;">
            此验证码5分钟内有效，请勿泄露给他人
          </p>
        </div>
      `,
      text: `您的验证码是：${code}，5分钟内有效`  // 添加纯文本版本
    };
    
    console.log('📧 邮件配置检查:');
    console.log('  发件人:', mailOptions.from);
    console.log('  收件人:', mailOptions.to);
    console.log('  验证码:', code);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ 邮件发送成功: ${info.messageId}`);
    return true;
    
  } catch (error) {
    console.error('❌ 发送邮件失败:', error.message);
    
    // 更详细的错误信息
    if (error.code === 'EENVELOPE') {
      console.error('   邮箱地址格式错误，请检查发件人/收件人邮箱格式');
    }
    
    throw new Error('发送验证码邮件失败: ' + error.message);
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail
};