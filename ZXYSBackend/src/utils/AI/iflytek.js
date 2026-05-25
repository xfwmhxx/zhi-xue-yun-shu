const WebSocket = require('ws');
const CryptoJS = require('crypto-js');

class SparkChat {
  /**
   * @param {Object} config 
   * @param {string} config.appid
   * @param {string} config.apiKey
   * @param {string} config.apiSecret
   * @param {string} [config.domain]
   * @param {number} [config.temperature]
   * @param {number} [config.maxTokens]
   * @param {number} [config.topK]
   * @param {string} [config.chatId]
   * @param {string} [config.uid]
   */
  constructor(config) {
    this.config = {
      domain: 'lite',
      temperature: 0.5,
      maxTokens: 4096,
      topK: 4,
      uid: 'user_' + Date.now(),
      ...config
    };
    this.ws = null;
    this.baseURL = 'wss://spark-api.xf-yun.com/v1.1/chat';
    this.messageCallback = null;
    this.errorCallback = null;
    this._isConnected = false;
  }

  // 生成鉴权URL
  generateAuthUrl() {
    const { apiKey, apiSecret } = this.config;
    const date = new Date().toUTCString();
    const host = 'spark-api.xf-yun.com';
    
    // 签名字符串
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);
    
    // 组装 authorization 参数
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    // Node.js 中使用 Buffer 代替 btoa
    const authorization = Buffer.from(authorizationOrigin).toString('base64');
    
    return `${this.baseURL}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
  }

  /**
   * 发送消息
   * @param {string} content 用户输入内容
   * @param {Function} onMessage 过程回调 (content, isEnd) => {}
   * @param {Function} onError 错误回调 (error) => {}
   * @returns {Promise<string>}
   */
  sendMessage(content, onMessage, onError) {
    return new Promise((resolve, reject) => {
      if (onMessage) this.messageCallback = onMessage;
      if (onError) this.errorCallback = onError;

      const url = this.generateAuthUrl();
      // 使用 ws 库创建连接
      this.ws = new WebSocket(url);
      let fullResponse = '';

      this.ws.on('open', () => {
        this._isConnected = true;
        const requestData = {
          header: {
            app_id: this.config.appid,
            uid: this.config.uid,
          },
          parameter: {
            chat: {
              domain: this.config.domain,
              temperature: this.config.temperature,
              max_tokens: this.config.maxTokens,
              top_k: this.config.topK,
              chat_id: this.config.chatId,
            },
          },
          payload: {
            message: {
              text: [{ role: 'user', content }],
            },
          },
        };
        this.ws.send(JSON.stringify(requestData));
      });

      this.ws.on('message', (data) => {
        try {
          const response = JSON.parse(data.toString());
          
          if (response.header.code !== 0) {
            const error = new Error(`API错误: ${response.header.code} - ${response.header.message}`);
            if (this.errorCallback) this.errorCallback(error);
            this.close();
            reject(error);
            return;
          }

          const text = response.payload.choices.text[0]?.content || '';
          fullResponse += text;
          
          // 如果需要实时流式输出，可以解开下面注释
          if (this.messageCallback) {
             this.messageCallback(text, response.payload.choices.status === 2);
          }
          
          // 状态为 2 表示回复结束
          if (response.payload.choices.status === 2) {
            this.close();
            resolve(fullResponse);
          }
        } catch (error) {
          if (this.errorCallback) this.errorCallback(error);
          this.close();
          reject(error);
        }
      });

      this.ws.on('error', (err) => {
        const error = new Error(`WebSocket连接错误: ${err.message}`);
        if (this.errorCallback) this.errorCallback(error);
        this.close();
        reject(error);
      });

      this.ws.on('close', () => {
        this._isConnected = false;
        this.ws = null;
      });
    });
  }

  // 关闭连接
  close() {
    if (this.ws) {
      this.ws.terminate(); // Node 环境建议使用 terminate 强制关闭
      this._isConnected = false;
      this.ws = null;
    }
  }

  // 检查连接状态
  get isConnected() {
    return this._isConnected;
  }
}

// 导出工厂函数
function createSparkChat(config) {
  return new SparkChat(config);
}

module.exports = {
  SparkChat,
  createSparkChat
};