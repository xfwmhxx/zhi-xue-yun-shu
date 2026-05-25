const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// 书籍列表
router.get('/books', bookController.getBookList);

// 书籍详情
router.get('/books/:id', bookController.getBookDetail);

// 书籍章节列表
router.get('/books/:bookId/chapters', bookController.getBookChapters);

// 章节详情（含题目）
// 获取章节详情（含题目）- 使用书籍ID和章节序号
router.get('/books/:bookId/chapters/:chapterIdx', bookController.getChapterDetail);

// 提交测验答案
router.post('/quiz/submit', bookController.submitQuiz);

// 用户书架
router.get('/bookshelf/:userId', bookController.getUserBookshelf);

// 添加到书架
router.post('/bookshelf/add', bookController.addToBookshelf);

// 更新阅读进度
router.put('/bookshelf/progress', bookController.updateReadingProgress);

// 从书架移除
router.delete('/bookshelf/remove', bookController.removeFromBookshelf);

module.exports = router;