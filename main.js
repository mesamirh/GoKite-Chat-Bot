require("dotenv").config();
const { Web3 } = require("web3");
const axios = require("axios");
const config = require("./config");
const { URL } = require("url");

const API_BASE_URL = "https://quests-usage-dev.prod.zettablock.com/api";
const INFURA_API_KEY = "9906d191c4034f348b46be77e83360d9";
const INFURA_ENDPOINT = `https://goerli.infura.io/v3/${INFURA_API_KEY}`;

// const DEBUG = process.env.DEBUG === 'true';

// Emoji constants
const EMOJI = {
  SUCCESS: "✅",
  ERROR: "❌",
  WALLET: "👛",
  STATS: "📊",
  CHAT: "💬",
  WAIT: "⏳",
  WARNING: "⚠️",
  DONE: "🎉",
  BOT: "🤖",
  RETRY: "🔄",
};

const AGENTS = [
  {
    id: "deployment_R89FtdnXa7jWWHyr97WQ9LKG",
    name: "Professor",
    endpoint:
      "https://deployment-r89ftdnxa7jwwhyr97wq9lkg.stag-vxzy.zettablock.com",
    prompts: [
      "What is Kite AI?",
      "How does proof of AI work?",
      "Explain the Kite AI ecosystem",
      "What are the benefits of using Kite AI?",
      "How does Kite AI ensure data privacy?",
      "What makes Kite AI different from other AI platforms?",
      "How can developers integrate with Kite AI?",
      "What is the future roadmap of Kite AI?",
      "How does Kite AI handle model training?",
      "Can you explain the tokenomics of Kite AI?",
    ],
  },
  {
    id: "deployment_fseGykIvCLs3m9Nrpe9Zguy9",
    name: "Crypto Buddy",
    endpoint:
      "https://deployment-fsegykivcls3m9nrpe9zguy9.stag-vxzy.zettablock.com",
    prompts: [
      "What is the current price of Bitcoin?",
      "Show me the top movers today",
      "How is the crypto market performing?",
      "What are the trending cryptocurrencies?",
      "What's the market sentiment for Ethereum?",
      "Which coins have the highest trading volume?",
      "What are the best performing DeFi tokens?",
      "How is the NFT market doing?",
      "Which Layer 2 solutions are trending?",
      "What are the upcoming significant crypto events?",
    ],
  },
  {
    id: "deployment_xkerJnNBdTaZr9E15X3Y7FI8",
    name: "Sherlock",
    endpoint:
      "https://deployment-xkerjnnbdtazr9e15x3y7fi8.stag-vxzy.zettablock.com",
    prompts: [
      "What do you think of this transaction? 0x252c02bded9a24426219248c9c1b065b752d3cf8bedf4902ed62245ab950895b",
      "Can you analyze recent suspicious transactions?",
      "What are common fraud patterns in crypto?",
      "How to identify suspicious wallet activities?",
      "What are the latest security threats in DeFi?",
      "How to protect against smart contract exploits?",
      "What are common rug pull indicators?",
      "How to verify contract security?",
      "What are recent major security incidents?",
      "How to secure my crypto assets?",
    ],
  },
];

class KiteAIBot {
  constructor() {
    this.web3 = new Web3(INFURA_ENDPOINT);
    this.account = null;
    this.debug = true;
    this.unavailableAgents = new Set(); // Track unavailable agents
  }

  // Add method to mark agent as unavailable
  markAgentUnavailable(agentId) {
    this.unavailableAgents.add(agentId);
    const agent = AGENTS.find((a) => a.id === agentId);
    this.log(`${agent.name} is unavailable and will be skipped`, "warning");
  }

  // Add method to get available agents
  getAvailableAgents() {
    return AGENTS.filter((agent) => !this.unavailableAgents.has(agent.id));
  }

  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();

    switch (type) {
      case "error":
        console.log(`❌ ${message}`);
        break;
      case "warning":
        console.log(`⚠️  ${message}`);
        break;
      case "success":
        console.log(`✅ ${message}`);
        break;
      case "stats":
        console.log(`📊 ${message}`);
        break;
      case "chat":
        console.log(`💬 ${message}`);
        break;
      case "wait":
        console.log(`⏳ ${message}`);
        break;
      default:
        console.log(`🤖 ${message}`);
    }
  }

  debugLog(message) {
    if (
      message.startsWith("Response size:") ||
      message.startsWith("Request size:")
    ) {
      this.log(message, "info");
    }
  }

  async initialize() {
    try {
      const privateKey = process.env.WALLET_PRIVATE_KEY.startsWith("0x")
        ? process.env.WALLET_PRIVATE_KEY
        : `0x${process.env.WALLET_PRIVATE_KEY}`;

      // Setup wallet from private key
      this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      this.web3.eth.accounts.wallet.add(this.account);
      this.log(
        `${EMOJI.WALLET} Wallet initialized: ${this.account.address}`,
        "success"
      );

      // Get user stats
      await this.getUserStats();
    } catch (error) {
      this.log(`Initialization failed: ${error.message}`, "error");
      throw error;
    }
  }

  async getUserStats() {
    try {
      const statsEndpoint = `${
        config.networkConfig.baseURL
      }/user/${this.account.address.toLowerCase()}/stats`;
      this.log("Checking user stats...", "stats");

      const response = await axios.get(statsEndpoint, {
        headers: {
          ...config.apiConfig.headers,
          "X-Wallet-Address": this.account.address.toLowerCase(),
        },
        timeout: config.networkConfig.timeout,
      });

      if (response.data) {
        const stats = response.data;
        this.log(`Total interactions: ${stats.total_interactions}`, "stats");
        return stats;
      }
      return null;
    } catch (error) {
      if (error.response?.status === 404) {
        this.log("No previous interactions found", "warning");
      } else {
        this.log(`Failed to fetch stats: ${error.message}`, "error");
      }
      return null;
    }
  }

  async waitForInteractionUpdate(currentTotal, maxAttempts = 10, delay = 2000) {
    this.log("Verifying interaction...", "wait");

    for (let i = 0; i < maxAttempts; i++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, delay));
        const stats = await this.getUserStats();

        if (stats?.total_interactions > currentTotal) {
          this.log(
            `Interaction recorded (Total: ${stats.total_interactions})`,
            "success"
          );
          return true;
        }

        if (i === maxAttempts - 1) {
          this.log("Failed to verify interaction", "error");
        }
      } catch (error) {
        this.log("Failed to verify interaction", "error");
      }
    }
    return false;
  }

  async sendMessage(agentId, message) {
    if (this.unavailableAgents.has(agentId)) {
      this.log(
        `Skipping unavailable agent: ${
          AGENTS.find((a) => a.id === agentId)?.name
        }`,
        "warning"
      );
      return null;
    }

    try {
      const agent = AGENTS.find((a) => a.id === agentId);
      if (!agent) {
        throw new Error(`Agent not found`);
      }

      const beforeStats = await this.getUserStats();
      const currentTotal = beforeStats?.total_interactions || 0;

      this.log(`Sending message to ${agent.name}...`, "chat");

      try {
        const endpoint = new URL("/main", agent.endpoint).toString();
        const response = await axios.post(
          endpoint,
          {
            message: message,
            stream: false,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-Wallet-Address": this.account.address.toLowerCase(),
            },
            timeout: 10000,
          }
        );

        if (response?.data) {
          this.log(`Got response from ${agent.name}`, "success");
          const content = response.data.choices?.[0]?.message?.content;
          if (content) {
            this.log(`Response: ${content.slice(0, 100)}...`, "chat");
          }

          await this.reportUsage(agentId, message, response.data);
          const updated = await this.waitForInteractionUpdate(currentTotal);

          return {
            response: response.data,
            interactionRecorded: updated,
          };
        }
      } catch (error) {
        this.log(`${agent.name} appears to be offline`, "error");
        this.markAgentUnavailable(agentId);
        return null;
      }

      return null;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  async reportUsage(agentId, message, response) {
    try {
      this.log("Recording interaction...", "info");
      const startTime = Date.now();

      const responseText =
        typeof response === "string"
          ? response
          : response.choices?.[0]?.message?.content || "";

      const payload = {
        wallet_address: this.account.address.toLowerCase(),
        agent_id: agentId,
        request_text: message,
        response_text: responseText,
        ttft: Date.now() - startTime,
        total_time: Date.now() - startTime,
        request_metadata: {
          timestamp: new Date().toISOString(),
          agent_name: AGENTS.find((a) => a.id === agentId)?.name,
        },
      };

      const result = await this.handleRetry(async () => {
        const response = await axios.post(
          `${config.networkConfig.baseURL}/report_usage`,
          payload,
          {
            headers: {
              ...config.apiConfig.headers,
              "X-Wallet-Address": this.account.address.toLowerCase(),
            },
            timeout: config.networkConfig.timeout,
          }
        );
        return response.data;
      });

      if (result) {
        this.log("Interaction recorded", "success");
        return true;
      }
      return false;
    } catch (error) {
      this.handleError(error, "Usage reporting");
      return false;
    }
  }

  handleError(error, context = "Request") {
    if (error.response) {
      this.log(
        `${context} failed: ${error.response.status} - ${
          error.response?.data?.detail || "No details"
        }`,
        "error"
      );
    } else if (error.request) {
      this.log(`${context} failed: Connection error`, "error");
      if (error.code) {
        this.log(`Error type: ${error.code}`, "error");
      }
    } else {
      this.log(`${context} failed: ${error.message}`, "error");
    }
  }

  async handleRetry(operation, maxRetries = 3, delay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;

        if (error.code) {
          this.log(`Error type: ${error.code}`, "error");
        }

        if (isLastAttempt) {
          throw error;
        }

        const waitTime = delay * attempt;
        this.log(
          `Retry ${attempt}/${maxRetries} in ${waitTime / 1000}s...`,
          "warning"
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  async pollForResponse(conversationId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/chat/${conversationId}`,
          {
            timeout: config.networkConfig.timeout,
          }
        );

        if (response.data.status === "completed") {
          console.log("Bot response:", response.data.response);
          return response.data;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.response?.status === 404) {
          console.error("Conversation not found");
          return null;
        }
        console.error("Polling error:", error.message);
        if (i < maxAttempts - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, config.chatConfig.retryDelay)
          );
          continue;
        }
        return null;
      }
    }
    console.error("Timeout waiting for response");
    return null;
  }

  async selectNextAgent(currentAgent = null) {
    const availableAgents = this.getAvailableAgents();

    if (availableAgents.length === 0) {
      return null;
    }

    const candidates = currentAgent
      ? availableAgents.filter((a) => a.id !== currentAgent.id)
      : availableAgents;

    const pool = candidates.length > 0 ? candidates : availableAgents;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

async function main() {
  const numberOfChats = config.chatConfig.numInteractions;
  console.log(
    `\n${EMOJI.BOT} Starting bot with ${numberOfChats} interactions...\n`
  );

  const bot = new KiteAIBot();
  try {
    await bot.initialize();
  } catch (error) {
    console.error(`${EMOJI.ERROR} Failed to initialize bot:`, error);
    process.exit(1);
  }

  let successfulChats = 0;
  let failedChats = 0;
  let recordedInteractions = 0;
  let skippedAgents = 0;

  const initialStats = await bot.getUserStats();
  const startingTotal = initialStats?.total_interactions || 0;

  console.log(`\n${EMOJI.STATS} Starting total interactions: ${startingTotal}`);

  for (let i = 0; i < numberOfChats; i++) {
    let agent = await bot.selectNextAgent();

    if (!agent) {
      console.log("\n❌ All agents are unavailable. Stopping execution.");
      break;
    }

    const prompt =
      agent.prompts[Math.floor(Math.random() * agent.prompts.length)];

    console.log(
      `\n[Chat ${i + 1}/${numberOfChats}] Chatting with ${agent.name}...`
    );
    console.log(`Prompt: ${prompt}`);

    const result = await bot.sendMessage(agent.id, prompt);

    if (result?.response) {
      successfulChats++;
      if (result.interactionRecorded) {
        recordedInteractions++;
      }
    } else {
      failedChats++;

      agent = await bot.selectNextAgent(agent);
    }

    // Progress update
    const progress = (((i + 1) / numberOfChats) * 100).toFixed(1);
    const availableCount = bot.getAvailableAgents().length;

    console.log("\n=== Progress Update ===");
    console.log(`Progress: ${progress}% (${i + 1}/${numberOfChats})`);
    console.log(`Active Agents: ${availableCount}/${AGENTS.length}`);
    console.log(
      `Success: ${successfulChats}, Failed: ${failedChats}, Recorded: ${recordedInteractions}`
    );

    if (i < numberOfChats - 1 && availableCount > 0) {
      const delay =
        Math.random() *
          (config.chatConfig.maxDelay - config.chatConfig.minDelay) +
        config.chatConfig.minDelay;
      console.log(
        `\n⏳ Waiting ${Math.round(delay / 1000)}s before next chat...\n`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Final statistics
  const finalStats = await bot.getUserStats();
  const endingTotal = finalStats?.total_interactions || 0;
  const actualIncrease = endingTotal - startingTotal;

  console.log("\n=== Chat Session Summary ===");
  console.log(`Starting interactions: ${startingTotal}`);
  console.log(`Ending interactions: ${endingTotal}`);
  console.log(`Actual increase: ${actualIncrease}`);
  console.log(`Total attempts: ${numberOfChats}`);
  console.log(`Successful chats: ${successfulChats}`);
  console.log(`Recorded interactions: ${recordedInteractions}`);
  console.log(`Failed chats: ${failedChats}`);
  console.log(`Unavailable agents: ${bot.unavailableAgents.size}`);
  console.log(
    `Success rate: ${((successfulChats / numberOfChats) * 100).toFixed(1)}%`
  );
  console.log(
    `Recording rate: ${((recordedInteractions / successfulChats) * 100).toFixed(
      1
    )}%`
  );
}

main().catch(console.error);
