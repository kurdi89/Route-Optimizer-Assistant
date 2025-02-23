async function handleConversation(message, markers, outlets, fleet) {
    try {
        // Get AI settings with default fallback
        const settings = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM ai_settings WHERE id = 1", (err, row) => {
                if (err) reject(err);
                resolve(row || {
                    model_for_conversation: 'openai/gpt-4o-mini',
                    persistent_instructions: '{}'
                });
            });
        });

        const conversationPrompt = `
            You are a route optimization assistant. Help plan delivery routes based on:
            - Available Outlets: ${JSON.stringify(outlets)}
            - Available Fleet: ${JSON.stringify(fleet)}
            - Delivery Points: ${JSON.stringify(markers)}
            
            User Message: ${message}

            First understand the user's request and then suggest an optimized route plan.
            Consider:
            1. Fleet capacity and availability
            2. Outlet locations and coverage areas
            3. Efficient route optimization
            4. Traffic patterns and delivery windows

            Respond conversationally but include a JSON route plan in your response when appropriate.
        `;

        const response = await getAIResponse(settings.model_for_conversation, conversationPrompt);
        
        // Try to extract JSON if present
        let routePlan = null;
        if (response.includes('{')) {
            const jsonStr = response.substring(
                response.indexOf('{'),
                response.lastIndexOf('}') + 1
            );
            try {
                routePlan = JSON.parse(jsonStr);
            } catch (e) {
                console.log('No valid JSON found in response');
            }
        }

        return {
            message: response,
            route_plan: routePlan
        };
    } catch (error) {
        console.error('Conversation error:', error);
        throw error;
    }
} 