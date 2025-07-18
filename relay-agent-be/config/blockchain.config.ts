export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  blockchain: {
    environment: process.env.ENVIRONMENT || 'TESTNET',
  }
});
