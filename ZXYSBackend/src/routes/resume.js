const express = require('express');
const router = express.Router();
const { UserResume } = require('../models');

// 默认简历模板
const getDefaultResume = () => {
  return {
    name: '',
    motto: '勤求古训，博采众方',
    contact: {
      email: '',
      phone: '',
      location: ''
    },
    sections: [
      {
        title: '核心技能',
        layout: 'list',
        items: ['', '', '', '']
      },
      {
        title: '教育背景',
        layout: 'timeline',
        items: [
          {
            main: '',
            sub: '',
            date: '',
            desc: ''
          }
        ]
      },
      {
        title: '研习经历',
        layout: 'timeline',
        items: [
          {
            main: '',
            sub: '',
            date: '',
            desc: ''
          }
        ]
      }
    ]
  };
};

// 获取用户简历
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // 验证 userId
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ 
      code: 400, 
      message: '无效的用户ID' 
    });
  }
  
  try {
    let resume = await UserResume.findOne({ 
      where: { user_id: parseInt(userId) } 
    });
    
    if (!resume) {
      // 不存在则创建默认简历
      const defaultData = getDefaultResume();
      resume = await UserResume.create({
        user_id: parseInt(userId),
        resume_data: JSON.stringify(defaultData)
      });
      
      return res.json({
        code: 200,
        message: '获取成功',
        data: defaultData
      });
    }
    
    // 解析 JSON 数据返回
    let resumeData;
    try {
      resumeData = JSON.parse(resume.resume_data);
    } catch (e) {
      resumeData = getDefaultResume();
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: resumeData
    });
  } catch (error) {
    console.error('获取简历失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取简历失败' 
    });
  }
});

// 更新用户简历
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const resumeData = req.body;
  
  // 验证 userId
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ 
      code: 400, 
      message: '无效的用户ID' 
    });
  }
  
  // 验证数据
  if (!resumeData || typeof resumeData !== 'object') {
    return res.status(400).json({ 
      code: 400, 
      message: '无效的简历数据' 
    });
  }
  
  try {
    // 查找是否存在
    const existingResume = await UserResume.findOne({ 
      where: { user_id: parseInt(userId) } 
    });
    
    if (existingResume) {
      // 更新
      await existingResume.update({
        resume_data: JSON.stringify(resumeData),
        updated_at: new Date()
      });
      
      res.json({
        code: 200,
        message: '更新成功',
        data: resumeData
      });
    } else {
      // 创建
      await UserResume.create({
        user_id: parseInt(userId),
        resume_data: JSON.stringify(resumeData)
      });
      
      res.json({
        code: 200,
        message: '创建成功',
        data: resumeData
      });
    }
  } catch (error) {
    console.error('更新简历失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '更新简历失败' 
    });
  }
});

module.exports = router;