const OpenAI = require('openai');

class DeepSeekChat {
  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY || 'your_deepseek_api_key'
    });
    this.model = 'deepseek-chat';
    this.temperature = 0.5;
    this.maxTokens = 4096;
  }

  async sendMessage(content) {
    try {
      const completion = await this.client.chat.completions.create({
        messages: [{ role: 'user', content }],
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API 错误:', error);
      throw new Error(`DeepSeek 请求失败: ${error.message}`);
    }
  }
}

function createDeepSeekChat() {
  return new DeepSeekChat();
}

module.exports = {
  DeepSeekChat,
  createDeepSeekChat
};