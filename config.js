module.exports = {
  // Chat configuration
  chatConfig: {
    minDelay: 5000, // Minimum delay between chats (5 seconds)
    maxDelay: 15000, // Maximum delay between chats (15 seconds)
    defaultChats: 20, // Number of chats to perform per session
    maxChats: 1000, // Maximum allowed chats in one session
    retryDelay: 2000, // Delay before retrying failed requests
    numInteractions: 20, // Number of interactions to perform per session
    schedule: {
      enabled: true, // Enable/disable scheduled runs
      intervalHours: 24, // Run every X hours (1-168 hours, 168 = 1 week)
      startTime: "09:00", // Daily start time (24h format)
      maxSessionsPerDay: 3, // Maximum sessions per day
      minimumGapHours: 4, // Minimum hours between sessions
    },
  },

  // Network configuration
  networkConfig: {
    maxRetries: 5,
    timeout: 60000,
    baseURL: "https://quests-usage-dev.prod.zettablock.com/api",
    retryDelay: 5000,
    connectionTimeout: 30000,
  },

  // API configuration
  apiConfig: {
    endpoints: {
      stats: "/users/{address}/stats",
      usage: "/report_usage",
      chat: "/chat",
    },
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
      Origin: "https://agents.testnet.gokite.ai",
      Referer: "https://agents.testnet.gokite.ai/",
    },
    cors: {
      allowOrigin: "https://agents.testnet.gokite.ai",
      allowCredentials: true,
    },
  },

  // Interaction verification settings
  verificationConfig: {
    maxAttempts: 15,
    checkDelay: 3000,
    timeout: 45000,
  },
};
