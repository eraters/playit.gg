# Playit.GG

> An Unofficial JavaScript Wrapper For [Playit.GG](https://playit.gg/)

## Installation

To Install, Run:

```
npm i --save playit.gg
```

## Basic Usage

```js
const Playit = require('playit.gg');

(async () => {
  // Start PlayIt
  const playit = await new playit();

  // Create A PlayIt Tunnel
  await playit.createTunnel(); // Default Is TCP On Port 80
})();
```

## API

> **_NOTE:_** All Items In This Class (Even The Constructor) Are Asyncronous

### `playit()`

Start PlayIt.

### `playit.createTunnel(opts)`

Create A Tunnel With The Provided Network Protocall, And Port

| Option | Required |                       Description                       | Default |
| :----: | :------: | :-----------------------------------------------------: | :-----: |
| proto  |    No    | Network Protocall To Use, Can Either Be `UDP`, Or `TCP` |   TCP   |
|  port  |    No    |                  Local Port To Expose                   |   80    |

## Contribution

More Features Are Soon To Come, And PRs Are Welcome!
