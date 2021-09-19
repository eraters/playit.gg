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

Or Download From The [Releases](https://github.com/TheBotlyNoob/playit.gg/releases/latest)

### Options

```
Usage: PlayIt --proto [Network Protocol] --port [Port]

Options:
  -V, --version  output the version number
  -p, --port     port to expose. must be between 0 and 65535 (default: 80)
  --proto        network protocol to expose. can either be TCP or UDP (default: "TCP")
  -n, --no-gui   disables the tui interface
  -h, --help     display help for command
```

## API

> Most Items In This Module Are Asynchronous

### Exports

#### `PlayIt`

The Bare [PlayIt](#methods) Class

|  Type   | Returns  |
| :-----: | :------: |
| `Class` | `PlayIt` |

Example:

##### `default`

The Function That Starts The PlayIt Class

|    Type    | Async  |
| :--------: | :----: |
| `Function` | `true` |

### Methods

## Contribution

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/TheBotlyNoob/playit.gg)

More Features Are Soon To Come, And PRs Are Welcome!
