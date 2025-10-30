# API 密钥说明 - 各服务具体用途

**更新日期**: 2025-10-25

**目的**: 明确项目中各个第三方 API Key 的具体用途和功能

---

## 🔑 核心 API 密钥清单

### 1. 微信小程序 API (必需)

#### 密钥信息
- **类型**: WECHAT_APPID 和 WECHAT_SECRET
- **获取地址**: https://mp.weixin.qq.com
- **申请时间**: 2-3 天
- **优先级**: 🔴 P0 - **必需，直接关系到用户登录**

#### 具体用途

**主要功能**:
- ✅ **用户登录认证** - 最核心的功能
  - 用户在小程序中点击"微信授权登录"
  - 小程序调用微信登录接口获取临时 code
  - 后端用 AppID + AppSecret + code 换取用户 openid 和 session_key
  - 用户成功登录应用

- ✅ **获取用户信息**
  - 用户头像
  - 用户昵称
  - 用户性别
  - 所有数据都通过微信服务器获取

- ✅ **会话管理**
  - 维持用户登录状态
  - token 生成和验证
  - 用户身份识别

#### 技术流程图

```
用户点击"微信登录"
        ↓
小程序调用 wx.login() 获取 code
        ↓
小程序将 code 发送给后端
        ↓
后端用以下信息调用微信 API:
  - WECHAT_APPID
  - WECHAT_SECRET
  - code
        ↓
微信服务器返回:
  - openid (用户唯一标识)
  - session_key (会话密钥)
        ↓
后端创建 JWT token，返回给小程序
        ↓
小程序保存 token，用于后续 API 调用
        ↓
用户成功登录 ✅
```

#### 环境变量配置

```env
# 微信小程序配置
WECHAT_APPID=your_appid_here
WECHAT_SECRET=your_secret_here
WECHAT_LOGIN_API=https://api.weixin.qq.com/sns/jscode2session
```

#### 没有这个密钥的后果

❌ **无法使用**:
- 用户无法登录
- 无法获取用户信息
- 整个应用无法使用 (需要登录)

---

### 2. 阿里云 TTS (文字转语音) API

#### 密钥信息
- **类型**: ALIYUN_ACCESS_KEY_ID, ALIYUN_ACCESS_KEY_SECRET, ALIYUN_TTS_APPKEY
- **获取地址**: https://www.aliyun.com
- **申请时间**: 1 天
- **优先级**: 🔴 P0 - **必需，关系到音频功能**

#### 具体用途

**主要功能**:
- ✅ **图书朗读音频生成** - 核心功能
  - 用户在阅读页面点击"播放"
  - 系统调用阿里云 TTS 服务
  - 将英文文本转换成语音
  - 返回 MP3 音频文件
  - 用户听到朗读

- ✅ **多语种和方言支持**
  - 英文标准美音
  - 英文英音
  - 其他语言支持

- ✅ **多声音选择**
  - 阿里云提供多个预设声音
  - 男声、女声、儿童声音等
  - 可选择的语速 (快、正常、慢)

- ✅ **音频文件缓存**
  - 生成的音频文件存储在阿里云 OSS
  - 避免重复生成相同文本的音频
  - 节省成本

#### 技术流程图

```
用户在阅读页点击"播放"
        ↓
前端将选定的文本和语速参数发送给后端
        ↓
后端检查缓存:
  - 如果音频已存在 → 直接返回 URL
  - 如果不存在 → 调用阿里云 TTS
        ↓
后端用以下信息调用阿里云 TTS API:
  - ALIYUN_ACCESS_KEY_ID
  - ALIYUN_ACCESS_KEY_SECRET
  - ALIYUN_TTS_APPKEY
  - 要转换的英文文本
  - 语速参数
        ↓
阿里云返回音频文件 (MP3 格式)
        ↓
后端将音频存储在阿里云 OSS，获得 URL
        ↓
后端返回音频 URL 给前端
        ↓
前端播放音频，用户听到朗读 ✅
```

#### 环境变量配置

```env
# 阿里云 TTS 配置
ALIYUN_REGION=cn-shanghai
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_TTS_APPKEY=your_appkey
ALIYUN_TTS_VOICE=xiaoxiao  # 声音选择
ALIYUN_TTS_SPEED=1.0       # 语速 (0.5-2.0)
```

#### 没有这个密钥的后果

❌ **无法使用**:
- 用户无法播放英文朗读
- 阅读体验严重下降
- 无法提供"听力"功能
- 但应用仍可以使用 (可以降级为不支持音频)

---

### 3. 阿里云 OSS (文件存储) API

#### 密钥信息
- **类型**: ALIYUN_OSS_ENDPOINT, ALIYUN_OSS_BUCKET, ALIYUN_ACCESS_KEY_ID, ALIYUN_ACCESS_KEY_SECRET
- **获取地址**: https://www.aliyun.com
- **申请时间**: 1 天 (与 TTS 同步申请)
- **优先级**: 🔴 P0 - **必需，关系到文件存储**

#### 具体用途

**主要功能**:
- ✅ **音频文件存储**
  - TTS 生成的 MP3 文件存储
  - 用户可以直接访问音频文件
  - CDN 加速，性能更好

- ✅ **书籍封面图片存储**
  - 用户上传的书籍封面
  - 应用显示的书籍预览图
  - 优化和缓存

- ✅ **用户上传的 PDF 存储**
  - 用户导入的 PDF 书籍
  - 系统处理后的 Markdown 内容
  - 媒体文件 (图片、音频等)

- ✅ **文件管理和访问控制**
  - 按目录组织文件
  - 权限控制
  - 版本管理

#### 技术流程图

```
用户上传 PDF 书籍
        ↓
后端接收 PDF 文件
        ↓
后端调用 MinerU 处理 PDF → Markdown
        ↓
生成的 Markdown 和相关资源需要存储
        ↓
后端用以下信息调用阿里云 OSS API:
  - ALIYUN_OSS_ENDPOINT
  - ALIYUN_OSS_BUCKET
  - ALIYUN_ACCESS_KEY_ID
  - ALIYUN_ACCESS_KEY_SECRET
        ↓
阿里云 OSS 存储文件，返回访问 URL
        ↓
后端将 URL 保存到数据库
        ↓
用户可以随时访问这些文件 ✅

---

生成 TTS 音频的情况:

阿里云 TTS 返回 MP3 数据
        ↓
后端调用阿里云 OSS 上传 MP3
        ↓
OSS 返回文件 URL
        ↓
后端将 URL 保存到数据库的 ChapterContent 表
        ↓
前端读取 URL，播放音频 ✅
```

#### 环境变量配置

```env
# 阿里云 OSS 配置
ALIYUN_OSS_ENDPOINT=oss-cn-shanghai.aliyuncs.com
ALIYUN_OSS_BUCKET=your-bucket-name
ALIYUN_OSS_REGION=cn-shanghai
ALIYUN_ACCESS_KEY_ID=your_access_key_id      # 与 TTS 相同
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret  # 与 TTS 相同

# 文件路径前缀
ALIYUN_OSS_PDF_PREFIX=pdfs/
ALIYUN_OSS_AUDIO_PREFIX=audios/
ALIYUN_OSS_IMAGE_PREFIX=images/
```

#### 没有这个密钥的后果

❌ **无法使用**:
- PDF 文件无处存储
- 音频文件无处存储
- 应用无法保存任何用户数据
- 整个功能系统崩溃

---

### 4. DeepSeek API (AI 服务)

#### 密钥信息
- **类型**: DEEPSEEK_API_KEY
- **获取地址**: https://platform.deepseek.com
- **申请时间**: 1 天
- **优先级**: 🔴 P0 - **必需，AI 功能的核心**

#### 具体用途

**主要功能**:
- ✅ **蓝斯值 (Lexile) AI 评估**
  - 用户上传已掌握的单词列表
  - 系统用 DeepSeek 分析用户的英文水平
  - 自动推荐合适的难度等级 (初级/KET/PET)
  - 更精准的分级比简单的快速选择

- ✅ **书籍内容自动改写** (Phase 2+)
  - 原文书籍自动改写成多个难度版本
  - 初级版本: 简化词汇，更短句子
  - KET 版本: 中等难度
  - PET 版本: 较难难度
  - 节省人工改写成本

- ✅ **生词释义生成**
  - 为生词库中的词汇生成更好的释义
  - 举例造句
  - 同义词推荐

#### 技术流程图

```
用户选择"AI 评估蓝斯值"
        ↓
用户上传已掌握的单词列表 (CSV)
        ↓
前端发送列表给后端
        ↓
后端用以下信息调用 DeepSeek API:
  - DEEPSEEK_API_KEY
  - 用户的单词列表
  - 系统提示词 (告诉 AI 如何评估)
        ↓
DeepSeek 分析并返回:
  - 推荐的蓝斯值分数
  - 推荐的难度等级
  - 评估说明
        ↓
后端将结果保存到 UserLexileHistory 表
        ↓
后端将结果返回给前端
        ↓
用户看到 AI 的评估结果，可以接受或修改 ✅
```

#### 环境变量配置

```env
# DeepSeek AI 配置
DEEPSEEK_API_KEY=sk-your-api-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=2000

# 成本限制
DEEPSEEK_MONTHLY_LIMIT=100  # 美元
DEEPSEEK_DAILY_LIMIT=10     # 美元
```

#### 没有这个密钥的后果

❌ **功能影响**:
- AI 蓝斯值评估功能无法使用
- 用户只能使用快速选择或手动输入 (仍可用)
- 自动内容改写无法实现 (Phase 2 功能)
- **但核心应用仍可使用** (降级模式)

#### 成本对比

```
DeepSeek: $0.14 / 1M tokens = 70% 成本节省 ✅
OpenAI:   $0.30 / 1K tokens = 100% 成本 ❌

预计月成本 (DeepSeek):
  - 假设每个用户 AI 评估 1 次，使用 5000 tokens
  - 1000 用户 = 500 万 tokens
  - 成本 = 5,000,000 / 1,000,000 * $0.14 = $0.70

VS OpenAI:
  - 同样流量: 500 万 tokens = 5000 * $0.30 = $1.50

每月节省: $1.50 - $0.70 = $0.80 (按 1000 用户)
年度节省: $9.60 (按 1000 用户)
```

---

## 📊 API 密钥优先级总结

| API 名称 | 用途 | 优先级 | 申请难度 | 获取时间 | 必需性 |
|---------|------|--------|--------|---------|--------|
| **微信** | 用户登录 | P0 | 中等 | 2-3 天 | 🔴 必需 |
| **阿里云 TTS** | 音频朗读 | P0 | 简单 | 1 天 | 🔴 必需 |
| **阿里云 OSS** | 文件存储 | P0 | 简单 | 1 天 | 🔴 必需 |
| **DeepSeek** | AI 评估 | P0 | 简单 | 1 天 | 🟡 可降级 |

---

## 🚀 申请顺序和时间表

### 第一优先级 (今日申请)

**微信小程序**:
1. 访问 https://mp.weixin.qq.com
2. 注册企业账号 (1 天)
3. 提交审核 (1-2 天)
4. 审核通过后获得 AppID 和 AppSecret (共 2-3 天)

**阿里云**:
1. 访问 https://www.aliyun.com
2. 注册账号并实名认证 (1 天)
3. 申请 TTS 服务和 OSS 服务 (立即获得)
4. 生成 AccessKey (立即获得)

**DeepSeek**:
1. 访问 https://platform.deepseek.com
2. 注册账号并充值 (1 天)
3. 生成 API Key (立即获得)

### 推荐时间表

| 日期 | 任务 | 预计耗时 |
|------|------|--------|
| 10-25 | 注册所有账号 | 1-2 小时 |
| 10-25 | 申请阿里云密钥 | 10 分钟 |
| 10-25 | 申请 DeepSeek 密钥 | 10 分钟 |
| 10-25-26 | 微信企业认证和申请 (并行) | 2-3 天 |
| 10-27 | 获得所有密钥，配置到 .env | 1 小时 |
| 10-28 | 验证所有密钥可用 | 30 分钟 |

---

## ✅ 密钥验证清单

在 Phase 1 启动前，确保所有密钥都已验证：

- [ ] **微信**: 能否成功登录？
  ```
  测试方法: 在开发环境中点击"微信登录"按钮
  预期结果: 弹出微信授权页面，授权后成功登录
  ```

- [ ] **阿里云 TTS**: 能否生成音频？
  ```
  测试方法: 调用 /api/tts/generate-audio 接口，传入英文文本
  预期结果: 返回 MP3 文件 URL，点击可播放
  ```

- [ ] **阿里云 OSS**: 能否上传文件？
  ```
  测试方法: 上传一个测试文件到 OSS
  预期结果: 文件成功上传，获得访问 URL
  ```

- [ ] **DeepSeek**: 能否调用 API？
  ```
  测试方法: 调用 /api/lexile/ai-assessment 接口，传入单词列表
  预期结果: 返回蓝斯值评估结果
  ```

---

## 🔒 安全提示

### ⚠️ 重要提醒

1. **不要提交密钥到 Git**
   ```
   .env 文件应该在 .gitignore 中
   绝不要提交 WECHAT_SECRET 等敏感信息
   ```

2. **分开存储敏感信息**
   ```env
   # 不要这样做 ❌
   WECHAT_APPID=xxx
   WECHAT_SECRET=super_secret_key

   # 应该这样做 ✅
   # 1. .env.example 中只填写占位符
   WECHAT_SECRET=your_secret_here

   # 2. 实际的 .env 文件在本地保管
   WECHAT_SECRET=真实的密钥
   ```

3. **定期轮换 API Key**
   - 至少每 6 个月轮换一次
   - 如果泄露，立即轮换
   - 保留一个 backup key

4. **监控 API 使用情况**
   - 设置 API 配额限制
   - 每天检查使用费用
   - 异常使用立即告警

---

## 📞 故障排查

### 微信登录失败

**错误**: "Invalid AppID"
- **原因**: AppID 或 AppSecret 错误
- **解决**: 检查 https://mp.weixin.qq.com 中的值是否正确

**错误**: "Invalid code"
- **原因**: code 已过期或无效
- **解决**: code 有效期只有 5 分钟，需要立即兑换

### 阿里云 TTS 失败

**错误**: "AccessKey 不存在"
- **原因**: AccessKeyID 或 AccessKeySecret 错误
- **解决**: 重新生成密钥对

**错误**: "请求超时"
- **原因**: 网络问题或 API 服务故障
- **解决**: 检查网络，稍后重试

### DeepSeek API 失败

**错误**: "Insufficient balance"
- **原因**: 账户余额不足
- **解决**: 在 DeepSeek 控制台充值

**错误**: "Rate limit exceeded"
- **原因**: 请求频率太高
- **解决**: 实施速率限制和队列机制

---

## 总结

| API | 核心作用 | 必需性 | 获取难度 |
|-----|--------|--------|--------|
| 微信 | 🔐 用户登录认证 | 🔴 必需 | 中等 |
| 阿里云 TTS | 🎵 英文朗读 | 🔴 必需 | 简单 |
| 阿里云 OSS | 💾 文件存储 | 🔴 必需 | 简单 |
| DeepSeek | 🤖 AI 评估 | 🟡 可降级 | 简单 |

**总成本** (月度，1000 用户规模):
- 微信: 免费
- 阿里云 TTS: 约 $10-20 (按调用量)
- 阿里云 OSS: 约 $10-30 (按存储量)
- DeepSeek: 约 $1-5 (按使用量)
- **总计: 约 $30-55 /月** ✅

---

**更新日期**: 2025-10-25
**编制**: Claude Code
**版本**: v1.0
