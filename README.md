# DONGGEON.LOG

프론트엔드 개발자 한동건의 개발과 문제 해결 기록입니다. Astro와 TypeScript로 제작하고 GitHub Pages에 배포합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 검증 및 빌드

```bash
npm run check
npm run build
```

## 게시글 작성

`src/content/posts`에 Markdown 또는 MDX 파일을 추가합니다.

```yaml
---
title: "게시글 제목"
description: "검색 결과와 글 목록에 표시될 설명"
publishedAt: 2026-09-21
updatedAt: 2026-09-22
category: "Troubleshooting"
tags:
  - Astro
  - TypeScript
draft: false
---
```

`draft: true`인 글은 목록, RSS 및 프로덕션 빌드에서 제외됩니다.

## 배포

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 사이트를 빌드하여 GitHub Pages에 배포합니다. 저장소의 **Settings → Pages → Source**는 `GitHub Actions`로 설정해야 합니다.
