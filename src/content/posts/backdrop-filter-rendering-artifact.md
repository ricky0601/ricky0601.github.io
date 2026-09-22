---
title: "z-index 문제가 아니었다: backdrop-filter 렌더링 오류를 추적한 과정"
description: "카드와 테이블이 겹쳐 보이던 문제를 DOM 측정과 가설 검증으로 좁혀 Chrome의 backdrop-filter 렌더링 아티팩트로 판단하고 해결한 과정을 기록합니다."
publishedAt: 2026-09-22
category: "Troubleshooting"
tags:
  - CSS
  - Chrome
  - backdrop-filter
  - 렌더링
draft: false
---

Lost Ark 도구 프로젝트의 재련 계산 페이지에서 큰 다크 사각형이 나타났다. 사각형은 `보유 재료 입력` 카드 아래에서 `재련 재료 시세` 테이블 일부를 덮고 있는 것처럼 보였다.

처음에는 흔한 레이아웃 문제라고 생각했다. 하지만 `z-index`를 조정하고 요소의 높이를 확인해도 증상은 사라지지 않았다. 화면에 보이는 현상만 따라가기보다 가설을 하나씩 검증하면서 원인을 좁혀야 했다.

## 문제 환경과 재현 조건

문제는 Chrome 계열 브라우저에서 재련 결과 카드가 여러 개 렌더링될 때 나타났다. 해당 페이지에는 다음 요소가 연속해서 배치되어 있었다.

- 견적 합계와 단계별 테이블
- 상급 재련 예상 비용
- 접고 펼칠 수 있는 보유 재료 입력 카드
- 재련 재료 시세 테이블

각 카드는 반투명 배경과 `backdrop-filter`를 사용하는 공통 glass 스타일을 적용하고 있었다.

```css
.glass-card {
  background: rgb(255 255 255 / 0.7);
  backdrop-filter: blur(16px);
}
```

## 첫 번째 가설: dropdown의 z-index 문제

사각형이 select를 조작한 뒤 눈에 띄었기 때문에 native dropdown의 레이어가 남는 문제라고 의심했다. select를 custom dropdown으로 바꾸고, 메뉴를 `document.body`에 portal로 렌더링했다. `position: fixed`와 높은 `z-index`도 적용했다.

그러나 사각형은 그대로였다. dropdown의 레이어 문제라면 portal 처리 후에는 증상이 달라져야 했지만 변화가 없었다. 이 가설은 원인에서 제외했다.

## 두 번째 가설: accordion 높이 계산 문제

다음으로 접힘 영역의 조건부 렌더링이 아래 테이블을 제대로 밀어내지 못한다고 생각했다. 펼쳐지는 내용을 명시적인 block 요소로 감싸고, 개발자 도구에서 두 카드의 위치를 직접 측정했다.

측정 결과 `보유 재료 입력` 카드의 bottom과 `재련 재료 시세` 카드의 top 사이에는 정상적인 간격이 있었다. DOM 레이아웃은 겹치지 않았지만 화면에서만 사각형이 보였다.

이 확인으로 레이아웃 계산과 시각적인 출력 결과를 분리해서 볼 수 있었다.

## 세 번째 가설: paint 영역을 제한하면 해결될까

문제가 발생한 카드에 `contain: paint`, `isolation`, `overflow: hidden`을 적용해 그리기 영역을 제한해 보았다. 이 방법도 효과가 없었다.

오히려 `backdrop-filter`가 적용된 요소에 새로운 paint 경계를 추가하면 브라우저의 합성 레이어가 더 복잡해질 수 있었다. 해당 변경은 최종 코드에서 제거했다.

## 원인을 좁힌 결정적인 실험

마지막으로 페이지의 glass card에서 `backdrop-filter`만 임시로 비활성화했다. 그러자 같은 재현 경로에서 사각형이 사라졌다.

다음 정황을 종합해 DOM 겹침이 아니라 Chrome 계열 브라우저의 compositor paint artifact로 판단했다.

- 사각형 크기가 실제 accordion 영역과 일치하지 않았다.
- DOM 좌표를 측정했을 때 요소는 겹치지 않았다.
- portal과 `z-index` 변경이 결과에 영향을 주지 않았다.
- `backdrop-filter`를 끄자 증상이 해소됐다.

브라우저 내부 동작을 직접 증명한 것은 아니므로 단정할 수는 없다. 다만 여러 개의 blur 카드와 table, accordion, rounded 영역이 밀집된 조건에서 합성된 blur surface가 잘못 남은 것으로 보는 것이 관찰 결과에 가장 잘 맞았다.

## 전역 효과를 유지하면서 해결하기

공통 `.glass-card` 스타일을 제거하면 다른 페이지의 디자인까지 달라진다. 문제가 발생한 재련 계산 페이지에만 scope class를 추가하고, 그 안에서 blur를 비활성화했다.

```css
.enhancement-page .glass-card {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  background-color: rgb(255 255 255 / 0.86);
}

html.dark .enhancement-page .glass-card {
  background-color: rgb(22 27 34 / 0.92);
}
```

blur를 제거한 대신 배경의 불투명도를 높여 기존 glass card와 시각적인 차이를 줄였다. 수정 범위를 문제 페이지로 제한하면서 다른 화면의 glass 효과는 유지할 수 있었다.

## 검증

수정 후에는 다음 항목을 확인했다.

- 동일한 계산 조건에서 다크 사각형이 다시 나타나지 않는지 확인
- 테이블과 accordion의 배치가 정상인지 확인
- 라이트 모드와 다크 모드의 카드 가독성 확인
- 프로덕션 빌드 성공 확인

## 이번 문제에서 배운 점

화면이 겹쳐 보인다고 해서 항상 레이아웃이나 `z-index` 문제인 것은 아니다. DOM 좌표가 정상이라면 브라우저의 paint와 compositing 단계도 의심해야 한다.

비슷한 현상을 다시 만난다면 다음 순서로 확인할 것이다.

1. 요소의 실제 좌표를 측정해 DOM이 겹치는지 확인한다.
2. portal이나 overlay가 남아 있는지 확인한다.
3. `backdrop-filter`, `transform`, `contain`처럼 합성 레이어를 만드는 속성을 하나씩 끈다.
4. 원인이 확인되면 전역 스타일보다는 문제가 발생한 영역에만 수정 범위를 제한한다.

가설을 세우는 것보다 중요한 것은 각 가설을 빠르게 제외할 수 있는 실험을 만드는 일이었다. 이번에는 `backdrop-filter` 하나를 끄는 작은 실험이 문제의 층위를 레이아웃에서 렌더링으로 바꾸는 결정적인 단서가 됐다.
