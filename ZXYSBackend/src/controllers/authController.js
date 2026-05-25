const { User, VerificationCode } = require('../models');
const { Op } = require('sequelize')
const { generateVerificationCode, sendVerificationEmail } = require('../utils/email');

// 发送验证码
const sendCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ code: 400, message: '邮箱不能为空' });
    }
    
    // 检查60秒内是否已发送过
    const lastCode = await VerificationCode.findOne({
      where: { email },
      order: [['created_at', 'DESC']]
    });
    
    if (lastCode) {
      const timeDiff = Date.now() - new Date(lastCode.created_at).getTime();
      if (timeDiff < 60000) {
        return res.status(429).json({ code: 429, message: '发送过于频繁，请稍后再试' });
      }
    }
    
    // 生成验证码
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟过期
    
    // 存储到数据库
    await VerificationCode.create({
      email,
      code,
      expires_at: expiresAt,
      used: false
    });
    
    // 发送邮件
    await sendVerificationEmail(email, code);
    
    res.json({ code: 200, message: '验证码已发送' });
    
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ code: 500, message: '发送失败，请稍后重试' });
  }
};

// 注册
const register = async (req, res) => {
  try {
    const { email, username, password, code } = req.body;
    console.log('注册请求:', { email, username, password, code });
    
    // 校验必填字段
    if (!email || !username || !password || !code) {
      return res.status(400).json({ code: 400, message: '请填写完整信息' });
    }
    
    // 检查邮箱是否已注册
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ code: 400, message: '该邮箱已被注册' });
    }
    
    // 校验验证码
    const verificationCode = await VerificationCode.findOne({
      where: {
        email,
        code,
        used: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });
    
    if (!verificationCode) {
        console.log('无效的验证码:', { email, code });
      return res.status(400).json({ code: 400, message: '验证码无效或已过期' });
    }
    
    // 创建用户
    const user = await User.create({
      email,
      username,
      password,
      user_type: null,
      is_initialized: 0
    });
    
    // 标记验证码为已使用
    await verificationCode.update({ used: true });
    
    // 返回用户信息（不返回密码）
    res.json({
      code: 200,
      message: '注册成功',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        is_initialized: user.is_initialized
      }
    });
    
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ code: 500, message: '注册失败，请稍后重试' });
  }
};

// 登录
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ code: 400, message: '请输入邮箱和密码' });
    }
    
    // 查找用户
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ code: 401, message: '邮箱或密码错误' });
    }
    
    // 校验密码（明文比对）
    if (user.password !== password) {
      return res.status(401).json({ code: 401, message: '邮箱或密码错误' });
    }
    // 判断是否今日注册
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const regDate = new Date(user.reg_date);
    regDate.setHours(0, 0, 0, 0);
    
    const isTodayRegistered = regDate.getTime() === today.getTime();
    
    // 返回用户信息
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        user_type: user.user_type,
        is_initialized: user.is_initialized,
        is_today_registered: isTodayRegistered 
      }
    });
    
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ code: 500, message: '登录失败，请稍后重试' });
  }
};

// 用户初始化（设置用户类型并完成初始化）
const initializeUser = async (req, res) => {
  try {
    const { user_id, user_type } = req.body;
    
    if (!user_id || !user_type) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    
    // 验证 user_type 是否有效（2-中医学者，3-中医求职者）
    if (user_type !== 2 && user_type !== 3) {
      return res.status(400).json({ code: 400, message: '无效的用户类型' });
    }
    
    // 查找用户
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    // 更新用户类型和初始化状态
    await user.update({
      user_type: user_type,
      is_initialized: 1
    });
    
    res.json({
      code: 200,
      message: '初始化成功',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        user_type: user.user_type,
        is_initialized: user.is_initialized
      }
    });
  } catch (error) {
    console.error('初始化失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

module.exports = {
  initializeUser,
  sendCode,
  register,
  login
};