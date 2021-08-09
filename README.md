# Playit.GG

> A JavaScript Wrapper For [Playit.GG](https://playit.gg/)

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

### `playit(opts)`

Start PlayIt, And Login With Provided Username And Password, Or Token

|  Option  |                  Required                   |            Description            | Default |
| :------: | :-----------------------------------------: | :-------------------------------: | :-----: |
| password |       If You Don't Provide The Token        | Password For Your Discord Account |  None   |
|  email   |       If You Don't Provide The Token        |  Email For Your Discord Account   |  None   |
|  token   | If You Don't Provide The Email, Or Password |        Your Discord Token         |  None   |

### `playit.createTunnel(opts)`

Create A Tunnel With The Provided Network Protocall, And Port

| Option | Required |                       Description                       | Default |
| :----: | :------: | :-----------------------------------------------------: | :-----: |
| proto  |    No    | Network Protocall To Use, Can Either Be `UDP`, Or `TCP` |   TCP   |
|  port  |    No    |                  Local Port To Expose                   |   80    |

### `playit.login(opts)`

Use This To Change The User Thats Logged In, With Your Discord Username, And Password

|  Option  | Required |            Description            | Default |
| :------: | :------: | :-------------------------------: | :-----: |
|  email   |   Yes    |  Email For Your Discord Account   |  None   |
| password |   Yes    | Password For Your Discord Account |  None   |

### `playit.loginWithToken(opts)`

Use This To Change The User Thats Logged In, With A Discord Token

| Option | Required |    Description     | Default |
| :----: | :------: | :----------------: | :-----: |
| token  |   Yes    | Your Discord Token |  None   |

## Contribution

More Features Are Soon To Come, And PRs Are Welcome!
