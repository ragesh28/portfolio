/**
 * Netlify Serverless Function: Secure Groq API Chat Proxy with Key Rotation
 * 
 * This function handles OpenAI-style chat completions requests using the Groq API,
 * and executes them with automatic key rotation across API keys.
 */

exports.handler = async function (event, context) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const openaiMessages = body.messages || [];

        if (openaiMessages.length === 0) {
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "No messages provided" })
            };
        }

        // 1. Prepare API keys
        // Get keys from environment variable
        const envKeys = process.env.GROQ_API_KEY 
            ? process.env.GROQ_API_KEY.split(',').map(k => k.trim()).filter(Boolean)
            : [];
        
        const apiKeys = envKeys;

        if (apiKeys.length === 0) {
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "No API keys configured. Please add GROQ_API_KEY to your .env file." })
            };
        }

        // 2. Try calling Groq API with key rotation
        let lastError = null;
        
        for (let i = 0; i < apiKeys.length; i++) {
            const currentKey = apiKeys[i];
            const censoredKey = currentKey.substring(0, 8) + "..." + currentKey.substring(currentKey.length - 4);
            console.log(`Attempting Groq API request using key index ${i} (${censoredKey})`);

            try {
                // Setup Groq API request payload
                const requestPayload = {
                    model: "llama-3.1-8b-instant", // Using the correct Groq model
                    messages: openaiMessages,
                    temperature: body.temperature || 0.7,
                    max_tokens: body.max_tokens || 200
                };

                // Call Groq API
                const response = await fetch(
                    `https://api.groq.com/openai/v1/chat/completions`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${currentKey}`
                        },
                        body: JSON.stringify(requestPayload)
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || response.statusText;
                    throw new Error(`Groq API Error (Status ${response.status}): ${errorMessage}`);
                }

                const data = await response.json();

                // Validate Groq response structure
                if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                    console.log(`Success with key index ${i}!`);
                    return {
                        statusCode: 200,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    };
                } else {
                    throw new Error("Invalid or empty response structure received from Groq API");
                }
            } catch (err) {
                console.warn(`Key index ${i} failed. Error: ${err.message}`);
                lastError = err;
                // Continue loop to try next key
            }
        }

        // If we reach here, all keys failed
        console.error("All Groq API keys were exhausted or failed.");
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: "All API keys are currently exhausted. Please try again later.",
                details: lastError ? lastError.message : "Unknown error"
            })
        };

    } catch (globalError) {
        console.error("Internal Server Error in chat handler:", globalError);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: "Internal Server Error",
                details: globalError.message
            })
        };
    }
};
