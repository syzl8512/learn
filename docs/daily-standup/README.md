# 每日站会记录目录

本目录用于存储每日站会记录文件。

## 文件命名规范

- 格式: `YYYY-MM-DD.md`
- 示例: `2025-10-28.md`

## 使用方法

### 1. 创建新的日报

```bash
# 手动复制模板
cp /Users/zhangliang/Desktop/英语分级阅读/docs/templates/daily-template.md /Users/zhangliang/Desktop/英语分级阅读/docs/daily-standup/$(date +%Y-%m-%d).md
```

### 2. 填写日报

- 每天 08:50 之前,所有团队成员填写个人报告部分
- 每天 09:10 之前,PM 填写汇总部分
- 09:10 开始站会讨论

### 3. 归档日报

- 站会结束后,PM 保存文件
- 确保文件名符合 `YYYY-MM-DD.md` 格式
- 推送到 Git 仓库 (如有)

## 文件组织

```
daily-standup/
├── README.md          # 本说明文件
├── 2025-10-28.md      # 第1天日报
├── 2025-10-29.md      # 第2天日报
├── 2025-10-30.md      # 第3天日报
└── ...
```

## 注意事项

1. 每天只创建一个日报文件
2. 文件名必须使用 `YYYY-MM-DD` 格式
3. 内容必须在站会前填写完成
4. PM 负责最终的文件归档和保存

## 相关文档

- [每日站会记录模板](/docs/每日站会记录模板.md)
- [周汇总目录](/docs/weekly-summary/)
- [风险记录目录](/docs/risks/)
