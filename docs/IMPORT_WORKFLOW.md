# Goodnotes / Google Drive → StudyHub 內容轉換流程

## 1. 匯出與選材

1. 從 Goodnotes 匯出 PDF，或在 Google Drive 找到既有 PDF。
2. 依照原資料夾分類整理來源（例如計概、資結、AI 與研究）。
3. 優先使用自有原創筆記；教科書、講義、考古題不可整份公開。
4. 不必先下載所有原始 PDF 到 GitHub。本網站只公開重新撰寫的摘要。

## 2. 交給 AI 的提示詞

```text
請先閱讀 AGENTS.md，再讀取我提供的 Goodnotes PDF。
請確認來源的章節、可辨識的概念、需人工確認的公式或圖片。
選出一個獨立主題，依 templates/new-note.json 產生一篇繁體中文教學文章。
只更新 data/notes.json，不要複製 article.html；不要直接公開原始 PDF。
請檢查 id 唯一、分類合法、搜尋可找到、文章內頁可開啟。
最後提供新增文章的 id、來源檔案、哪些內容需要核實。
```

## 3. 文章撰寫標準

- 標題明確、摘要簡潔、章節至少 2 節。
- 觀念先定義，再介紹運作流程、表格、例子或程式碼。
- AI 補充的概念與原文有出入時，標明「延伸補充／待確認」。
- 重要數據以來源與程式為準，不從 OCR 猜數字。
- 不新增重複 id，也不改寫其他筆記的連結。

## 4. 本機測試與部署

在專案根目錄執行：

```bash
python -m http.server 8000
```

開啟 http://localhost:8000/，測試分類、搜尋、單篇文章與深色模式。

GitHub 部署：建立 **Public** Repository，將專案檔案放於 main 分支根目錄；GitHub → Settings → Pages → Build and deployment → Deploy from a branch → `main` + `/(root)` → Save。待 GitHub 顯示已部署 URL，再開啟測試。

> GitHub Pages 只會呈現已提交的網站檔案。Drive 新增 PDF 不會自動同步；必須先讓 AI 依上述流程產生新資料、核對內容、提交到 GitHub，網站才會更新。
