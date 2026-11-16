# ✦ StudyHub — Goodnotes 學習筆記知識庫

這是一個以 **Goodnotes PDF 為來源、AGENTS.md 為 AI 開發規則** 的靜態教學網站。內容涵蓋計算機概論、資料結構與演算法、AI 與個人專題研究，所有文章都使用同一套資料格式和版型。

## 成果功能

- 響應式首頁與分類篩選
- 可搜尋標題、摘要、標籤及內文章節的即時搜尋
- 共用文章模板（`article.html?id=...`）、章節目錄、相關文章
- 深色模式、程式碼複製、學習來源註記
- 不依賴後端或資料庫，可部署 GitHub Pages

## 專案結構

```text
AGENTS.md                   AI 開發規範（先讀）
index.html                  首頁
article.html                文章共用版型
about.html                  專案說明
assets/css/style.css        全站共用樣式
assets/js/site.js           共用資料載入、搜尋、分類、渲染
data/notes.json             所有已發布筆記資料
templates/new-note.json     新增文章資料範本
scripts/validate_notes.py     自動驗證內容結構
docs/IMPORT_WORKFLOW.md     Goodnotes / Google Drive 匯入工作流程
```

## 本機執行

由於網頁使用 `fetch()` 載入 JSON，請不要只雙擊 `index.html`（部分瀏覽器會限制 `file://` 資料讀取）。

```bash
cd studyhub-goodnotes
python -m http.server 8000
```

開啟 http://localhost:8000/。

##之後使用githubpages不在本機上使用

## 新增一篇文章

1. 把 Goodnotes 匯出的 PDF 提供給 AI。
2. 讓 AI **先閱讀 `AGENTS.md`** 並辨識原始來源。
3. 參考 `templates/new-note.json`，建立新的文章資料。
4. 只在 `data/notes.json` 加一個物件，不新增一個 HTML。
5. 執行檢查與瀏覽器測試，提交 GitHub。

詳情：[`docs/IMPORT_WORKFLOW.md`](docs/IMPORT_WORKFLOW.md)。

## GitHub Pages 發布

1. 到 GitHub 建立名為 `studyhub-goodnotes` 的 Public Repository。
2. 上傳本專案**資料夾內**所有檔案，使 `index.html` 位於 repo 根目錄。
3. Settings → Pages → Deploy from a branch → main / (root) → Save。
4. GitHub 顯示部署成功後，網址通常是 `https://<你的帳號>.github.io/studyhub-goodnotes/`；**必須實際確認網址可開啟**。

## 資料使用原則

原始 PDF 不會納入此網站原始碼。公開內容是依可閱讀之筆記重新整理、補充與核實的教學文字，並於每篇文章保留原始檔名。涉及著作權、病患資料或未公開研究資料時，不應公開原文。

## 作業要求對應

| 作業項目 | 對應檔案 |
|---|---|
| 專案介紹 | README.md、about.html |
| AI 開發規則 | AGENTS.md |
| 完整可瀏覽網頁 | index.html、article.html、assets/ |
| 可重複新增的格式 | templates/new-note.json、data/notes.json |
| 後續新增流程 | docs/IMPORT_WORKFLOW.md |
| GitHub Repository、網站 URL | 完成部署後填入繳交 Word |
