const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { ethers } = require('ethers');
const winston = require('winston');
require('dotenv').config();

// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'relay.log' })
    ]
});

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Contract ABIs
const PROOF_OF_HUMAN_ABI = [
    "event UserVerified(address indexed user, uint256 indexed timestamp, string documentType, uint256 minimumAge, string nationality)"
];

const ZVASP_ABI = [
    "function markUserVerified(address user) external",
    "function batchMarkUsersVerified(address[] calldata users) external",
    "function verifiedUsers(address) external view returns (bool)"
];

// Configuration
const config = {
    celoRpcUrl: process.env.CELO_RPC_URL || "https://alfajores-forno.celo-testnet.org",
    kadenaRpcUrl: process.env.KADENA_RPC_URL || "https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc",
    proofOfHumanAddress: process.env.PROOF_OF_HUMAN_ADDRESS,
    zvaspAddress: process.env.ZVASP_ADDRESS,
    relayPrivateKey: process.env.RELAY_PRIVATE_KEY,
    batchSize: parseInt(process.env.BATCH_SIZE) || 10,
    batchDelay: parseInt(process.env.BATCH_DELAY) || 30000, // 30 seconds
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY) || 5000 // 5 seconds
};

// Validate configuration
if (!config.proofOfHumanAddress || !config.zvaspAddress || !config.relayPrivateKey) {
    logger.error('Missing required environment variables');
    process.exit(1);
}

// RPC providers
const celoProvider = new ethers.JsonRpcProvider(config.celoRpcUrl);
const kadenaProvider = new ethers.JsonRpcProvider(config.kadenaRpcUrl);

// Contract instances
const proofOfHumanContract = new ethers.Contract(
    config.proofOfHumanAddress,
    PROOF_OF_HUMAN_ABI,
    celoProvider
);

// Wallet for sending transactions to Kadena
const kadenaWallet = new ethers.Wallet(config.relayPrivateKey, kadenaProvider);
const zvaspContract = new ethers.Contract(
    config.zvaspAddress,
    ZVASP_ABI,
    kadenaWallet
);

// State management
class RelayState {
    constructor() {
        this.processedEvents = new Set();
        this.pendingVerifications = new Set();
        this.pendingBatch = [];
        this.batchTimeout = null;
        this.stats = {
            totalProcessed: 0,
            successfulRelays: 0,
            failedRelays: 0,
            batchesProcessed: 0
        };
    }

    addProcessedEvent(eventId) {
        this.processedEvents.add(eventId);
    }

    isEventProcessed(eventId) {
        return this.processedEvents.has(eventId);
    }

    addToPendingBatch(user) {
        if (!this.pendingVerifications.has(user)) {
            this.pendingBatch.push(user);
            this.pendingVerifications.add(user);
            
            if (this.pendingBatch.length >= config.batchSize) {
                this.processBatch();
            } else if (!this.batchTimeout) {
                this.batchTimeout = setTimeout(() => {
                    if (this.pendingBatch.length > 0) {
                        this.processBatch();
                    }
                }, config.batchDelay);
            }
        }
    }

    async processBatch() {
        if (this.pendingBatch.length === 0) return;

        const batch = [...this.pendingBatch];
        this.pendingBatch = [];
        
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }

        try {
            logger.info(`Processing batch of ${batch.length} verifications`);
            
            const tx = await zvaspContract.batchMarkUsersVerified(batch, {
                gasLimit: 100000 + (batch.length * 50000) // Dynamic gas estimation
            });
            
            logger.info(`Batch transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            logger.info(`✅ Batch processed successfully. Gas used: ${receipt.gasUsed}`);
            
            this.stats.successfulRelays += batch.length;
            this.stats.batchesProcessed++;
            
            // Remove from pending
            batch.forEach(user => this.pendingVerifications.delete(user));
            
        } catch (error) {
            logger.error(`❌ Batch processing failed: ${error.message}`);
            this.stats.failedRelays += batch.length;
            
            // Retry individual verifications for failed batch
            batch.forEach(user => {
                this.pendingVerifications.delete(user);
                this.retryIndividualVerification(user);
            });
        }
    }

    async retryIndividualVerification(user, attempt = 1) {
        if (attempt > config.retryAttempts) {
            logger.error(`Failed to verify ${user} after ${config.retryAttempts} attempts`);
            return;
        }

        try {
            logger.info(`Retrying individual verification for ${user} (attempt ${attempt})`);
            
            const tx = await zvaspContract.markUserVerified(user, {
                gasLimit: 100000
            });
            
            await tx.wait();
            logger.info(`✅ Individual verification successful for ${user}`);
            this.stats.successfulRelays++;
            
        } catch (error) {
            logger.error(`❌ Individual verification failed for ${user}: ${error.message}`);
            
            setTimeout(() => {
                this.retryIndividualVerification(user, attempt + 1);
            }, config.retryDelay * attempt); // Exponential backoff
        }
    }
}

const relayState = new RelayState();

// Event processing
async function processVerificationEvent(user, timestamp, documentType, nationality, event) {
    const eventId = `${event.transactionHash}-${event.logIndex}`;
    
    if (relayState.isEventProcessed(eventId)) {
        logger.debug(`Event ${eventId} already processed`);
        return;
    }
    
    logger.info(`New verification detected:`);
    logger.info(`User: ${user}`);
    logger.info(`Timestamp: ${timestamp}`);
    logger.info(`Document: ${documentType}`);
    logger.info(`Nationality: ${nationality}`);
    logger.info(`TX: ${event.transactionHash}`);
    
    relayState.addProcessedEvent(eventId);
    relayState.addToPendingBatch(user);
    relayState.stats.totalProcessed++;
}

// Start event listener
async function startEventListener() {
    logger.info('🚀 Starting ZVASP Relay Server...');
    logger.info('📡 Listening for ProofOfHuman events on Celo...');
    logger.info(`📋 Config: Batch Size=${config.batchSize}, Batch Delay=${config.batchDelay}ms`);
    
    // Listen to new events
    proofOfHumanContract.on("UserVerified", processVerificationEvent);
    
    // Process historical events on startup
    await processHistoricalEvents();
    
    // Set up periodic health checks
    setInterval(async () => {
        try {
            await kadenaProvider.getBlockNumber();
            await celoProvider.getBlockNumber();
        } catch (error) {
            logger.error('Health check failed:', error.message);
        }
    }, 60000); // Every minute
}

async function processHistoricalEvents() {
    try {
        logger.info('🔍 Checking for historical verification events...');
        
        const currentBlock = await celoProvider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 100000); // Last ~100k blocks
        
        logger.info(`Scanning blocks ${fromBlock} to ${currentBlock}`);
        
        const filter = proofOfHumanContract.filters.UserVerified();
        const events = await proofOfHumanContract.queryFilter(filter, fromBlock, currentBlock);
        
        logger.info(`Found ${events.length} historical verification events`);
        
        const newUsers = [];
        
        for (const event of events) {
            const eventId = `${event.transactionHash}-${event.logIndex}`;
            
            if (!relayState.isEventProcessed(eventId)) {
                const user = event.args[0];
                
                // Check if user is already verified on Kadena
                try {
                    const isVerified = await zvaspContract.verifiedUsers(user);
                    if (!isVerified) {
                        newUsers.push(user);
                        relayState.addProcessedEvent(eventId);
                    }
                } catch (error) {
                    // If we can't check, assume not verified
                    newUsers.push(user);
                    relayState.addProcessedEvent(eventId);
                }
            }
        }
        
        if (newUsers.length > 0) {
            logger.info(`Found ${newUsers.length} new users to verify`);
            
            // Process in batches
            for (let i = 0; i < newUsers.length; i += config.batchSize) {
                const batch = newUsers.slice(i, i + config.batchSize);
                batch.forEach(user => relayState.addToPendingBatch(user));
            }
        }
        
    } catch (error) {
        logger.error('Error processing historical events:', error.message);
    }
}

// API Endpoints
app.get('/health', (req, res) => {
    res.json({
        status: 'running',
        uptime: process.uptime(),
        stats: relayState.stats,
        pending: {
            batch: relayState.pendingBatch.length,
            individual: relayState.pendingVerifications.size
        },
        config: {
            batchSize: config.batchSize,
            batchDelay: config.batchDelay
        }
    });
});

app.get('/stats', (req, res) => {
    res.json({
        ...relayState.stats,
        pendingVerifications: relayState.pendingVerifications.size,
        processedEvents: relayState.processedEvents.size
    });
});

// Manual verification endpoint (for testing)
app.post('/verify-user', async (req, res) => {
    const { userAddress } = req.body;
    
    if (!ethers.isAddress(userAddress)) {
        return res.status(400).json({ error: 'Invalid address' });
    }
    
    try {
        relayState.addToPendingBatch(userAddress);
        res.json({ 
            success: true, 
            message: 'User added to verification queue',
            queueSize: relayState.pendingBatch.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Force batch processing (for testing)
app.post('/process-batch', async (req, res) => {
    try {
        await relayState.processBatch();
        res.json({ success: true, message: 'Batch processed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get verification status
app.get('/verify-status/:address', async (req, res) => {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
        return res.status(400).json({ error: 'Invalid address' });
    }
    
    try {
        const isVerified = await zvaspContract.verifiedUsers(address);
        const isPending = relayState.pendingVerifications.has(address);
        
        res.json({
            address,
            verified: isVerified,
            pending: isPending,
            status: isVerified ? 'verified' : (isPending ? 'pending' : 'not_verified')
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling
app.use((err, req, res, next) => {
    logger.error('Express error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled rejection:', error.message);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    
    // Process any remaining batch
    if (relayState.pendingBatch.length > 0) {
        relayState.processBatch().then(() => {
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
    logger.info(`🌐 Relay server running on port ${PORT}`);
    await startEventListener();
});