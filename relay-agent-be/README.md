<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/relay-agent" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run dashboard

# e2e tests
$ pnpm run dashboard:e2e

# dashboard coverage
$ pnpm run dashboard:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## AI Tool Integration (OpenAI Responses API)

This project integrates with OpenAI's Responses API to provide AI agent capabilities for Aptos DeFi interactions. The implementation is based on the tools from [move-agent-kit](https://github.com/Metamove/move-agent-kit) and has been updated to use the new Responses API format (March 2025).

### Features

- Blockchain data retrieval (token balances, protocol data)
- Transaction preparation for various DeFi protocols
- Structured responses for DeFi operations
- Parallel tool execution

### Endpoints

- `POST /ai/message` - Chat with AI using tool calling

### Adding More Tools

To add more tools from move-agent-kit or implement custom tools, please refer to the [Function Calling Guide](./docs/FUNCTION_CALLING_GUIDE.md) for detailed instructions.

### Example Usage

```typescript
// Example query with wallet address for personalized responses
await axios.post('/ai/message', {
  query: "What's my APT balance?",
  walletAddress: "0x1b7f977f0c839b76ed94566e374f94979f365c65896c980f1952a154a787adfc"
});

// Example with conversation history
await axios.post('/ai/message', {
  messages: [
    { role: "user", content: "What's my APT balance?" },
    { role: "assistant", content: "Your APT balance is 10.5 APT." },
    { role: "user", content: "How about my USDT token balance?" }
  ],
  walletAddress: "0x1b7f977f0c839b76ed94566e374f94979f365c65896c980f1952a154a787adfc"
});
```

Response structure:
```json
{
  "response": "Your APT token balance is 25.75 APT.",
  "toolCalls": [
    {
      "id": "call_abc123",
      "name": "get_token_balance",
      "arguments": "{\"wallet\":\"0x1234...\",\"tokenAddress\":\"APT\"}"
    }
  ],
  "toolResults": [
    {
      "tool_call_id": "call_abc123",
      "output": "{\"wallet\":\"0x1234...\",\"tokenAddress\":\"0x7EeC...\",\"symbol\":\"APT\",\"balance\":\"25.75\"}"
    }
  ],
  "responseId": "resp_def456"
}
```
