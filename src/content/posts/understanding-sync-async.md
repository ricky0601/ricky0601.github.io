---
title: "async와 await를 붙이면 비동기일까? 동기와 비동기 다시 이해하기"
description: "동기와 비동기에 대한 오해에서 출발해 실행 순서로 차이를 확인하고, 콜백·Promise·async/await의 관계와 await가 기다리는 범위를 정리합니다."
publishedAt: 2026-11-05
category: "JavaScript"
tags:
  - JavaScript
  - 비동기
  - Promise
draft: false
---

비동기에 대해 설명하려고 했을 때, 내가 알고 있던 내용은 이랬다.

- 비동기는 함수에 `async`와 `await`를 붙이는 것이다.
- API 함수에서 콜백을 반환받고, 그 콜백을 안전하게 받기 위해 기다리는 것이다.
- 동기는 기다리지 않고 병렬적으로 내 할 일을 하는 것이다.

하지만 이 설명에는 서로 다른 개념이 섞여 있었다. 동기와 비동기의 동작을 반대로 이해한 부분도 있었고, 콜백과 반환값을 혼동한 부분도 있었다.

특히 한 가지가 헷갈렸다. **비동기는 기다리지 않는 방식이라고 하는데, 왜 `await`로 기다리는 걸까?**

이 글에서는 JavaScript를 기준으로 실행 순서를 확인하며 이 질문을 풀어본다. 다른 언어의 비동기 문법과 실행 모델까지 모두 같다는 의미는 아니다.

## 1. 동기는 앞선 작업이 끝난 뒤 다음 작업을 진행한다

먼저 다음 코드의 실행 순서를 생각해 보자.

```js
console.log("첫 번째 작업");
console.log("두 번째 작업");
console.log("세 번째 작업");
```

출력은 작성한 순서와 같다.

```text
첫 번째 작업
두 번째 작업
세 번째 작업
```

동기적인 실행에서는 앞선 작업을 마친 다음 다음 작업으로 넘어간다. 앞선 함수가 오래 걸리는 계산을 수행한다면, 그 함수가 반환하기 전에는 뒤의 코드로 넘어가지 못한다.

따라서 내가 생각했던 "기다리지 않고 내 할 일을 한다"는 설명은 동기에 맞지 않았다.

## 2. 비동기는 작업을 시작한 시점과 완료를 처리하는 시점을 분리한다

서버에 데이터를 요청하면 응답이 돌아오기까지 시간이 걸린다. 이때 요청 결과가 도착할 때까지 현재 실행 흐름을 붙잡아 두는 대신, 완료 처리를 나중으로 이어갈 수 있다.

네트워크 없이 실행 순서를 확인하기 위해 `setTimeout`을 사용해 보자. 각 예제는 독립적으로 실행한다.

```js
console.log("작업 시작");

setTimeout(() => {
  console.log("나중에 처리할 작업");
}, 0);

console.log("다른 작업");
```

출력은 다음과 같다.

```text
작업 시작
다른 작업
나중에 처리할 작업
```

지연 시간을 `0`으로 지정해도 콜백이 즉시 실행되는 것은 아니다. 타이머는 콜백을 나중에 실행하도록 예약하며, 현재 실행 중인 동기 코드가 먼저 끝난다. 지정한 시간에 정확히 실행된다는 보장도 없다.

핵심은 **시작한 순서와 완료를 처리하는 순서가 반드시 같지는 않다**는 점이다. 여기서 "다른 작업을 한다"는 말은 기다리는 동안 다음 코드를 실행할 수 있다는 뜻이지, 두 JavaScript 함수가 반드시 동시에 실행된다는 뜻은 아니다.

## 3. 콜백, Promise, async/await는 어떤 관계일까?

### 콜백: 작업이 끝나면 호출할 함수를 전달한다

앞의 `setTimeout` 예제에서 화살표 함수는 콜백이다. 함수를 반환받은 것이 아니라, 나중에 호출해 달라고 인자로 전달했다.

다만 **콜백 자체가 비동기를 뜻하지는 않는다.** 배열의 `map`에 전달하는 함수처럼 동기적으로 실행되는 콜백도 있다. 콜백은 다른 함수에 전달하는 함수이고, 언제 호출하는지는 그 API의 동작에 달려 있다.

### Promise: 미래의 결과를 나타내는 객체를 반환받는다

Promise는 비동기 작업의 성공이나 실패를 나타내는 객체다. 처음에는 대기 중인 `pending` 상태이고, 이후 성공한 `fulfilled` 또는 실패한 `rejected` 상태로 결정된다.

다음 함수는 서버 요청 대신 타이머를 사용해, 나중에 결과가 준비되는 상황을 재현한다.

```js
function getMessage() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("응답 도착");
    }, 0);
  });
}

console.log("요청 시작");

getMessage().then((message) => {
  console.log(message);
});

console.log("다른 작업");
```

출력은 다음과 같다.

```text
요청 시작
다른 작업
응답 도착
```

`getMessage()`는 문자열을 바로 반환하지 않고 Promise를 반환한다. 성공한 결과는 `.then()`에 전달한 함수에서 사용한다. Promise를 사용해도 콜백이 사라지는 것은 아니다.

또한 Promise로 감쌌다고 모든 코드가 나중에 실행되는 것은 아니다. `new Promise`에 전달한 함수는 생성 시점에 동기적으로 실행된다. 이 예제에서 완료를 뒤로 미루는 것은 그 안에서 사용하는 타이머다.

### async/await: Promise를 다루는 코드를 순서대로 읽게 한다

같은 작업을 `async`와 `await`로 표현할 수도 있다.

```js
function getMessage() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("응답 도착");
    }, 0);
  });
}

async function loadMessage() {
  console.log("요청 시작");

  const message = await getMessage();
  console.log(message);
}

loadMessage();
console.log("다른 작업");
```

이 코드도 `요청 시작 → 다른 작업 → 응답 도착` 순서로 출력된다.

- `async` 함수는 항상 Promise를 반환한다.
- `await`는 Promise가 완료될 때까지 현재 비동기 함수의 진행을 잠시 멈춘다.
- 성공하면 결과값을 받고, 실패하면 해당 위치에서 예외가 발생한다.

`await`에는 일반 값도 사용할 수 있지만, 여기서는 Promise의 결과를 기다리는 경우에 집중한다.

비동기 작업을 처리하려면 반드시 `async`와 `await`를 써야 하는 것은 아니다. 앞의 예제처럼 콜백이나 Promise의 `.then()`을 사용할 수도 있다.

## 4. await는 프로그램 전체가 아니라 현재 함수의 진행을 기다리게 한다

앞의 예제에서 `loadMessage()`는 `await` 이전까지 실행된다. 이후 결과를 기다리는 동안 호출한 쪽으로 제어가 돌아가고, 바깥의 `console.log("다른 작업")`가 실행된다. Promise가 성공하면 `await` 뒤의 코드가 이어진다.

따라서 "기다리는데 왜 비동기일까?"라는 질문에는 이렇게 답할 수 있다.

> 결과가 필요한 함수의 다음 단계는 기다리되, 그 기다림 때문에 현재 JavaScript 실행 흐름 전체를 붙잡아 두지는 않기 때문이다.

`async`를 붙인다고 함수의 모든 코드가 백그라운드로 이동하는 것도 아니다. `async` 함수 안에서 오래 걸리는 동기 계산을 실행하면, 그 계산을 실행하는 동안 같은 스레드의 다른 JavaScript 작업은 진행하지 못한다.

실제 HTTP 요청에서도 같은 방식으로 결과를 이어서 처리한다.

```js
// /api/posts가 JSON 응답을 제공하는 환경을 가정한 예제다.
async function loadPosts() {
  try {
    const response = await fetch("/api/posts");

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const posts = await response.json();
    console.log(posts);
  } catch (error) {
    console.error("게시글을 불러오지 못했습니다.", error);
  }
}
```

`fetch()`가 반환하는 것은 콜백이 아니라 Promise다. 첫 번째 `await`는 응답 객체를 받을 때까지 기다리고, 두 번째 `await`는 응답 본문을 읽고 JSON으로 해석한 결과를 기다린다.

이 예제의 `/api/posts`는 설명용 주소이며, 이 블로그가 제공하는 API가 아니다. 위 코드는 함수를 정의한 것이므로 실제 요청은 `loadPosts()`를 호출할 때 시작된다.

그리고 **`await`는 결과를 안전하게 만들어 주는 장치가 아니다.** 네트워크 오류나 JSON 해석 실패는 별도로 처리해야 한다. `fetch()`는 HTTP 404나 500 응답만으로 Promise를 거부하지 않으므로, HTTP 성공 여부도 `response.ok`로 확인한다.

## 5. 비동기와 병렬은 다르다

처음에는 "기다리지 않는다"와 "동시에 실행한다"를 비슷하게 생각했다. 하지만 둘은 구분해야 한다.

- **비동기**: 작업을 시작한 뒤, 완료 처리를 나중으로 이어갈 수 있는 방식
- **병렬**: 여러 작업을 실제로 동시에 실행하는 것

일반적인 브라우저 페이지의 메인 스레드에서는 JavaScript 작업이 한 번에 하나씩 실행된다. 네트워크 요청이나 타이머를 브라우저 환경에 맡기고, 결과를 처리할 JavaScript는 나중에 실행할 수 있다. 비동기 처리가 가능하다고 해서 여러 JavaScript 함수가 같은 메인 스레드에서 동시에 실행되는 것은 아니다.

무거운 JavaScript 계산을 별도의 스레드에서 실행하려면 Web Worker 같은 별도의 수단을 고려해야 한다. 함수에 `async`를 붙이는 것만으로 병렬 실행이 되지는 않는다.

## 6. 다시 정리한 나의 이해

처음의 설명은 다음처럼 바꿀 수 있다.

| 처음의 이해 | 다시 정리한 이해 |
| --- | --- |
| 동기는 기다리지 않고 내 할 일을 한다 | 동기 실행은 앞선 작업이 끝난 뒤 다음 작업으로 넘어간다 |
| 비동기는 async와 await를 붙이는 것이다 | async/await는 Promise 기반 비동기 결과를 다루는 문법이다 |
| API에서 콜백을 반환받는다 | 콜백 방식은 함수를 전달하고, Promise 방식은 미래 결과를 나타내는 객체를 반환받는다 |
| await는 결과를 안전하게 받게 해 준다 | await는 완료를 기다리며, 실패에 대한 처리는 별도로 필요하다 |
| 비동기는 곧 병렬이다 | 비동기라고 반드시 여러 작업이 동시에 실행되는 것은 아니다 |

이제 `await`를 보면 단순히 "기다린다"고 생각하기보다, **어떤 함수가 무엇을 기다리고, 그동안 어떤 코드는 계속 실행될 수 있는지**를 먼저 살펴보려고 한다.

## 참고 자료

- [MDN: JavaScript 비동기 소개](https://developer.mozilla.org/ko/docs/Learn_web_development/Extensions/Async_JS/Introducing)
- [MDN: Promise](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN: async function](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: await](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/await)
- [MDN: Fetch API 사용하기](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch)
