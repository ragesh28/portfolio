/**
 * Netlify Serverless Function: Secure Gemini API Chat Proxy with Key Rotation
 * 
 * This function translates OpenAI-style chat completions requests to Gemini API requests,
 * and executes them with automatic key rotation across 8 Gemini API keys.
 */

// Hardcoded fallback keys (used if GEMINI_KEYS environment variable is not defined)
const FALLBACK_KEYS = [
    "AIzaSyCm_BqyIQG4xHVrZO-teBOZtWyHNegJ0P0", // lragesh278
    "AIzaSyBmONTaDLx_3YOM_ePoAbrOyGHQZmbBHYE", // lragesh104
    "AIzaSyAr-rLouqDez5KtO6jTvlsl0beU_5SZJOw", // saru
    "AIzaSyDYspZp9Dh-hOmFpua70v7MdUGHjIrkwnw", // lragesh28
    "AIzaSyC5pZ7Wnb9EllRAX13RmS1WbCK9jfJsaOs", // lragesh60
    "AIzaSyC_bsDM25K03VNrVdhgXH_oST5zZcJItDE", // lragesh36
    "AIzaSyCjY0Q01cfcxFOtbB3jurvXQJXoOvMtjjU", // ragesh435
    "AIzaSyBxE5JyJo0aR2okRWnJ41xiFW-e_mlyee0"  // lrageshmail28
];

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

        // 1. Convert OpenAI message format to Gemini format
        // Find the system prompt if present
        const systemMessage = openaiMessages.find(m => m.role === 'system');
        const systemPrompt = systemMessage ? systemMessage.content : '';

        // Convert conversation messages (roles: user -> user, assistant -> model)
        const contents = openaiMessages
            .filter(m => m.role !== 'system')
            .map(m => {
                const role = m.role === 'assistant' ? 'model' : 'user';
                return {
                    role: role,
                    parts: [{ text: m.content || '' }]
                };
            });

        // 2. Prepare API keys for rotation
        // Get keys from environment variable (preferred) or use fallback
        const envKeys = process.env.GEMINI_KEYS 
            ? process.env.GEMINI_KEYS.split(',').map(k => k.trim()).filter(Boolean)
            : [];
        
        const apiKeys = envKeys.length > 0 ? envKeys : FALLBACK_KEYS;

        // 3. Try calling Gemini API with key rotation
        let lastError = null;
        
        for (let i = 0; i < apiKeys.length; i++) {
            const currentKey = apiKeys[i];
            const censoredKey = currentKey.substring(0, 8) + "..." + currentKey.substring(currentKey.length - 4);
            console.log(`Attempting Gemini API request using key index ${i} (${censoredKey})`);

            try {
                // Setup Gemini API request payload
                const requestPayload = {
                    contents: contents,
                    generationConfig: {
                        temperature: body.temperature || 0.7,
                        maxOutputTokens: body.max_tokens || 200
                    }
                };

                // Add system prompt if provided
                if (systemPrompt) {
                    requestPayload.systemInstruction = {
                        parts: [{ text: systemPrompt }]
                    };
                }

                // Call Gemini API (using gemini-1.5-flash as default)
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentKey}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(requestPayload)
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || response.statusText;
                    throw new Error(`Gemini API Error (Status ${response.status}): ${errorMessage}`);
                }

                const data = await response.json();

                // Validate Gemini response structure
                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                    const aiTextResponse = data.candidates[0].content.parts[0].text;

                    // Formulate response in OpenAI format to keep client-side JS happy
                    const openAIFormattedResponse = {
                        choices: [
                            {
                                message: {
                                    role: "assistant",
                                    content: aiTextResponse
                                }
                            }
                        ]
                    };

                    console.log(`Success with key index ${i}!`);
                    return {
                        statusCode: 200,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(openAIFormattedResponse)
                    };
                } else {
                    throw new Error("Invalid or empty response structure received from Gemini API");
                }
            } catch (err) {
                console.warn(`Key index ${i} failed. Error: ${err.message}`);
                lastError = err;
                // Continue loop to try next key
            }
        }

        // If we reach here, all keys failed
        console.error("All Gemini API keys were exhausted or failed.");
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: "All Gemini API keys are currently exhausted. Please try again later.",
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
