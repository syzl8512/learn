# Phase 1 API 密钥快速集成指南

**更新日期**: 2025-10-25

**目标**: 快速配置和验证所有 API 密钥，确保 Phase 1 开发环境可用

**成本**: **完全免费** ($0.28/月 可忽略)

---

## 🎯 简明总结

你已经提供了以下 API Key，现在我们需要：

| 服务 | API Key | 用途 | 成本 | 状态 |
|------|--------|------|------|------|
| **魔搭社区** | `ms-1ca8fb07-378a-4404-ad8b-983815c447b3` | 文字转语音 (TTS) | $0 | ✅ 有额度 |
| **DeepSeek** | `sk-45085eef55684544a77ba6f24b23ca9d` | AI 蓝斯值评估 | $0.28/月 | ✅ 已提供 |
| **智普 GLM-4** | `3034d24c0ec44dc1a81836fc55b4b494.1ODx3pKnQFvxq6na` | AI 备选方案 | 按需 | ⭐ 备选 |
| **群晖 NAS** | 本地服务器 | 文件存储 | $0 | ✅ 自有硬件 |
| **微信** | 待申请 | 用户登录 | $0 | ⏳ 申请中 |

**推荐配置**: 魔搭社区 (TTS) + DeepSeek (AI) + 群晖 NAS (存储)

---

## 📋 立即行动清单 (今天)

### Step 1: 验证魔搭社区 TTS (5分钟)

```bash
# 测试魔搭社区 API 连接
curl -X POST https://api.modelscope.cn/api/v1/models \
  -H "Authorization: Bearer ms-1ca8fb07-378a-4404-ad8b-983815c447b3" \
  -H "Content-Type: application/json"

# 预期输出: 返回可用的模型列表
# 确认包含: damo/speech_sambert-hifigan_tts_zh-cn_en-us_pretrain_16k
```

**Python 测试脚本**:
```python
# test_modelscope.py
from modelscope.pipelines import pipeline

try:
    # 初始化 TTS pipeline
    tts = pipeline(
        task='text-to-speech',
        model='damo/speech_sambert-hifigan_tts_zh-cn_en-us_pretrain_16k'
    )

    # 生成测试音频
    result = tts(input_text='Hello, this is a test from ModelScope.')

    print("✅ 魔搭社区 TTS 正常工作")
    print(f"   采样率: {result['sample_rate']}")
    print(f"   音频长度: {len(result['speech'])} samples")

except Exception as e:
    print(f"❌ 魔搭社区 TTS 连接失败: {e}")
```

**运行测试**:
```bash
cd /path/to/project
python test_modelscope.py
```

---

### Step 2: 验证 DeepSeek API (5分钟)

```bash
# 测试 DeepSeek API 连接
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer sk-45085eef55684544a77ba6f24b23ca9d"

# 预期输出: 返回可用的模型列表
# 确认包含: deepseek-chat
```

**Python 测试脚本**:
```python
# test_deepseek.py
import requests

try:
    response = requests.post(
        'https://api.deepseek.com/v1/chat/completions',
        headers={
            'Authorization': 'Bearer sk-45085eef55684544a77ba6f24b23ca9d',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'deepseek-chat',
            'messages': [
                {'role': 'user', 'content': 'Hello, are you working?'}
            ],
            'temperature': 0.7,
            'max_tokens': 100
        }
    )

    if response.status_code == 200:
        print("✅ DeepSeek API 正常工作")
        print(f"   回复: {response.json()['choices'][0]['message']['content']}")
    else:
        print(f"❌ DeepSeek API 错误: {response.status_code}")
        print(f"   详情: {response.text}")

except Exception as e:
    print(f"❌ DeepSeek 连接失败: {e}")
```

**运行测试**:
```bash
python test_deepseek.py
```

---

### Step 3: 验证群晖 NAS 连接 (5分钟)

```bash
# 测试群晖 WebDAV 连接
curl -u your_username:your_password \
  https://your-synology-domain.com:5001/webapi/auth.cgi \
  -X GET

# 预期输出: 返回认证成功的信息
```

**Python 测试脚本**:
```python
# test_synology.py
import requests
from requests.auth import HTTPBasicAuth

try:
    response = requests.get(
        'https://your-synology-domain.com:5001/webapi/auth.cgi',
        auth=HTTPBasicAuth('your_username', 'your_password'),
        verify=False  # 忽略 SSL 证书 (仅开发环境)
    )

    if response.status_code == 200:
        print("✅ 群晖 NAS 连接正常")
        print(f"   响应: {response.json()}")
    else:
        print(f"❌ 群晖 NAS 连接失败: {response.status_code}")

except Exception as e:
    print(f"❌ 群晖连接失败: {e}")
```

**运行测试**:
```bash
python test_synology.py
```

---

### Step 4: 配置环境变量 (5分钟)

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入真实的配置值
nano .env
```

**必须填入的配置**:
```env
# TTS - 魔搭社区
MODELSCOPE_API_KEY=ms-1ca8fb07-378a-4404-ad8b-983815c447b3

# AI - DeepSeek
DEEPSEEK_API_KEY=sk-45085eef55684544a77ba6f24b23ca9d

# 存储 - 群晖 NAS
SYNOLOGY_URL=https://your-synology-domain.com:5001
SYNOLOGY_USERNAME=your_username
SYNOLOGY_PASSWORD=your_password
SYNOLOGY_STORAGE_PATH=/volume1/books/

# 微信 (先用占位符，稍后更新)
WECHAT_APPID=待申请
WECHAT_SECRET=待申请
```

---

## 🔄 集成流程

### 后端集成 - TTS 服务

**文件**: `backend/src/services/tts.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { pipeline } from '@xenova/transformers';

@Injectable()
export class TTSService {
  private ttsModel: any;

  async onModuleInit() {
    // 初始化魔搭社区 TTS 模型
    // 方式 1: 使用 Python 后端调用 (推荐)
    // 方式 2: 使用 Node.js transformers 库调用
  }

  async generateAudio(text: string, outputPath: string): Promise<string> {
    try {
      // 调用魔搭社区 TTS API
      const response = await fetch(
        'https://modelscope.cn/api/v1/text-to-speech',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MODELSCOPE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            model: process.env.MODELSCOPE_TTS_MODEL,
            voice: process.env.MODELSCOPE_TTS_VOICE,
            speed: parseFloat(process.env.MODELSCOPE_TTS_SPEED || '1.0')
          })
        }
      );

      const result = await response.json();

      // 保存到群晖 NAS
      const url = await this.uploadToSynology(result.audio, outputPath);

      return url;
    } catch (error) {
      console.error('TTS 生成失败:', error);
      throw error;
    }
  }

  private async uploadToSynology(audioBuffer: Buffer, remotePath: string): Promise<string> {
    // 实现群晖 WebDAV 上传
    // 返回可访问的 URL
  }
}
```

### 后端集成 - AI 评估服务

**文件**: `backend/src/services/deepseek.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DeepSeekService {
  private apiKey = process.env.DEEPSEEK_API_KEY;
  private apiUrl = process.env.DEEPSEEK_API_URL;

  async assessLexile(userWords: string[]): Promise<{
    lexileScore: number;
    lexileLevel: string;
    reasoning: string;
  }> {
    try {
      const prompt = `
        用户已掌握的英文单词 (前 100 个):
        ${userWords.slice(0, 100).join(', ')}

        请根据这些单词，评估用户的英文水平:
        1. 推荐的 Lexile 分数 (300-1600)
        2. 推荐的难度等级 (初级/KET/PET)
        3. 评估理由

        返回 JSON 格式:
        {
          "lexileScore": 750,
          "lexileLevel": "KET",
          "reasoning": "..."
        }
      `;

      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 解析响应
      const content = response.data.choices[0].message.content;
      const result = JSON.parse(content);

      return result;
    } catch (error) {
      console.error('DeepSeek AI 评估失败:', error);
      throw error;
    }
  }
}
```

### 后端集成 - 存储服务

**文件**: `backend/src/services/storage.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class StorageService {
  private synologyUrl = process.env.SYNOLOGY_URL;
  private synologyUsername = process.env.SYNOLOGY_USERNAME;
  private synologyPassword = process.env.SYNOLOGY_PASSWORD;
  private storagePath = process.env.SYNOLOGY_STORAGE_PATH;

  private createAuthHeader(): string {
    const credentials = `${this.synologyUsername}:${this.synologyPassword}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  async uploadFile(
    fileBuffer: Buffer,
    relativePath: string
  ): Promise<string> {
    try {
      const fullPath = `${this.storagePath}${relativePath}`;

      // 使用 WebDAV 上传
      await axios.put(
        `${this.synologyUrl}/webapi/webdav${fullPath}`,
        fileBuffer,
        {
          headers: {
            'Authorization': this.createAuthHeader(),
            'Content-Type': 'application/octet-stream'
          },
          httpsAgent: {
            rejectUnauthorized: false // 开发环境
          }
        }
      );

      // 返回访问 URL
      return `${this.synologyUrl}/file${fullPath}`;
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  }

  async downloadFile(relativePath: string): Promise<Buffer> {
    try {
      const fullPath = `${this.storagePath}${relativePath}`;

      const response = await axios.get(
        `${this.synologyUrl}/webapi/webdav${fullPath}`,
        {
          headers: {
            'Authorization': this.createAuthHeader()
          },
          httpsAgent: {
            rejectUnauthorized: false
          },
          responseType: 'arraybuffer'
        }
      );

      return response.data;
    } catch (error) {
      console.error('文件下载失败:', error);
      throw error;
    }
  }
}
```

---

## ✅ 完整的验证清单

### W1 启动前 (2025-10-28 09:00)

- [ ] **魔搭社区 TTS**
  ```bash
  # 测试生成音频
  curl -X POST http://localhost:3000/api/tts/test \
    -H "Content-Type: application/json" \
    -d '{"text": "Hello, this is a test."}'

  # 预期: 返回 MP3 文件 URL，可以播放
  ```

- [ ] **DeepSeek AI 评估**
  ```bash
  # 测试蓝斯值评估
  curl -X POST http://localhost:3000/api/lexile/test \
    -H "Content-Type: application/json" \
    -d '{"words": ["the", "is", "hello", "world", "book", "read"]}'

  # 预期: 返回 Lexile 分数 (300-1600) 和难度等级 (初级/KET/PET)
  ```

- [ ] **群晖 NAS 存储**
  ```bash
  # 测试文件上传和下载
  curl -X POST http://localhost:3000/api/storage/test \
    -F "file=@test.txt"

  # 预期: 返回文件访问 URL，可以下载
  ```

- [ ] **微信登录**
  ```bash
  # 测试微信登录流程
  # 1. 点击小程序中的"微信登录"
  # 2. 授权后应该看到成功登录信息
  # 3. 返回有效的 JWT token
  ```

---

## 🆘 故障排查

### 问题 1: 魔搭社区 TTS 超时

**原因**: API 请求超时或模型下载缓慢

**解决**:
```python
# 增加超时时间
from modelscope.pipelines import pipeline

tts = pipeline(
    task='text-to-speech',
    model='damo/speech_sambert-hifigan_tts_zh-cn_en-us_pretrain_16k',
    device='cpu'  # 或 'cuda' 如果有 GPU
)

# 预加载模型 (第一次会下载，之后就快了)
result = tts('Hello')
```

### 问题 2: DeepSeek API 返回 401 Unauthorized

**原因**: API Key 无效或过期

**解决**:
1. 确认 API Key: `sk-45085eef55684544a77ba6f24b23ca9d`
2. 检查 Authorization header 格式: `Bearer {API_KEY}`
3. 访问 https://platform.deepseek.com 确认账户状态

### 问题 3: 群晖 NAS 连接失败

**原因**: URL 格式错误、域名不可达、或认证失败

**解决**:
```bash
# 1. 检查群晖地址是否正确
ping your-synology-domain.com

# 2. 检查用户名和密码
curl -u username:password https://your-synology-domain.com:5001/webapi/auth.cgi

# 3. 检查防火墙规则
sudo ufw allow 5001

# 4. 确保已启用 WebDAV (群晖控制面板 → 文件服务)
```

### 问题 4: 微信登录失败

**原因**: AppID/Secret 无效、回调 URL 不匹配

**解决**:
1. 确认 AppID 和 Secret 已从 https://mp.weixin.qq.com 获取
2. 检查开发者服务器配置中的回调 URL
3. 在本地开发环境中，使用 `MOCK_WECHAT_LOGIN=true` 跳过微信认证

```env
# 本地开发配置
MOCK_WECHAT_LOGIN=true
MOCK_WECHAT_USER_ID=test_user_001
```

---

## 📊 成本监控

### 开启成本告警

```env
# 在 .env 中添加
DEEPSEEK_MONTHLY_LIMIT=100     # 美元
DEEPSEEK_DAILY_LIMIT=10        # 美元
COST_ALERT_ENABLED=true
COST_ALERT_EMAIL=admin@example.com
```

### 查看成本统计

```bash
# 查看 DeepSeek 使用情况
curl http://localhost:3000/api/admin/cost-analytics \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

---

## 🎯 下一步行动

### 今天 (2025-10-25)

- [ ] 运行 4 个验证脚本 (TTS/AI/存储/微信)
- [ ] 配置 .env 文件
- [ ] 提交配置到 Git (使用 .gitignore 保护敏感信息)

### 本周 (2025-10-25-27)

- [ ] 集成 TTS 服务到后端
- [ ] 集成 AI 服务到后端
- [ ] 集成存储服务到后端
- [ ] 完整的端到端测试

### W1 启动 (2025-10-28)

- [ ] 所有 API 集成完成
- [ ] 前端可以调用所有后端 API
- [ ] 完整的 Kick-off 会议

---

## 📝 总结

| 服务 | API Key | 状态 | 验证方法 |
|------|--------|------|--------|
| 魔搭社区 TTS | ✅ 已有 | 准备集成 | Python 脚本 |
| DeepSeek AI | ✅ 已有 | 准备集成 | curl 命令 |
| 群晖 NAS | ✅ 已有 | 准备集成 | curl 命令 |
| 微信小程序 | ⏳ 申请中 | 团队处理 | 手动授权 |
| 智普 GLM | ✅ 已有 | 备选方案 | - |

**总成本**: $0.28/月 (完全免费，可忽略)

**预计完成时间**: 3 天 (集成) + 2 天 (测试) = 5 天

**开始时间**: 2025-10-25

**目标完成**: 2025-10-30 (W1 启动前)

---

**准备好了吗？让我们开始吧！** 🚀

更多详情: 查看 `docs/API密钥替代方案-成本优化.md`
