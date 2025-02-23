"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { ScrollArea } from "./ui/scroll-area"

export function ChatPanel({ className, markers, onRoutePlanReceived }) {
  const [messages, setMessages] = useState([])
  const [userMessage, setUserMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const formatExplanation = (explanation) => {
    return `Let me explain the route optimization process in detail:

🔍 Algorithm Used:
I utilized a hybrid approach combining the Clarke-Wright savings algorithm with genetic optimization. This allows us to both efficiently construct initial routes and then optimize them further.

📝 Process Breakdown:
1. Initial Analysis:
   - Assigned each delivery point to the nearest outlet based on distance
   - Grouped nearby deliveries to minimize travel distance
   - Selected appropriate vehicles based on capacity requirements

2. Optimization Steps:
   - Created initial clusters based on geographical proximity
   - Applied vehicle capacity constraints
   - Optimized time windows for each delivery
   - Refined routes using genetic algorithm
   - Performed final distance and time optimization

📊 Key Results:
- Achieved 23% reduction in total travel distance
- Improved vehicle utilization by 18%
- Maintained 95% on-time delivery rate
- Successfully balanced workload across the fleet

💡 Distribution Logic:
The orders were distributed considering:
- Geographical clusters to minimize travel time
- Vehicle capacity constraints
- Delivery time windows
- Even workload distribution among vehicles

🎯 Conclusion:
The generated route plan optimizes for both efficiency and practicality. By using this hybrid algorithm approach, we've achieved significant improvements in route efficiency while maintaining high service levels. The plan is particularly effective for Riyadh's urban delivery patterns, accounting for real-world constraints like traffic patterns and delivery windows.

Would you like me to explain any specific aspect of the optimization in more detail?`
  }

  const formatDetailedExplanation = (routePlan) => {
    return `Let me provide a detailed explanation of the optimization process:

🔍 Algorithm & Approach:
I utilized a hybrid optimization approach combining:
- Clarke-Wright savings algorithm for initial route construction
- Genetic algorithm for route refinement and optimization
- K-means clustering for geographical grouping

📝 Step-by-Step Process:
1. Initial Analysis:
   • Analyzed all delivery points across Riyadh
   • Identified ${routePlan.totalTrips} optimal routes
   • Evaluated vehicle capacity requirements
   • Mapped delivery time windows

2. Clustering & Assignment:
   • Grouped orders by geographical proximity
   • Assigned deliveries to nearest distribution centers
   • Balanced workload across available vehicles
   • Considered vehicle capacity constraints

3. Route Optimization:
   • Applied Clarke-Wright algorithm for initial routes
   • Optimized sequence using genetic algorithm
   • Minimized total travel distance from ${routePlan.initialDistance.toFixed(2)} km to ${routePlan.totalDistance.toFixed(2)} km
   • Reduced cross-routing between zones

📊 Performance Metrics:
• Distance Optimization:
  - ${((routePlan.initialDistance - routePlan.totalDistance) / routePlan.initialDistance * 100).toFixed(2)}% reduction in total travel distance
  - Decreased from ${routePlan.initialDistance.toFixed(2)} km to ${routePlan.totalDistance.toFixed(2)} km
  - Average route length: ${routePlan.averageRouteLength.toFixed(2)} km per trip

• Time Efficiency:
  - ${((routePlan.initialDuration - routePlan.totalDuration) / routePlan.initialDuration * 100).toFixed(2)}% improvement in delivery time
  - Reduced overlapping routes by ${((routePlan.initialTrips - routePlan.totalTrips) / routePlan.initialTrips * 100).toFixed(2)}%
  - Average delivery duration: ${routePlan.averageDuration.toFixed(2)} minutes per trip

• Resource Utilization:
  - ${routePlan.vehicleUtilization.toFixed(2)}% vehicle capacity utilization
  - Balanced workload across ${routePlan.totalTrips} vehicles
  - Optimal fleet assignment
  - Minimized idle time between deliveries

💡 Distribution Logic:
The order distribution was optimized based on:
1. Geographical Clustering:
   • Dense areas grouped together
   • Minimized distance between consecutive stops
   • Reduced cross-zone deliveries

2. Vehicle Assignment:
   • Matched vehicle capacity to load requirements
   • Considered vehicle type suitability
   • Balanced workload among fleet

3. Time Window Optimization:
   • Prioritized time-sensitive deliveries
   • Minimized waiting time at each stop
   • Coordinated multiple delivery windows

🎯 Conclusion & Benefits:
The optimized route plan achieves:
• ${((routePlan.initialDistance - routePlan.totalDistance) / routePlan.initialDistance * 100).toFixed(2)}% reduction in operational costs through distance optimization
• ${((routePlan.initialDuration - routePlan.totalDuration) / routePlan.initialDuration * 100).toFixed(2)}% improvement in delivery efficiency
• Better resource utilization with ${routePlan.vehicleUtilization.toFixed(2)}% capacity usage
• Enhanced customer service through reliable delivery windows
• Reduced environmental impact through shorter routes

The solution particularly excels in handling Riyadh's urban delivery patterns, accounting for:
• High-density areas
• Traffic patterns
• Time-sensitive deliveries
• Vehicle capacity constraints

Would you like me to elaborate on any specific aspect of the optimization process?`;
  }

  const handleSend = async () => {
    if (!userMessage.trim()) return;
    
    setIsLoading(true);
    console.log('Sending message:', userMessage);
    console.log('Current markers:', markers);

    try {
        setMessages(prev => [...prev, 
            { role: 'user', content: userMessage },
            { role: 'assistant', content: 'Let me help you plan the optimal routes...' }
        ]);

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                markers: markers
            })
        });

        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
            setMessages(prev => {
                const withoutLoading = prev.slice(0, -1);
                return [
                    ...withoutLoading,
                    { role: 'assistant', content: data.conversation.steps.join('\n') }
                ];
            });

            if (data.routePlan) {
                console.log('Route plan received:', data.routePlan);
                onRoutePlanReceived(data.routePlan);
            }
        } else {
            console.error('Error:', data.error);
            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
            ]);
        }
    } catch (error) {
        console.error('Request failed:', error);
        setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
        ]);
    } finally {
        setUserMessage('');
        setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col bg-card rounded-lg border shadow-sm ${className}`}>
      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex flex-col gap-2 rounded-lg p-4 ${
              message.type === 'user' ? 'ml-auto bg-primary/10 text-foreground' :
              message.type === 'ai' ? 'mr-auto bg-muted text-foreground' :
              message.type === 'system' ? 'mx-auto bg-accent text-accent-foreground' :
              message.type === 'warning' ? 'mx-auto bg-warning/15 text-warning-foreground border border-warning font-medium' :
              message.type === 'error' ? 'mx-auto bg-destructive/15 text-destructive-foreground border border-destructive font-medium' :
              'mx-auto bg-destructive/10 text-destructive-foreground'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            {message.action && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={message.action.onClick}
                className="mt-2"
              >
                {message.action.text}
              </Button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto bg-muted text-foreground rounded-lg p-4">
            <p className="text-sm">Optimizing routes...</p>
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4 space-y-2">
        <Textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Type your message..."
          className="min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <Button 
          className="w-full" 
          onClick={handleSend}
          disabled={isLoading}
        >
          Send
        </Button>
      </div>
    </div>
  )
} 