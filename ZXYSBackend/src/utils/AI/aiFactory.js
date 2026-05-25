const { createDeepSeekChat } = require('./deepseek');
const { createSparkChat } = require('./iflytek');

const sparkConfig = {
  appid: process.env.SPARK_APPID || 'your_spark_appid',
  apiKey: process.env.SPARK_API_KEY || 'your_spark_api_key',
  apiSecret: process.env.SPARK_API_SECRET || 'your_spark_api_secret',
  domain: 'lite',
};

const PROVIDER = process.env.AI_PROVIDER || 'deepseek';

function createAIChat() {
  if (PROVIDER === 'deepseek') {
    return createDeepSeekChat();
  } else {
    return createSparkChat(sparkConfig);
  }
}

module.exports = {
  createAIChat,
  PROVIDER
};