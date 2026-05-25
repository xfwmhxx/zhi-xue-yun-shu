const { 
  BookDetail, 
  BookChapter, 
  BookNodeMap,
  ProblemBank,
  UserBookshelf,
  UserChapterProgress,
  UserMastery,
  KnowledgePoint,
  sequelize,
  Op
} = require('../models');

const { recordModulePerformance } = require('../utils/modulePerformanceUtil');

// 获取所有书籍列表
const getBookList = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await BookDetail.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'author', 'type', 'volume', 'tag_count', 'cover_url', 'introduce']
    });
    console.log('查询书籍列表:', { rows, page, limit, count });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        list: rows
      }
    });
  } catch (error) {
    console.error('获取书籍列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取书籍详情
const getBookDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await BookDetail.findByPk(id, {
      attributes: ['id', 'name', 'author', 'type', 'introduce', 'volume', 'tag_count', 'metadata', 'cover_url', 'doc_path']
    });
    
    if (!book) {
      return res.status(404).json({ code: 404, message: '书籍不存在' });
    }
    
    // 解析metadata
    const bookData = book.toJSON();
    if (bookData.metadata) {
      try {
        bookData.metadata = JSON.parse(bookData.metadata);
      } catch (e) {
        bookData.metadata = [];
      }
    } else {
      bookData.metadata = [];
    }
    
    // 获取书籍关联的知识点
    const bookNodes = await BookNodeMap.findAll({
      where: { book_id: id },
      include: [
        {
          model: KnowledgePoint,
          attributes: ['id', 'name', 'type', 'description']
        }
      ]
    });
    
    bookData.knowledge_points = bookNodes.map(item => ({
      id: item.KnowledgePoint.id,
      name: item.KnowledgePoint.name,
      type: item.KnowledgePoint.type,
      description: item.local_desc || item.KnowledgePoint.description
    }));
    
    res.json({
      code: 200,
      message: '获取成功',
      data: bookData
    });
  } catch (error) {
    console.error('获取书籍详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取书籍章节列表
const getBookChapters = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const chapters = await BookChapter.findAll({
      where: { book_id: bookId },
      order: [['sort_order', 'ASC']],
      attributes: ['id', 'chapter_idx', 'chapter_name', 'suggest_time', 'difficulty_star', 'key_points_count']
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: chapters
    });
  } catch (error) {
    console.error('获取章节列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};


// 获取章节详情（含题目）- 使用书籍ID和章节序号
const getChapterDetail = async (req, res) => {
  try {
    const { bookId, chapterIdx } = req.params;
    const userId = req.query.userId;
    
    // 根据书籍ID和章节序号查找章节
    const chapter = await BookChapter.findOne({
      where: { 
        book_id: bookId,
        chapter_idx: chapterIdx
      },
      include: [
        {
          model: BookDetail,
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!chapter) {
      return res.status(404).json({ code: 404, message: '章节不存在' });
    }
    
    // 获取章节题目
    const problems = await ProblemBank.findAll({
      where: { chapter_id: chapter.id },
      order: [['id', 'ASC']]
    });
    
    // 解析题目中的JSON字段
    const processedProblems = problems.map(p => {
      const problem = p.toJSON();
      try {
        if (problem.options) problem.options = JSON.parse(problem.options);
      } catch (e) {
        problem.options = {};
      }
      try {
        if (problem.tags) problem.tags = JSON.parse(problem.tags);
      } catch (e) {
        problem.tags = [];
      }
      return problem;
    });
    
    // 获取用户章节进度
    let userProgress = null;
    if (userId) {
      userProgress = await UserChapterProgress.findOne({
        where: { user_id: userId, chapter_id: chapter.id }
      });
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        chapter: {
          id: chapter.id,
          book_id: chapter.book_id,
          book_name: chapter.BookDetail?.name,
          chapter_idx: chapter.chapter_idx,
          chapter_name: chapter.chapter_name,
          suggest_time: chapter.suggest_time,
          difficulty_star: chapter.difficulty_star,
          key_points_count: chapter.key_points_count
        },
        problems: processedProblems,
        user_progress: userProgress
      }
    });
  } catch (error) {
    console.error('获取章节详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 提交章节测验答案
const submitQuiz = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { user_id, chapter_id, answers } = req.body;
    
    if (!user_id || !chapter_id || !answers) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    
    // 获取章节所有题目
    const problems = await ProblemBank.findAll({
      where: { chapter_id }
    });
    
    // 计算得分和掌握度更新
    let totalScore = 0;
    let earnedScore = 0;
    const masteryUpdates = new Map(); // point_id -> { correct_count, total_count }
    
    for (const problem of problems) {
      totalScore += problem.score;
      const userAnswer = answers[problem.id];
      const isCorrect = userAnswer === problem.answer;
      
      if (isCorrect) {
        earnedScore += problem.score;
      }
      
      // 更新掌握度
      if (problem.related_kp_ids) {
        const pointIds = problem.related_kp_ids.split(',').map(id => parseInt(id.trim()));
        for (const pointId of pointIds) {
          if (!masteryUpdates.has(pointId)) {
            masteryUpdates.set(pointId, { correct_count: 0, total_count: 0 });
          }
          const stats = masteryUpdates.get(pointId);
          stats.total_count++;
          if (isCorrect) stats.correct_count++;
        }
      }
    }
    
    // 更新用户章节进度
    let progress = await UserChapterProgress.findOne({
      where: { user_id, chapter_id },
      transaction
    });
    
    if (!progress) {
      progress = await UserChapterProgress.create({
        user_id,
        chapter_id,
        is_completed: true,
        quiz_score: earnedScore,
        completed_date: new Date()
      }, { transaction });
    } else {
      await progress.update({
        is_completed: true,
        quiz_score: earnedScore,
        completed_date: new Date()
      }, { transaction });
    }
    
    // 批量更新掌握度
    const masteryResults = [];
    for (const [pointId, stats] of masteryUpdates) {
      let mastery = await UserMastery.findOne({
        where: { user_id, point_id: pointId },
        transaction
      });
      
      if (!mastery) {
        mastery = await UserMastery.create({
          user_id,
          point_id: pointId,
          mastery_score: 0,
          error_count: 0
        }, { transaction });
      }
      
      // 根据正确率更新掌握度
      const accuracy = stats.correct_count / stats.total_count;
      let newScore = mastery.mastery_score;
      
      if (accuracy >= 0.8) {
        newScore = Math.min(1.0, newScore + 0.1);
      } else if (accuracy >= 0.6) {
        newScore = Math.min(1.0, newScore + 0.05);
      } else if (accuracy < 0.4) {
        newScore = Math.max(0, newScore - 0.05);
      }
      
      const errorCount = mastery.error_count + (stats.total_count - stats.correct_count);
      
      await mastery.update({
        mastery_score: newScore,
        error_count: errorCount,
        last_update: new Date()
      }, { transaction });
      
      masteryResults.push({
        point_id: pointId,
        mastery_score: newScore,
        improvement: newScore - mastery.mastery_score
      });
    }

    // 记录模块每日表现
    try {
      // 统计答对和答错数量
      let correctCount = 0;
      let errorCount = 0;
      for (const problem of problems) {
        const userAnswer = answers[problem.id];
        if (userAnswer === problem.answer) {
          correctCount++;
        } else {
          errorCount++;
        }
      }
      
      // 收集涉及的知识点ID
      const relatedKpIds = [];
      for (const problem of problems) {
        if (problem.related_kp_ids) {
          const ids = problem.related_kp_ids.split(',').map(id => parseInt(id.trim()));
          relatedKpIds.push(...ids);
        }
      }
      
      // 收集错题涉及的知识点（弱点）
      const weakPoints = [];
      for (const problem of problems) {
        const userAnswer = answers[problem.id];
        if (userAnswer !== problem.answer && problem.related_kp_ids) {
          const ids = problem.related_kp_ids.split(',').map(id => parseInt(id.trim()));
          weakPoints.push(...ids);
        }
      }
      
      await recordModulePerformance({
        userId: user_id,
        moduleType: 'quiz',
        statData: {
          correct: correctCount,
          error: errorCount,
          total_score: earnedScore
        },
        relatedIds: [...new Set(relatedKpIds)],
        reducePoints: [...new Set(weakPoints)]
      });
    } catch (err) {
      console.error('记录模块表现失败:', err);
    }
    
    await transaction.commit();
    
    // 计算百分比得分
    const percentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
    
    res.json({
      code: 200,
      message: '提交成功',
      data: {
        earned_score: earnedScore,
        total_score: totalScore,
        percentage: percentage,
        mastery_updates: masteryResults
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('提交测验失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取用户书架
const getUserBookshelf = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const bookshelf = await UserBookshelf.findAll({
      where: { user_id: userId },
      include: [
        {
          model: BookDetail,
          attributes: ['id', 'name', 'author', 'type', 'cover_url', 'volume']
        }
      ],
      order: [['added_date', 'DESC']]
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: bookshelf.map(item => ({
        id: item.id,
        book_id: item.book_id,
        book: item.BookDetail,
        current_chapter: item.current_chapter,
        progress: item.progress,
        added_date: item.added_date
      }))
    });
  } catch (error) {
    console.error('获取书架失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 添加到书架
const addToBookshelf = async (req, res) => {
  try {
    const { user_id, book_id } = req.body;
    
    if (!user_id || !book_id) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    
    // 检查是否已存在
    const existing = await UserBookshelf.findOne({
      where: { user_id, book_id }
    });
    
    if (existing) {
      return res.status(400).json({ code: 400, message: '书籍已在书架中' });
    }
    
    const bookshelf = await UserBookshelf.create({
      user_id,
      book_id,
      added_date: new Date()
    });
    
    res.json({
      code: 200,
      message: '添加成功',
      data: bookshelf
    });
  } catch (error) {
    console.error('添加到书架失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 更新阅读进度
const updateReadingProgress = async (req, res) => {
  try {
    const { user_id, book_id, chapter_id, progress } = req.body;
    
    const bookshelf = await UserBookshelf.findOne({
      where: { user_id, book_id }
    });
    
    if (!bookshelf) {
      return res.status(404).json({ code: 404, message: '书籍不在书架中' });
    }
    
    await bookshelf.update({
      current_chapter: chapter_id,
      progress: progress
    });
    
    res.json({
      code: 200,
      message: '更新成功',
      data: bookshelf
    });
  } catch (error) {
    console.error('更新阅读进度失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 从书架移除
const removeFromBookshelf = async (req, res) => {
  try {
    const { user_id, book_id } = req.body;
    
    if (!user_id || !book_id) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    
    const bookshelf = await UserBookshelf.findOne({
      where: { user_id, book_id }
    });
    
    if (!bookshelf) {
      return res.status(404).json({ code: 404, message: '书籍不在书架中' });
    }
    
    await bookshelf.destroy();
    
    res.json({
      code: 200,
      message: '移除成功'
    });
  } catch (error) {
    console.error('从书架移除失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

module.exports = {
  getBookList,
  getBookDetail,
  getBookChapters,
  getChapterDetail,
  submitQuiz,
  getUserBookshelf,
  addToBookshelf,
  updateReadingProgress,
  removeFromBookshelf
};