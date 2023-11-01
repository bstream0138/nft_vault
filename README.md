# 코드스테이츠x서울이노베이션스퀘어 블록체인 교육
## 프로젝트 세팅

### `$ yarn`

### `.env.example`에 `EOA, Pinata, KAS` API keys를 기입(`.example 삭제`)

### (자신의 컨트랙트를 사용하려면) `/contract/CodestatesAttend.json` 파일을 `자신의 컨트랙트 ABI파일`로 변경해주세요.

<br />

## 클라이언트 실행

### `$ yarn start`

<br />

## 옵셔널 세팅

### `shift + command + x` 눌러서 `eslint extension` 설치 (optional)

### (Optional) caver 호환성 문제

```js
module.exports = {
    ...
    resolve: {
        fallback: {
            fs: false,
            net: false,
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            os: require.resolve('os-browserify/browser'),
            ...
        },
    },

    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      ...
    ],
}
```
