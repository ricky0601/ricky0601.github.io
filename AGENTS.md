# DONGGEON.LOG Project Guidelines

## Project Purpose

- 프론트엔드 개발자 한동건의 개발·트러블슈팅 기록을 위한 기술 블로그다.
- 블로그 자체도 설계, 접근성, 성능, SEO 역량을 보여주는 프로젝트로 관리한다.
- 읽기 경험과 콘텐츠 유지보수를 장식이나 불필요한 기능보다 우선한다.

## Stack

- Astro 7
- TypeScript strict mode
- Astro Content Collections
- Markdown / MDX
- CSS
- GitHub Pages + GitHub Actions

## Commands

```bash
npm run dev      # 로컬 개발 서버
npm run check    # Astro 및 TypeScript 검사
npm run build    # 검사 후 정적 사이트 빌드
npm run preview  # 프로덕션 빌드 미리보기
npx astro dev stop
```

변경 후에는 수정 범위를 직접 검증하는 가장 작은 명령을 실행한다. 콘텐츠 스키마, 라우팅 또는 레이아웃을 변경했다면 `npm run build`를 실행한다.

## Structure

```text
src/components/       재사용 UI 컴포넌트
src/layouts/          공통 페이지 및 게시글 레이아웃
src/pages/            파일 기반 라우트
src/content/posts/    Markdown 및 MDX 게시글
src/styles/           전역 디자인 토큰과 스타일
src/utils/            콘텐츠 조회 등 공통 로직
public/               파비콘, OG 이미지, robots.txt
```

## Content Rules

게시글은 `src/content/posts`에 작성하고 `src/content.config.ts`의 스키마를 따른다.

```yaml
---
title: "게시글 제목"
description: "검색 결과와 글 목록에 사용할 구체적인 설명"
publishedAt: 2026-09-21
updatedAt: 2026-09-22 # 선택
category: "Troubleshooting"
tags:
  - Astro
  - TypeScript
draft: false
image: "/images/example.png" # 선택
canonicalUrl: "https://example.com/original" # 선택
---
```

- 게시글 하나에는 대표 카테고리 하나만 지정한다.
- 태그는 검색과 분류에 실제로 도움이 되는 항목만 사용한다.
- 초안은 `draft: true`로 설정한다.
- 트러블슈팅 글은 가능하면 문제, 환경, 재현, 조사, 원인, 해결, 검증, 재발 방지 순서를 따른다.
- 확인되지 않은 해결책이나 측정하지 않은 성능 수치를 사실처럼 작성하지 않는다.

## UI Rules

- 텍스트 중심의 미니멀한 읽기 경험을 유지한다.
- 기존 CSS 변수와 간격 체계를 우선 재사용한다.
- 모든 기능은 모바일과 키보드 입력에서도 사용할 수 있어야 한다.
- 의미 없는 썸네일, 과도한 애니메이션, 자동 재생 요소를 추가하지 않는다.
- 애니메이션을 추가하면 `prefers-reduced-motion`을 지원한다.
- 클라이언트 JavaScript는 정적인 HTML/CSS로 해결할 수 없는 경우에만 추가한다.

## SEO and Accessibility

- 페이지마다 고유한 title과 description을 제공한다.
- 공개 페이지는 canonical URL을 가져야 한다.
- 게시글은 `BlogPosting`, 사이트는 `WebSite` 구조화 데이터를 유지한다.
- 한 페이지에 `h1`은 하나만 사용하고 제목 단계를 건너뛰지 않는다.
- 이미지에는 의미에 맞는 `alt`를 제공하고 크기를 최적화한다.
- 내부 링크는 실제 생성되는 정적 경로를 가리켜야 한다.
- RSS, sitemap, robots.txt를 깨뜨리는 변경을 피한다.
- 색상 대비, 포커스 표시, 스킵 링크를 유지한다.

## Scope Decisions

- 목차는 현재 보류 상태다. 실제 장문 콘텐츠가 쌓이기 전에는 추가하지 않는다.
- 검색은 게시글 수가 늘어난 뒤 정적 검색 방식으로 추가한다.
- 백엔드, 데이터베이스, 인증은 명확한 운영 요구가 생기기 전에는 도입하지 않는다.
- 새 의존성은 Astro 또는 웹 플랫폼만으로 해결할 수 없는 명확한 이유가 있을 때만 추가한다.

## Deployment

- `main` 브랜치 push 시 `.github/workflows/deploy.yml`에서 GitHub Pages로 배포한다.
- 배포 URL은 현재 `https://ricky0601.github.io`다.
- 개인 도메인을 도입하면 `astro.config.mjs`, canonical, robots.txt의 사이트 URL을 함께 변경한다.

## Rules Router

현재 프로젝트 규모에서는 이 문서를 단일 규칙 파일로 유지한다. 문서가 커지거나 영역별 규칙이 독립적으로 증가하면 `AGENTS.md`에는 경로별 문서 링크만 남기고 다음과 같이 분리한다.

```text
docs/agent-rules/content.md
docs/agent-rules/frontend.md
docs/agent-rules/seo-accessibility.md
docs/agent-rules/deployment.md
```

분리 시 작업 대상 경로와 관련된 문서만 읽도록 라우팅한다.
