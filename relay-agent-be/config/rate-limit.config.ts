export default () => ({
    globalRateLimit: {
      ttlMiliseconds: 60000, // miliseconds
      limit: 20,
    },
    uploadRateLimit: {
      ttlMiliseconds: 60000, // miliseconds
      limit: 5,
    },
    aptosAuthRateLimit: {
      // Nonce requests: 10 per minute per IP
      nonceLimit: {
        ttlMiliseconds: 60000, // 1 minute
        limit: 10,
      },
      // Verification attempts: 5 per minute per address
      verifyLimit: {
        ttlMiliseconds: 60000, // 1 minute
        limit: 5,
      },
      // Token refresh: 20 per hour per user
      refreshLimit: {
        ttlMiliseconds: 3600000, // 1 hour
        limit: 20,
      },
    }
  });
