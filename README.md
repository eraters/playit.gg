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
Usage: PlayIt --tunnels <Port:Proto...>

Options:
  -V, --version                  output the version number
  -t, --tunnels <Port:Proto...>  tunnels to create with the specified port and prototype
  -e, --envs <Name:Value...>     environment options for playit
  -h, --help                     display help for command
```

## API

> Most Items In This Module Are Asynchronous

### Exports

#### The Default Export

|    Type    | Async | Returns  |             Description              |
| :--------: | :---: | :------: | :----------------------------------: |
| `Function` |  Yes  | `PlayIt` | The Started [PlayIt](#methods) Class |

Example:

```js
const PlayIt = require('playit.gg');

(async () => {
  const playit = await PlayIt(); // Start PlayIt
})();
```

#### `PlayIt`

> PlayIt Will Not Work Unless You Run The `.start` Method

|  Type   | Async | Returns  |              Description               |
| :-----: | :---: | :------: | :------------------------------------: |
| `Class` |  No   | `PlayIt` | The Unstarted [PlayIt](#methods) Class |

Example:

```js
const { PlayIt } = require('playit.gg');

let playit = new PlayIt();

(async () => {
  // Do whatever you want before starting PlayIt
  // The reason you might want to do this is to use some Methods PlayIt provides before starting it
  // As it takes a few seconds to start
  playit = await playit.start(); // Start PlayIt
})();
```

### Interfaces

TODO

### Methods

TODO

## Contribution

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/TheBotlyNoob/playit.gg)

More Features Are Soon To Come, And PRs Are Welcome!
