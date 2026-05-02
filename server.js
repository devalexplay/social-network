// ============================================
// FREEDOM AI - BACKEND SERVER (FIXED)
// Simple Express server that actually works
// ============================================

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Model configurations
const modelsConfig = {
    "deep-thinker": {
        id: "deep-thinker",
        name: "Deep Thinker",
        desc: "Reasoning · multi-step analysis",
        thinkingStyle: "analytical",
        responseSpeed: 780
    },
    "creative-oracle": {
        id: "creative-oracle",
        name: "Creative Oracle",
        desc: "Imagination · metaphors · synthesis",
        thinkingStyle: "creative",
        responseSpeed: 620
    },
    "precision-engine": {
        id: "precision-engine",
        name: "Precision Engine",
        desc: "Code · logic · factual accuracy",
        thinkingStyle: "precise",
        responseSpeed: 480
    }
};

// Cognitive response patterns
function generateResponse(message, modelId) {
    const lowerMsg = message.toLowerCase();
    
    if (modelId === "deep-thinker") {
        if (lowerMsg.includes("why") || lowerMsg.includes("explain")) {
            return `**Reasoning Chain:**\n\n1️⃣ Deconstructing: "${message.substring(0, 80)}..."\n2️⃣ First principles analysis\n3️⃣ Logical inference\n4️⃣ Synthesis of evidence\n\nWould you like me to elaborate further?`;
        }
        if (lowerMsg.includes("how to")) {
            return `**Step-by-Step Guide:**\n\n📋 Step 1: Define the goal\n⚙️ Step 2: Break down tasks\n✅ Step 3: Execute systematically\n🚀 Step 4: Review and optimize\n\nNeed details on any step?`;
        }
        return `**Analytical Response:**\n\nLet me think through "${message.substring(0, 100)}"...\n\n• Understanding the core question\n• Identifying key patterns\n• Applying logical framework\n• Synthesizing the answer\n\nDoes this help? I can go deeper.`;
    }
    
    if (modelId === "creative-oracle") {
        if (lowerMsg.includes("imagine") || lowerMsg.includes("dream")) {
            return `✨ **Creative Vision:**\n\nImagine your question as a seed planted in the garden of possibilities. Each answer is a flower blooming in unexpected colors. Let's explore this metaphor together — what direction calls to you?`;
        }
        if (lowerMsg.includes("future")) {
            return `🔮 **Looking Ahead:**\n\nThe future is a canvas we paint together. Your curiosity is the brush, and every question adds new colors to the masterpiece. What shape shall tomorrow take in our conversation?`;
        }
        return `🎨 **Creative Reflection:**\n\n"${message.substring(0, 80)}" — This sparks imagery of endless horizons. Like watching clouds form shapes, meaning emerges from our shared exploration. Shall we dive deeper into this creative space?`;
    }
    
    if (modelId === "precision-engine") {
        if (lowerMsg.includes("code") || lowerMsg.includes("javascript")) {
            return `**Code Solution:**\n\n\`\`\`javascript\nfunction solve(input) {\n    return input?.map(x => x * 2) ?? [];\n}\n\`\`\`\nTime complexity: O(n). Need a specific implementation?`;
        }
        if (lowerMsg.includes("fact")) {
            return `**Verified Information:**\n\n✓ Confidence: High\n✓ Source: Knowledge base\n\nBased on available data, here's the precise answer to your query. Request specific details for enhanced precision.`;
        }
        return `**Precision Response:**\n\nAnalyzing "${message.substring(0, 80)}"...\n\n• Validating assumptions\n• Cross-referencing patterns\n• Returning verified output\n\nFor more accuracy, please provide specific parameters.`;
    }
    
    return `I'm here to help. What would you like to explore?`;
}

// In-memory session storage
const sessions = new Map();

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Get models
app.get('/api/models', (req, res) => {
    res.json({
        success: true,
        models: Object.values(modelsConfig)
    });
});

// Chat endpoint
app.post('/api/chat', (req, res) => {
    try {
        const { message, model = 'deep-thinker', sessionId } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }
        
        // Generate response
        const response = generateResponse(message, model);
        const modelConfig = modelsConfig[model] || modelsConfig['deep-thinker'];
        
        // Store in session if sessionId provided
        if (sessionId) {
            if (!sessions.has(sessionId)) {
                sessions.set(sessionId, { messages: [], createdAt: Date.now() });
            }
            const session = sessions.get(sessionId);
            session.messages.push({ role: 'user', content: message, timestamp: Date.now() });
            session.messages.push({ role: 'assistant', content: response, timestamp: Date.now() });
        }
        
        res.json({
            success: true,
            response: response,
            model: modelConfig.name,
            modelId: model,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get conversation history
app.get('/api/history/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);
    
    res.json({
        success: true,
        messages: session?.messages || [],
        sessionExists: !!session
    });
});

// Clear history
app.delete('/api/history/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (sessions.has(sessionId)) {
        sessions.get(sessionId).messages = [];
    }
    
    res.json({
        success: true,
        message: 'History cleared'
    });
});

// ============================================
// SERVE STATIC FILES
// ============================================

// Serve static files from current directory
app.use(express.static(__dirname));

// Catch-all for SPA - serve index.html
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║                                        ║
    ║        FREEDOM AI SERVER v3.0          ║
    ║                                        ║
    ╠════════════════════════════════════════╣
    ║  🚀 Running on: http://localhost:${PORT}  ║
    ║  🧠 Models: Deep Thinker, Creative,    ║
    ║           Precision Engine             ║
    ║  📡 Status: Online                     ║
    ╚════════════════════════════════════════╝
    `);
});
