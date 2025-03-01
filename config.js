module.exports = {
    // Chat configuration
    chatConfig: {
        minDelay: 5000,     // Minimum delay between chats (5 seconds)
        maxDelay: 15000,    // Maximum delay between chats (15 seconds)
        defaultChats: 20,   // Number of chats to perform
        maxChats: 1000,     // Maximum allowed chats in one session
        retryDelay: 2000,   // Delay before retrying failed requests
        numInteractions: 20 // Number of interactions to perform
    },
    
    // Network configuration
    networkConfig: {
        maxRetries: 5,         // Increased retries
        timeout: 60000,        // Increased timeout to 60 seconds
        baseURL: 'https://quests-usage-dev.prod.zettablock.com/api',  // Updated API URL
        retryDelay: 5000,      // Retry delay for failed requests
        connectionTimeout: 30000 // Increased connection timeout
    },

    // API configuration
    apiConfig: {
        endpoints: {
            stats: '/users/{address}/stats',
            usage: '/report_usage',
            chat: '/chat'
        },
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Origin': 'https://agents.testnet.gokite.ai',
            'Referer': 'https://agents.testnet.gokite.ai/'
        },
        cors: {
            allowOrigin: 'https://agents.testnet.gokite.ai',
            allowCredentials: true
        }
    },

    // Interaction verification settings
    verificationConfig: {
        maxAttempts: 15,      // Increased max attempts
        checkDelay: 3000,     // Increased delay between checks
        timeout: 45000        // Increased total timeout
    }
};