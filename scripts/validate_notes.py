#!/usr/bin/env python3
"""Validate StudyHub data/notes.json without third-party packages."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "data" / "notes.json"
ALLOWED_CATEGORIES = {"cs", "ds", "ai"}
REQUIRED = {"id", "category", "title", "subtitle", "level", "minutes", "summary", "tags", "source", "sourceType", "updated", "sections"}

def main():
    try:
        notes = json.loads(path.read_text(encoding="utf-8"))
        assert isinstance(notes, list), "根節點必須是陣列"
        ids = set()
        for idx, note in enumerate(notes, 1):
            assert isinstance(note, dict), f"第 {idx} 筆不是物件"
            missing = REQUIRED - note.keys()
            assert not missing, f"第 {idx} 筆缺少: {sorted(missing)}"
            uid = note['id']
            assert isinstance(uid, str) and re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', uid), f"ID 格式不合法: {uid}"
            assert uid not in ids, f"ID 重複: {uid}"
            ids.add(uid)
            assert note['category'] in ALLOWED_CATEGORIES, f"分類不合法: {uid}"
            assert isinstance(note['minutes'], int) and note['minutes'] > 0, f"分鐘數不合法: {uid}"
            assert isinstance(note['tags'], list) and len(note['tags']) >= 2, f"標籤不足: {uid}"
            assert isinstance(note['sections'], list) and len(note['sections']) >= 2, f"章節不足: {uid}"
            for j, section in enumerate(note['sections'], 1):
                assert isinstance(section.get('heading'),str) and section['heading'].strip(), f"章節標題缺失: {uid}/{j}"
                assert any(section.get(x) for x in ('paragraphs','bullets','example','code','table')), f"章節沒有內容: {uid}/{j}"
                if section.get('table'):
                    t = section['table'];count = len(t['headers'])
                    assert count > 0 and all(len(row) == count for row in t['rows']), f"表格欄位不一致: {uid}/{j}"
        print(f"驗證通過：{len(notes)} 篇筆記，{sum(len(n['sections']) for n in notes)} 個章節。")
        return 0
    except (ValueError, AssertionError, KeyError, OSError, TypeError) as exc:
        print(f"驗證失敗：{exc}", file=sys.stderr)
        return 1

if __name__ == '__main__':
    raise SystemExit(main())
