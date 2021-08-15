# Playit.GG

> An Unofficial JavaScript Wrapper For [PlayIt.GG](https://playit.gg/)

## For CS50x

### Video Demo: **_TODO_**

### Description: An Unofficial JavaScript Wrapper For [Playit.GG](https://playit.gg/)

### Now, For The Files

#### `index.js`

This is the main file for this project. Containing the class, and all of the functions.

### Description

This project is a JavaScript wrapper around [PlayIt.GG](https://playit.gg/) and its API.

PlayIt is an application that creates tunnels to a specified port and protocall. It can be used to expose web servers or other services.

## Installation

To Install, Run:

```
npm i --save playit.gg
```

## Basic Usage

```js
const PlayIt = require('playit.gg');

(async () => {
  // Start PlayIt
  const playit = await PlayIt();

  // Create A PlayIt Tunnel
  const tunnel = await playit.createTunnel(); // Default Is TCP On Port 80

  console.log(`http://${tunnel.url}`); // Print the tunnel url
})();
```

## API

> **_NOTE:_** All Items In This Class Are Asyncronous

### `playit(opts?: startOpts): Promise<playit>`

Start PlayIt.

|   Option   | Required |            Description            |  Default   |
| :--------: | :------: | :-------------------------------: | :--------: |
| playitOpts |    No    | Options To Put In The `.env` File |    `{}`    |
|   plugin   |    No    |     A Plugin To Add To PlayIt     | `() => {}` |

### `playit.createTunnel(tunnelOpts?: tunnelOpts): Promise<Object>`

Create A Tunnel With The Provided Network Protocall, And Port.

| Option | Required |                       Description                       | Default |
| :----: | :------: | :-----------------------------------------------------: | :-----: |
| proto  |    No    | Network Protocall To Use, Can Either Be `UDP`, Or `TCP` |  `TCP`  |
|  port  |    No    |                  Local Port To Expose                   |  `80`   |

### `playit.disableTunnel(id: number): Promise<void>`

Disable The Specified Tunnel. Only Works If The Tunnel Is Enabled.

| Option | Required |           Description           | Default |
| :----: | :------: | :-----------------------------: | :-----: |
|   id   |   Yes    | The Id Of The Tunnel To Disable |  None   |

### `playit.enableTunnel(id: number): Promise<void>`

Enable The Specified Tunnel. Only Works If The Tunnel Is Disabled.

| Option | Required |          Description           | Default |
| :----: | :------: | :----------------------------: | :-----: |
|   id   |   Yes    | The Id Of The Tunnel To Enable |  None   |

## Contribution

More Features Are Soon To Come, And PRs Are Welcome!
