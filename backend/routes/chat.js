router.post('/api/chat', async (req, res) => {
  try {
    const { message, history, markers } = req.body

    // Process with AI and get response
    const aiResponse = await processWithAI(message, history)

    if (message.toLowerCase().includes('plan') || message.toLowerCase().includes('route')) {
      const routePlan = await generateRoutePlan(markers)
      
      // Generate detailed analysis
      const analysis = generateDetailedAnalysis(routePlan)

      // Send back response with steps
      res.json({
        success: true,
        conversation: {
          steps: [
            "🤖 Let me help you plan the optimal routes...",
            "📍 Processing " + markers.length + " delivery points...",
            analysis, // Detailed analysis step
            "✨ Created " + routePlan.routes.length + " optimized routes.",
            `📊 Total distance: ${routePlan.totalDistance.toFixed(2)} km`,
            `⏱️ Estimated duration: ${routePlan.totalDuration} minutes`,
            "🎯 Route plan generated successfully!"
          ]
        },
        routePlan
      })
    } else {
      res.json({ response: aiResponse })
    }
  } catch (error) {
    console.error('Chat route error:', error)
    res.status(500).json({ success: false, error: 'Failed to process request' })
  }
})

function generateDetailedAnalysis(routePlan) {
  // Calculate statistics
  const totalOrders = routePlan.routes.reduce((sum, r) => sum + r.deliveries.length, 0)
  const totalValue = routePlan.routes.reduce((sum, route) => 
    sum + route.deliveries.reduce((routeSum, delivery) => routeSum + (Number(delivery.order_value) || 0), 0), 0
  )
  const avgOrdersPerRoute = (totalOrders / routePlan.routes.length).toFixed(1)
  const avgDistancePerRoute = (routePlan.totalDistance / routePlan.routes.length).toFixed(2)
  const avgDurationPerRoute = Math.round(routePlan.totalDuration / routePlan.routes.length)

  // Vehicle distribution
  const vehicles = {
    trucks: routePlan.routes.filter(r => r.vehicle.vehicle_type === 'TRUCK').length,
    vans: routePlan.routes.filter(r => r.vehicle.vehicle_type === 'VAN').length
  }

  // Format currency
  const formatCurrency = (amount) => amount.toLocaleString('en-SA', {
    style: 'currency',
    currency: 'SAR'
  })

  return `📋 Detailed Route Analysis:

• Fleet Utilization:
  - Total Vehicles Used: ${routePlan.routes.length}
  - Trucks: ${vehicles.trucks}
  - Vans: ${vehicles.vans}
  - Vehicle Utilization Rate: ${((routePlan.routes.length / routePlan.availableFleet) * 100).toFixed(1)}%

• Order Distribution:
  - Total Orders: ${totalOrders}
  - Average Orders per Route: ${avgOrdersPerRoute}
  - Total Order Value: ${formatCurrency(totalValue)}
  - Average Value per Route: ${formatCurrency(totalValue / routePlan.routes.length)}

• Route Metrics:
  - Total Distance: ${routePlan.totalDistance.toFixed(2)} km
  - Average Distance per Route: ${avgDistancePerRoute} km
  - Total Duration: ${routePlan.totalDuration} minutes
  - Average Duration per Route: ${avgDurationPerRoute} minutes

• Efficiency Metrics:
  - Distance per Order: ${(routePlan.totalDistance / totalOrders).toFixed(2)} km
  - Time per Order: ${Math.round(routePlan.totalDuration / totalOrders)} minutes
  - Value per Kilometer: ${formatCurrency(totalValue / routePlan.totalDistance)}

• Route Balance:
  - Shortest Route: ${Math.min(...routePlan.routes.map(r => r.distance)).toFixed(2)} km
  - Longest Route: ${Math.max(...routePlan.routes.map(r => r.distance)).toFixed(2)} km
  - Duration Range: ${Math.min(...routePlan.routes.map(r => r.duration))} - ${Math.max(...routePlan.routes.map(r => r.duration))} minutes

This route plan has been optimized for efficiency while considering vehicle capacity, delivery time windows, and geographical distribution of orders.`
} 