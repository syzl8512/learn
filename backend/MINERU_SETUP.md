# MinerU PDF 转换服务配置指南

## 📚 概述

MinerU 是一个强大的 PDF 转 Markdown 服务，支持：
- ✅ 高精度 PDF 文本提取
- ✅ 表格识别和转换
- ✅ 公式识别（LaTeX）
- ✅ 图片提取
- ✅ OCR 文字识别
- ✅ 版面分析

**官网**: [https://mineru.net/](https://mineru.net/)

---

## 🔧 配置步骤

### 1. 添加 API Key 到 .env 文件

在 `backend/.env` 文件中添加以下配置：

```bash
# MinerU PDF转换服务配置
MINERU_API_KEY=apieyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJqdGkiOiIyOTEwMDM5MiIsInJvbCI6IlJPTEVfUkVHSVNURVIiLCJpc3MiOiJPcGVuWExhYiIsImlhdCI6MTc2MTExOTc3MiwiY2xpZW50SWQiOiJsa3pkeDU3bnZ5MjJqa3BxOXgydyIsInBob25lIjoiIiwib3BlbklkIjpudWxsLCJ1dWlkIjoiOTJjMDZjOGQtMmNlNi00YjFhLTlmNDktNmM1ZGI4NDc1ZmUwIiwiZW1haWwiOiIiLCJleHAiOjE3NjIzMjkzNzJ9.7ZY5AilxryuciKsJxfIRtfFgDsbZAr-_pr06r2cLHpzmXn6r7cDoHIgd52qyNiTDCBDViU__RFV_fhVkhahn5g
```

### 2. 确认 Python 3 已安装

```bash
# 检查 Python 版本
python3 --version

# 如果未安装，请安装 Python 3.8+
# macOS:
brew install python3

# Ubuntu/Debian:
sudo apt-get install python3 python3-pip

# Windows:
# 从 python.org 下载安装
```

### 3. 确认 Python 脚本位置

确保 `pdf_to_markdown.py` 脚本位于项目根目录：

```
英语分级阅读/
├── pdf_to_markdown.py  ← 应该在这里
├── backend/
├── frontend/
└── ...
```

如果脚本不在这个位置，请移动到正确位置。

---

## 🧪 测试 MinerU 服务

### 方法 1：使用健康检查端点

启动后端服务后，访问：

```bash
GET http://localhost:3000/health
```

响应中会包含 MinerU 服务状态：

```json
{
  "status": "ok",
  "info": {
    "mineru": {
      "status": "up",
      "healthy": true,
      "apiKeyConfigured": true,
      "pythonScriptExists": true,
      "pythonInstalled": true,
      "message": "✅ MinerU 服务正常"
    }
  }
}
```

### 方法 2：直接测试 Python 脚本

```bash
# 进入项目根目录
cd /Users/zhangliang/Desktop/英语分级阅读

# 在 download 目录放一个测试 PDF
mkdir -p download
# 将测试 PDF 复制到 download/ 目录

# 运行脚本
python3 pdf_to_markdown.py \
  --api-key "your_api_key_here" \
  --file "download/test.pdf" \
  --output "output"

# 查看结果
ls -lh output/
```

### 方法 3：通过 API 上传 PDF

```bash
# 上传 PDF 文件
curl -X POST http://localhost:3000/api/books/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/test.pdf" \
  -F "title=测试书籍" \
  -F "author=测试作者"

# 响应示例
{
  "bookId": "clxxx123",
  "message": "书籍上传成功，正在后台处理 PDF",
  "jobId": "job_123",
  "status": "queued"
}

# 查询处理进度
curl http://localhost:3000/api/books/upload/job_123/progress

# 响应示例
{
  "jobId": "job_123",
  "progress": 60,
  "status": "active",
  "message": "正在分割章节..."
}
```

---

## 📂 文件结构说明

转换完成后，会在 `backend/storage/pdf-output/` 目录下生成：

```
storage/pdf-output/
└── book_clxxx123/          # 书籍ID目录
    ├── 书名.md              # Markdown 内容
    ├── 书名_content.json    # 结构化内容
    └── 书名_layout.json     # 版面信息
```

---

## 🔍 故障排查

### 问题 1: "MinerU API Key 未配置"

**解决方案**:
1. 检查 `.env` 文件是否存在
2. 确认 `MINERU_API_KEY` 是否正确设置
3. 重启后端服务

### 问题 2: "Python脚本不存在"

**解决方案**:
1. 确认 `pdf_to_markdown.py` 在项目根目录
2. 检查文件权限: `chmod +x pdf_to_markdown.py`

### 问题 3: "Python3 未安装或不可用"

**解决方案**:
```bash
# 检查 Python
which python3
python3 --version

# 如果未找到，安装 Python 3
brew install python3  # macOS
```

### 问题 4: PDF 转换失败

**可能原因**:
- PDF 文件损坏
- PDF 文件过大 (>100MB)
- API 配额用尽
- 网络问题

**解决方案**:
1. 检查后端日志: `logs/app-YYYY-MM-DD.log`
2. 查看队列状态
3. 尝试更小的 PDF 文件测试
4. 检查 MinerU 账户配额: https://mineru.net/

### 问题 5: 转换速度慢

**正常情况**:
- 小文件 (< 10MB): 30秒 - 1分钟
- 中等文件 (10-50MB): 1-3分钟
- 大文件 (50-100MB): 3-10分钟

**优化建议**:
- 使用异步队列处理（已实现）
- 批量转换时控制并发数
- 定期清理临时文件

---

## 🚀 使用示例

### 示例 1: 单个 PDF 转换

```typescript
// 在 NestJS 控制器中
const result = await this.minerUService.convertPdfToMarkdown(
  '/path/to/book.pdf',
  {
    bookId: 'clxxx123',
    title: 'Harry Potter',
  }
);

if (result.success) {
  console.log('转换成功:', result.markdownPath);
  console.log('Markdown 内容长度:', result.markdownContent.length);
} else {
  console.error('转换失败:', result.error);
}
```

### 示例 2: 批量 PDF 转换

```typescript
const results = await this.minerUService.batchConvertPdfs(
  ['/path/to/book1.pdf', '/path/to/book2.pdf'],
  {
    bookIds: ['book1_id', 'book2_id'],
  }
);

console.log(`成功: ${results.filter(r => r.success).length} 个`);
```

### 示例 3: 健康检查

```typescript
const health = await this.minerUService.checkHealth();

if (health.healthy) {
  console.log('✅ MinerU 服务正常');
} else {
  console.error('❌ MinerU 服务异常:', health.message);
}
```

### 示例 4: 清理临时文件

```typescript
// 清理 7 天前的临时文件
const result = await this.minerUService.cleanupTempFiles(7);

console.log(`清理了 ${result.deletedCount} 个目录`);
console.log(`释放了 ${(result.freedSpace / 1024 / 1024).toFixed(2)} MB 空间`);
```

---

## 📊 API 配额说明

根据 MinerU 官网信息，免费账户通常有以下限制：

- **每日转换次数**: 具体请查看账户
- **单文件大小**: 100MB
- **并发请求数**: 建议不超过 3 个

如需更高配额，请访问 [https://mineru.net/](https://mineru.net/) 升级账户。

---

## 🔗 相关资源

- **MinerU 官网**: https://mineru.net/
- **API 文档**: https://mineru.net/api/v4
- **Python 脚本**: `/pdf_to_markdown.py`
- **服务实现**: `/backend/src/ai-pipeline/minerU/minerU.service.ts`
- **队列处理**: `/backend/src/queue/pdf-processing.queue.ts`

---

## 📝 更新日志

- **2025-10-26**: 初始版本，集成 MinerU API v4
- 支持单个/批量 PDF 转换
- 支持健康检查和临时文件清理
- 完整的错误处理和日志记录

---

如有问题，请查看后端日志或联系技术支持。

