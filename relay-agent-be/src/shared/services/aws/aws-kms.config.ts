import * as process from 'process';
export default () => ({
  awsKmsService: {
    keyAlias: process.env.ENCRYPT_KEY_ALIAS,
  },
});
