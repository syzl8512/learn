# API Keys 配置文档

**更新时间**: 2025-10-27  
**状态**: ✅ 已收集

---

## 🔑 API Keys 清单

### 1. 魔搭社区（AI 评估 - 主方案）⭐⭐⭐⭐⭐
**用途**: Lexile AI 评估 + TTS 语音合成  
**优先级**: P0  
**API Key**: `ms-1ca8fb07-378a-4404-ad8b-983815c447b3`  
**AI 接口地址**: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation  
**推荐模型**: qwen-max（通用）、qwen-plus（经济）  
**文档**: https://help.aliyun.com/zh/dashscope/  
**TTS 参考**: https://www.modelscope.cn/studios/JuilynCelsia/Transcriptions  
**优势**: 免费额度充足，质量优秀，中英文都强

### 2. 智谱 GLM-4.6（AI 评估 - 备选）
**用途**: Lexile AI 评估备选方案  
**优先级**: P1  
**API Key**: `3034d24c0ec44dc1a81836fc55b4b494.1ODx3pKnQFvxq6na`  
**接口地址**: https://open.bigmodel.cn/api/anthropic  
**文档**: https://open.bigmodel.cn/  
**优势**: 兼容 Anthropic API，成本低

### 3. DeepSeek（AI 评估 - 备选）
**用途**: Lexile AI 评估备选方案  
**优先级**: P2  
**API Key**: `sk-45085eef55684544a77ba6f24b23ca9d`  
**接口地址**: https://api.deepseek.com  
**文档**: https://deepseek.com/  
**优势**: 中文优化

### 4. 阿里云 OSS（文件存储）
**用途**: 音频文件存储  
**优先级**: P0  
**Access Key**: `sk-a62ef71a1d84451faa425fb0d295a718`  
**状态**: ⚠️ 需要补充完整配置  
**需要信息**:
- [ ] Access Key ID（完整）
- [ ] Access Key Secret
- [ ] Bucket 名称
- [ ] Region（如 oss-cn-hangzhou）

---

## 📋 环境变量配置

### backend/.env 文件
```bash
# ==================== AI 评估服务 ====================

# 魔搭社区（主方案）⭐⭐⭐⭐⭐
MODELSCOPE_API_KEY=ms-1ca8fb07-378a-4404-ad8b-983815c447b3
MODELSCOPE_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
MODELSCOPE_MODEL=qwen-max

# 智谱 GLM-4（备选）
ZHIPU_API_KEY=5c136aa46a2647f797db173a2884afac.BfrurduWQydSeBF4
ZHIPU_API_URL=https://open.bigmodel.cn/api/anthropic
ZHIPU_MODEL=glm-4.6

# DeepSeek（备选）
DEEPSEEK_API_KEY=sk-45085eef55684544a77ba6f24b23ca9d
DEEPSEEK_API_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# AI 提供商配置
DEFAULT_AI_PROVIDER=modelscope
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=modelscope,zhipu,deepseek

# ==================== TTS 服务 ====================

# 魔搭 TTS（主方案）
TTS_ENGINE=modelscope
MODELSCOPE_TTS_API_KEY=ms-1ca8fb07-378a-4404-ad8b-983815c447b3
MODELSCOPE_TTS_VOICE=en-US-Standard-A
TTS_FALLBACK_ENGINE=edge

# ==================== OSS 存储 ====================

# 阿里云 OSS
ALIYUN_OSS_ACCESS_KEY_ID=<待补充>
ALIYUN_OSS_ACCESS_KEY_SECRET=<待补充>
ALIYUN_OSS_BUCKET=<待补充>
ALIYUN_OSS_REGION=<待补充>
ALIYUN_OSS_ENDPOINT=<自动生成>

# OSS 文件路径
OSS_BASE_PATH=reading-app
OSS_AUDIO_PATH=audios
OSS_PDF_PATH=books
OSS_COVER_PATH=covers
```

---

## 🧪 测试步骤

### 1. 测试智谱 GLM-4 API
```bash
curl -X POST https://open.bigmodel.cn/api/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: 3034d24c0ec44dc1a81836fc55b4b494.1ODx3pKnQFvxq6na" \
  -d '{
    "model": "glm-4",
    "messages": [
      {
        "role": "user",
        "content": "Hello, can you help me assess English reading level?"
      }
    ]
  }'
```

**预期结果**: 返回 200，包含 AI 响应

---

### 2. 测试 DeepSeek API
```bash
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-45085eef55684544a77ba6f24b23ca9d" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {
        "role": "user",
        "content": "Test message"
      }
    ]
  }'
```

**预期结果**: 返回 200，包含 AI 响应

---

### 3. 测试魔搭 TTS API
```bash
# 需要访问魔搭社区文档测试
# 参考: https://www.modelscope.cn/studios/JuilynCelsia/Transcriptions

# 测试步骤:
1. 访问魔搭社区
2. 使用 API Key: ms-1ca8fb07-378a-4404-ad8b-983815c447b3
3. 测试文本转语音功能
4. 评估音频质量
```

---

### 4. 测试 OSS 连接
```bash
# 需要完整配置后测试
# 使用阿里云 SDK

const OSS = require('ali-oss');
const client = new OSS({
  accessKeyId: '<待补充>',
  accessKeySecret: '<待补充>',
  bucket: '<待补充>',
  region: '<待补充>',
});

// 测试上传
await client.put('test.txt', Buffer.from('Hello OSS'));
console.log('✅ OSS 连接成功');
```

---

## 📊 成本预估

### 智谱 GLM-4
- **定价**: 按 token 计费
- **预估**: < ¥20/月（Lexile 评估使用量小）

### DeepSeek
- **定价**: 按 token 计费
- **预估**: 备用，不计入主成本

### 魔搭社区
- **定价**: 免费额度
- **预估**: ¥0/月

### 阿里云 OSS
- **定价**: 按存储和流量计费
- **预估**: ¥10-50/月（根据音频文件数量）

### 总计
- **预估月成本**: ¥10-70
- **原方案成本**: ¥180-390
- **节省**: 60-82%

---

## ⚠️ 待办事项

### 高优先级
- [ ] **Day 1 上午**: 测试智谱 GLM-4 API（验证可用性）
- [ ] **Day 1 上午**: 测试魔搭 TTS API（评估音频质量）
- [ ] **Day 1**: 补充阿里云 OSS 完整配置

### 中优先级
- [ ] 测试 DeepSeek API（备用验证）
- [ ] 配置 AI 自动降级机制
- [ ] 编写 API 使用文档

### 低优先级
- [ ] 成本监控仪表板
- [ ] API 调用统计

---

## 🔒 安全注意事项

1. ✅ 所有 API Keys 已保存到 `.env` 文件
2. ✅ `.env` 已加入 `.gitignore`
3. ⚠️ 不要将 API Keys 提交到 Git
4. ⚠️ 生产环境使用环境变量或密钥管理服务

---

## 📚 参考资源

### 智谱 GLM-4
- 官网: https://open.bigmodel.cn/
- API 文档: https://open.bigmodel.cn/dev/api
- 定价: https://open.bigmodel.cn/pricing

### DeepSeek
- 官网: https://deepseek.com/
- API 文档: https://api-docs.deepseek.com/

### 魔搭社区
- 官网: https://www.modelscope.cn/
- TTS Studio: https://www.modelscope.cn/studios/JuilynCelsia/Transcriptions
- API 文档: https://www.modelscope.cn/docs

### 阿里云 OSS
- 官网: https://www.aliyun.com/product/oss
- 文档: https://help.aliyun.com/product/31815.html
- SDK: https://help.aliyun.com/document_detail/32068.html

### ebook2audiobook 项目
- GitHub: https://github.com/DrewThomasson/ebook2audiobook
- 可参考其 TTS 实现和音频处理

---

**配置完成后，请确认所有 API 测试通过再开始开发！** ✅
