# Playit.GG

> An Unofficial JavaScript Wrapper For [PlayIt.GG](https://playit.gg/)

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

## CLI

To Install The CLI, Run:

```bash
npm install -g playit.gg
```

### Options

```
Usage: PlayIt --proto [Network Protocol] --port [Port]

Options:
  -V, --version  output the version number
  -p, --port     port to expose. must be between 0 and 65535 (default: 80)
  --proto        network protocol to expose. can either be TCP or UDP (default: "TCP")
  -h, --help     display help for command
```

## API

> **_NOTE:_** All Items In This Class Are Asyncronous

### `playit(startOpts?: startOpts): Promise<playit>`

Start PlayIt.

|   Option   | Required |            Description            | Default |
| :--------: | :------: | :-------------------------------: | :-----: |
| playitOpts |    No    | Options To Put In The `.env` File |  `{}`   |

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

### `playit.download(pcOS?: os): Promise<string>`

Download The Correct PlayIt Binary For The OS. Returns The Filename Of The Binary

| Option | Required |                        Description                         |   Default   |
| :----: | :------: | :--------------------------------------------------------: | :---------: |
|  pcOS  |    No    | The OS Of The Binary. Can Either Be `mac`, `win`, or `lin` | `playit.os` |

### `playit.stop(): void`

> This Is The Only Item In The Class That Is Syncronous.

Stops The PlayIt Binary And Removes It. PlayIt Is Unusable After You Call This Function.

## Plugins

To Use A Plugin, Initialize It With The PlayIt Object

```js
const PlayIt = require('playit.gg');
const myPlugin = require('playit-plugin-myplugin');

(async () => {
  // Start PlayIt
  const playit = await PlayIt();

  // Initialize The Plugin With The PlayIt Object
  const plugin = await myPlugin(playit);
  // You Can Use The Plugin, Using The Plugin's Documentation
})();
```

## Contribution

More Features Are Soon To Come, And PRs Are Welcome!
