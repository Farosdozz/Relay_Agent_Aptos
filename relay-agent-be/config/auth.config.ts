export default () => ({
  jwtService: {
    jwtSecretKey: process.env.JWT_SECRET,
    jwtAccessTokenExpire: process.env.JWT_ACCESS_TOKEN_EXPIRE,
    jwtRefreshTokenExpire: process.env.JWT_REFRESH_TOKEN_EXPIRE,
  },
  authService: {
    signatureExpiresIn: parseInt(process.env.SIGNATURE_EXPIRES_IN, 10) || 300,
    // Twitter auth
    TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
    BASE_URL: process.env.BASE_URL,
    // Privy auth
    PRIVY_APP_ID: process.env.PRIVY_APP_ID,
    PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
    PRIVY_PUBLIC_KEY: process.env.PRIVY_PUBLIC_KEY,
  },
});
  