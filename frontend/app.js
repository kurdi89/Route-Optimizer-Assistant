"use client"

// Remove React imports and components
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize state
    let markers = [];
    let routePlan = null;

    // Initialize map
    const map = L.map('map-container').setView([24.7136, 46.6753], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add the route details modal HTML first
    const routeDetailsModalHtml = `
        <div id="routeDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 z-[2000] hidden">
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[80vw] max-h-[80vh] overflow-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">Detailed Route Plan</h2>
                    <button id="closeRouteDetailsX" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div id="routeDetails" class="space-y-6">
                    <!-- Route details will be inserted here -->
                </div>
                <button id="closeRouteDetails" class="mt-6 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
                    Close
                </button>
            </div>
        </div>
    `;

    // Add the modal to the document body immediately
    document.body.insertAdjacentHTML('beforeend', routeDetailsModalHtml);

    // Set up modal close handlers immediately
    document.getElementById('closeRouteDetails').addEventListener('click', () => {
        document.getElementById('routeDetailsModal').classList.add('hidden');
    });

    document.getElementById('closeRouteDetailsX').addEventListener('click', () => {
        document.getElementById('routeDetailsModal').classList.add('hidden');
    });

    // Add click outside to close
    document.getElementById('routeDetailsModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('routeDetailsModal')) {
            e.target.classList.add('hidden');
        }
    });

    // Add control buttons container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'absolute top-4 right-4 z-[1000] flex flex-col gap-2';
    document.getElementById('map-container').appendChild(controlsContainer);

    // Add generate fleet button first
    const fleetButton = document.createElement('button');
    fleetButton.className = 'bg-white px-4 py-2 rounded shadow hover:bg-gray-100 transition-colors flex items-center gap-2';
    fleetButton.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
        </svg>
        Generate Fleet
    `;
    controlsContainer.appendChild(fleetButton);

    // Add generate orders button
    const generateButton = document.createElement('button');
    generateButton.className = 'bg-white px-4 py-2 rounded shadow hover:bg-gray-100 transition-colors flex items-center gap-2';
    generateButton.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Generate Orders
    `;
    controlsContainer.appendChild(generateButton);

    // Add reset orders button
    const resetButton = document.createElement('button');
    resetButton.className = 'bg-white px-4 py-2 rounded shadow hover:bg-gray-100 transition-colors flex items-center gap-2';
    resetButton.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Reset Orders
    `;
    controlsContainer.appendChild(resetButton);

    // Add settings button
    const settingsButton = document.createElement('button');
    settingsButton.className = 'bg-white px-4 py-2 rounded shadow hover:bg-gray-100 transition-colors flex items-center gap-2';
    settingsButton.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        Settings
    `;
    controlsContainer.appendChild(settingsButton);

    // Add settings modal
    const settingsModal = document.createElement('div');
    settingsModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[2000] hidden';
    settingsModal.innerHTML = `
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96">
            <h2 class="text-lg font-semibold mb-4">⚙️ Settings</h2>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">AI Model</label>
                    <select id="aiModel" class="w-full rounded-md border p-2">
                        <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                        <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
                        <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Map Style</label>
                    <select id="mapStyle" class="w-full rounded-md border p-2">
                        <option value="streets">Streets</option>
                        <option value="satellite">Satellite</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
            </div>
            <div class="mt-6 flex justify-end gap-2">
                <button id="closeSettings" class="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Close</button>
                <button id="saveSettings" class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(settingsModal);

    // Add fleet modal
    const fleetModal = document.createElement('div');
    fleetModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[2000] hidden';
    fleetModal.innerHTML = `
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96">
            <h2 class="text-lg font-semibold mb-4">🚚 Fleet Generation</h2>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Number of Vehicles</label>
                    <input type="number" id="fleetSize" value="10" min="1" max="50" 
                           class="w-full rounded-md border p-2">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Vehicle Types</label>
                    <div class="space-y-2">
                        <label class="flex items-center">
                            <input type="checkbox" checked class="mr-2" id="includeTrucks">
                            🚛 Trucks (2000kg capacity)
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" checked class="mr-2" id="includeVans">
                            🚐 Vans (1000kg capacity)
                        </label>
                    </div>
                </div>
            </div>
            <div class="mt-6 flex justify-end gap-2">
                <button id="closeFleet" class="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Close</button>
                <button id="generateFleet" class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
                    Generate Fleet
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(fleetModal);

    // Add custom marker icons
    const markerIcons = {
        order: L.divIcon({
            className: 'order-marker',
            html: `<div class="w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">📦</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        }),
        vehicle: L.divIcon({
            className: 'vehicle-marker',
            html: `<div class="w-8 h-8 rounded-full bg-white border-2 border-green-500 flex items-center justify-center">🚚</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        }),
        outlet: L.divIcon({
            className: 'outlet-marker',
            html: `<div class="w-8 h-8 rounded-full bg-white border-2 border-red-500 flex items-center justify-center">🏪</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        })
    };

    // Initialize chat panel with better styling
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = `
        <div class="flex flex-col bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm h-full">
            <div class="border-b dark:border-gray-700 p-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="text-2xl">🤖</div>
                    <div class="font-semibold text-gray-900 dark:text-gray-100">Route Optimizer Assistant</div>
                </div>
                <button id="themeToggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg id="lightIcon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <svg id="darkIcon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    </svg>
                </button>
            </div>
            <div class="flex-1 p-4 space-y-4 overflow-auto bg-white dark:bg-gray-800" id="messages"></div>
            <div class="border-t dark:border-gray-700 p-4 space-y-2 bg-white dark:bg-gray-800">
                <textarea 
                    id="userMessage"
                    placeholder="Type your message... (e.g., 'plan routes')"
                    class="min-h-[60px] w-full rounded-md border dark:border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                ></textarea>
                <button id="sendButton" class="w-full bg-blue-500 dark:bg-blue-600 text-white rounded-md py-2 hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
                    Send
                </button>
            </div>
        </div>
    `;

    // Add emoji icons for messages
    const messageIcons = {
        system: '🔧',
        user: '👤',
        ai: '🤖',
        error: '⚠️',
        success: '✅',
        info: 'ℹ️',
        warning: '⚠️',
        fleet: '🚚',
        route: '🗺️',
        time: '⏱️',
        distance: '📏',
        optimization: '📊'
    };

    // Load and display outlets on startup
    async function loadOutlets() {
        try {
            const response = await fetch('/api/outlets');
            const data = await response.json();
            
            if (data.success && data.outlets) {
                window.outletMarkers = [];
                
                // Add outlet markers
                data.outlets.forEach(outlet => {
                    const marker = L.marker([outlet.latitude, outlet.longitude], {
                        icon: markerIcons.outlet
                    }).bindPopup(`
                        <div class="p-2">
                            <div class="font-semibold">${outlet.name}</div>
                            <div class="text-sm text-gray-600">
                                Distribution Center
                            </div>
                        </div>
                    `).addTo(map);
                    window.outletMarkers.push(marker);
                });

                // Fit map to show all outlets
                if (window.outletMarkers.length > 0) {
                    const bounds = L.latLngBounds(
                        window.outletMarkers.map(marker => marker.getLatLng())
                    );
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        } catch (error) {
            console.error('Error loading outlets:', error);
        }
    }

    // Call loadOutlets on startup
    loadOutlets();

    // Update generate orders handler
    generateButton.addEventListener('click', async () => {
        try {
            generateButton.disabled = true;
            generateButton.innerHTML = `
                <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
            `;

            // Define Riyadh bounds
            const bounds = {
                north: 24.8500, // Northern boundary of Riyadh
                south: 24.5500, // Southern boundary of Riyadh
                east: 46.8500,  // Eastern boundary of Riyadh
                west: 46.5500   // Western boundary of Riyadh
            };

            const response = await fetch('/api/generate-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    count: 20,
                    bounds: bounds
                })
            });

            const data = await response.json();
            if (data.success) {
                // Clear existing markers
                if (markers.length > 0) {
                    markers.forEach(marker => marker.remove());
                    markers = [];
                }

                // Add new markers
                data.orders.forEach(order => {
                    const marker = createOrderMarker(order);
                    marker.addTo(map);
                    markers.push(marker);
                });

                addMessage('success', `📦 Generated ${data.orders.length} orders`);

                // Fit map to show all markers
                const markerBounds = L.latLngBounds(markers.map(m => m.getLatLng()));
                map.fitBounds(markerBounds, { padding: [50, 50] });
            } else {
                addMessage('error', data.error || '❌ Failed to generate orders');
            }
        } catch (error) {
            console.error('Error generating orders:', error);
            addMessage('error', '❌ Failed to generate orders');
        } finally {
            generateButton.disabled = false;
            generateButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Generate Orders
            `;
        }
    });

    // Handle sending messages
    document.getElementById('sendButton').addEventListener('click', handleSend);
    document.getElementById('userMessage').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    async function handleSend() {
        const messageInput = document.getElementById('userMessage');
        const message = messageInput.value.trim();
        if (!message) return;

        addMessage('user', message);
        messageInput.value = '';

        if (message.toLowerCase().includes('plan') && markers.length === 0) {
            addMessage('error', 'Please generate delivery points first before planning routes.');
            return;
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    markers: markers.map(marker => ({
                        lat: marker.getLatLng().lat,
                        lng: marker.getLatLng().lng
                    }))
                })
            });

            const data = await response.json();
            if (data.success) {
                // Show the steps with a typing effect
                let delay = 0;
                data.conversation.steps.forEach(step => {
                    setTimeout(() => {
                        addMessage('ai', step);
                    }, delay);
                    delay += 500;
                });

                if (data.routePlan) {
                    window.currentRoutePlan = data.routePlan;  // Store the route plan
                    routePlan = data.routePlan;
                    setTimeout(() => {
                        drawRoutes(routePlan);
                        showRouteSummary(routePlan);
                    }, delay);
                }

                if (data.explanation) {
                    setTimeout(() => {
                        showExplanation(data.explanation);
                    }, delay + 500);
                }
            } else {
                addMessage('error', data.error || 'Failed to process request');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('error', 'Failed to send message. Please try again.');
        }
    }

    function addMessage(type, content) {
        const messagesContainer = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} rounded-lg p-4 text-sm animate-fade-in`;
        
        const icon = messageIcons[type] || '';
        
        if (type === 'success' && content.includes('Route Summary')) {
            messageDiv.innerHTML = `
                ${icon} ${content}
                <button onclick="window.showRouteDetails()" 
                        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full">
                    View Detailed Route Plan
                </button>
            `;
        } else {
            messageDiv.innerHTML = `${icon} ${content}`;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showRouteSummary(routePlan) {
        const summary = {
            totalTrips: routePlan.totalTrips,
            totalDistance: routePlan.totalDistance.toFixed(2),
            totalDuration: routePlan.totalDuration,
            improvement: {
                distance: routePlan.initialDistance ? 
                    ((routePlan.initialDistance - routePlan.totalDistance) / routePlan.initialDistance * 100).toFixed(1) : 
                    '0.0',
                time: routePlan.initialDuration ? 
                    ((routePlan.initialDuration - routePlan.totalDuration) / routePlan.initialDuration * 100).toFixed(1) : 
                    '0.0'
            }
        };

        addMessage('success', `
            Route Summary:
            • Total Trips: ${summary.totalTrips}
            • Total Distance: ${summary.totalDistance} km
            • Total Duration: ${summary.totalDuration} minutes
            • Improvements:
              - Distance: ${summary.improvement.distance}% reduction
              - Time: ${summary.improvement.time}% reduction
        `);
    }

    function showExplanation(explanation) {
        if (explanation.details) {
            addMessage('ai', explanation.details);
        }
    }

    async function drawRoutes(routePlan) {
        if (!routePlan || !routePlan.routes) {
            console.error('Invalid route plan:', routePlan);
            return;
        }

        // Clear existing routes
        if (window.currentRoutes) {
            window.currentRoutes.forEach(route => route.remove());
        }
        window.currentRoutes = [];

        const colors = ['#4f46e5', '#e11d48', '#059669', '#d97706', '#7c3aed'];
        
        // Draw routes with real-world navigation
        for (let i = 0; i < routePlan.routes.length; i++) {
            const route = routePlan.routes[i];
            const waypoints = route.waypoints.map(wp => [wp.location.lng, wp.location.lat]); // Note: OSRM expects [lng, lat]
            
            try {
                // Create waypoints string for OSRM
                const waypointsStr = waypoints.join(';');
                
                // Get real-world route with all waypoints in one request
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${waypointsStr}?overview=full&geometries=geojson&steps=true`
                );
                const data = await response.json();
                
                if (data.routes && data.routes[0]) {
                    // Create the route line using the returned geometry
                    const routeCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert back to [lat, lng]
                    const line = L.polyline(routeCoords, {
                        color: colors[i % colors.length],
                        weight: 4,
                        opacity: 0.8
                    }).addTo(map);

                    // Add sequence markers
                    route.waypoints.forEach((wp, idx) => {
                        const isOutlet = idx === 0 || idx === route.waypoints.length - 1;
                        const icon = L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div class='marker-pin ${isOutlet ? 'outlet' : 'waypoint'}'>${idx + 1}</div>`,
                            iconSize: [30, 30],
                            iconAnchor: [15, 15]
                        });

                        L.marker([wp.location.lat, wp.location.lng], { icon }).addTo(map);
                    });

                    // Add route info popup
                    line.bindPopup(`
                        <div class="font-semibold">Route ${i + 1}</div>
                        <div>Vehicle: ${route.vehicle.fleet_id} (${route.vehicle.vehicle_type})</div>
                        <div>Distance: ${(data.routes[0].distance / 1000).toFixed(2)} km</div>
                        <div>Duration: ${Math.round(data.routes[0].duration / 60)} min</div>
                        <div>Deliveries: ${route.deliveries.length}</div>
                    `);

                    window.currentRoutes.push(line);
                }
            } catch (error) {
                console.error('Error getting route:', error);
            }
        }

        // Fit map bounds
        if (window.currentRoutes.length > 0) {
            const allPoints = routePlan.routes.flatMap(route => 
                route.waypoints.map(wp => [wp.location.lat, wp.location.lng])
            );
            map.fitBounds(allPoints);
        }
    }

    // Event handlers
    resetButton.addEventListener('click', async () => {
        try {
            resetButton.disabled = true;
            const response = await fetch('/api/reset-orders', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                // Clear markers
                markers.forEach(marker => marker.remove());
                markers = [];
                // Clear routes
                if (window.currentRoutes) {
                    window.currentRoutes.forEach(route => route.remove());
                }
                window.currentRoutes = [];
                addMessage('system', 'All orders have been cleared.');
            }
        } catch (error) {
            console.error('Error resetting orders:', error);
            addMessage('error', 'Failed to reset orders.');
        } finally {
            resetButton.disabled = false;
        }
    });

    settingsButton.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    document.getElementById('saveSettings').addEventListener('click', async () => {
        const model = document.getElementById('aiModel').value;
        const mapStyle = document.getElementById('mapStyle').value;
        
        try {
            const settings = { model, mapStyle };
            localStorage.setItem('routeOptimizerSettings', JSON.stringify(settings));
            
            updateMapStyle(mapStyle);
            settingsModal.classList.add('hidden');
            addMessage('success', '✅ Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            addMessage('error', '❌ Failed to save settings');
        }
    });

    // Add fleet generation handler
    fleetButton.addEventListener('click', () => {
        fleetModal.classList.remove('hidden');
    });

    document.getElementById('closeFleet').addEventListener('click', () => {
        fleetModal.classList.add('hidden');
    });

    // Update fleet generation handler
    document.getElementById('generateFleet').addEventListener('click', async () => {
        try {
            const button = document.getElementById('generateFleet');
            button.disabled = true;
            button.textContent = 'Generating...';

            const fleetSize = document.getElementById('fleetSize').value;
            const includeTrucks = document.getElementById('includeTrucks').checked;
            const includeVans = document.getElementById('includeVans').checked;

            const response = await fetch('/api/generate-fleet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size: parseInt(fleetSize),
                    includeTrucks,
                    includeVans
                })
            });

            const data = await response.json();
            if (data.success) {
                // Clear existing fleet markers
                if (window.fleetMarkers) {
                    window.fleetMarkers.forEach(marker => marker.remove());
                }
                window.fleetMarkers = [];

                // Clear existing outlet markers
                if (window.outletMarkers) {
                    window.outletMarkers.forEach(marker => marker.remove());
                }
                window.outletMarkers = [];

                // Add outlet markers
                data.outlets.forEach(outlet => {
                    const marker = L.marker([outlet.latitude, outlet.longitude], {
                        icon: markerIcons.outlet
                    }).bindPopup(`
                        <div class="p-2">
                            <div class="font-semibold">${outlet.name}</div>
                            <div class="text-sm text-gray-600">
                                Vehicles: ${data.fleets.filter(f => f.outlet_id === outlet.id).length}
                            </div>
                        </div>
                    `).addTo(map);
                    window.outletMarkers.push(marker);

                    // Add vehicle markers for this outlet
                    data.fleets.filter(f => f.outlet_id === outlet.id).forEach(vehicle => {
                        const marker = L.marker([vehicle.current_latitude, vehicle.current_longitude], {
                            icon: markerIcons.vehicle
                        }).bindPopup(`
                            <div class="p-2">
                                <div class="font-semibold">${vehicle.fleet_id}</div>
                                <div class="text-sm text-gray-600">
                                    Type: ${vehicle.vehicle_type}<br>
                                    Status: ${vehicle.status}<br>
                                    Capacity: ${vehicle.capacity_kg}kg
                                </div>
                            </div>
                        `).addTo(map);
                        window.fleetMarkers.push(marker);
                    });
                });

                fleetModal.classList.add('hidden');
                addMessage('success', `🚚 Generated fleet of ${data.fleets.length} vehicles:`);
                addMessage('info', `
                    🚛 Trucks: ${data.distribution.trucks}
                    🚐 Vans: ${data.distribution.vans}
                    ✅ Available: ${data.distribution.available}
                    🔧 Maintenance: ${data.distribution.maintenance}
                `);

                // Fit map to show all markers
                const bounds = L.latLngBounds([
                    ...data.outlets.map(o => [o.latitude, o.longitude]),
                    ...data.fleets.map(f => [f.current_latitude, f.current_longitude])
                ]);
                map.fitBounds(bounds, { padding: [50, 50] });
            } else {
                addMessage('error', data.error || '❌ Failed to generate fleet');
            }
        } catch (error) {
            console.error('Error generating fleet:', error);
            addMessage('error', '❌ Failed to generate fleet');
        } finally {
            const button = document.getElementById('generateFleet');
            button.disabled = false;
            button.textContent = 'Generate Fleet';
        }
    });

    // Update order marker popup
    function createOrderMarker(order) {
        const marker = L.marker([order.latitude, order.longitude], {
            icon: markerIcons.order,
            permanent: true
        }).bindPopup(`
            <div class="p-2">
                <div class="font-semibold">Order ${order.order_id}</div>
                <div class="text-sm text-gray-600">Value: ${order.order_value.toLocaleString('en-SA', { 
                    style: 'currency', 
                    currency: 'SAR'
                })}</div>
            </div>
        `);
        return marker;
    }

    // Update map style function
    function updateMapStyle(style) {
        const styles = {
            streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
        };

        map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                map.removeLayer(layer);
            }
        });

        L.tileLayer(styles[style], {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }

    // Load saved settings
    const loadSettings = () => {
        const savedSettings = localStorage.getItem('routeOptimizerSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            document.getElementById('aiModel').value = settings.model || 'anthropic/claude-3-haiku';
            document.getElementById('mapStyle').value = settings.mapStyle || 'streets';
            updateMapStyle(settings.mapStyle || 'streets');
        }
    };

    // Load settings on startup
    loadSettings();

    // Add click outside to close modals
    [settingsModal, fleetModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // First, define showRouteDetails before adding the click handler
    window.showRouteDetails = function() {
        const routeDetailsModal = document.getElementById('routeDetailsModal');
        const detailsContainer = document.getElementById('routeDetails');
        if (!window.currentRoutePlan) {
            console.log('No route plan available');
            return;
        }

        // Calculate total value from all deliveries
        const totalValue = window.currentRoutePlan.routes.reduce((sum, route) => 
            sum + route.deliveries.reduce((routeSum, delivery) => 
                routeSum + (Number(delivery.order_value) || 0), 0
            ), 0
        );

        let html = `
            <div class="mb-4 p-4 bg-blue-50 rounded">
                <h3 class="font-semibold text-xl mb-2">Fleet Summary</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p><strong>Available Vehicles:</strong> ${window.currentRoutePlan.available_fleet || window.currentRoutePlan.availableFleet} vehicles</p>
                        <p><strong>Total Routes:</strong> ${window.currentRoutePlan.routes.length}</p>
                        <p><strong>Total Distance:</strong> ${(window.currentRoutePlan.total_distance || window.currentRoutePlan.totalDistance).toFixed(2)} km</p>
                        <p><strong>Total Orders:</strong> ${window.currentRoutePlan.routes.reduce((sum, r) => sum + (r.deliveries?.length || 0), 0)}</p>
                    </div>
                    <div>
                        <p><strong>Total Duration:</strong> ${window.currentRoutePlan.total_duration || window.currentRoutePlan.totalDuration} minutes</p>
                        <p><strong>Total Value:</strong> ${totalValue.toLocaleString('en-SA', { 
                            style: 'currency', 
                            currency: 'SAR'
                        })}</p>
                        <p><strong>Average Value/Route:</strong> ${(totalValue / window.currentRoutePlan.routes.length).toLocaleString('en-SA', {
                            style: 'currency',
                            currency: 'SAR'
                        })}</p>
                    </div>
                </div>
            </div>
        `;

        window.currentRoutePlan.routes.forEach((route, idx) => {
            // Calculate route value from its deliveries
            const routeValue = route.deliveries.reduce((sum, delivery) => 
                sum + (Number(delivery.order_value) || 0), 0
            );

            // Get outlet info from the start waypoint or route data
            const startWaypoint = route.waypoints.find(wp => wp.type === 'start');
            const outlet = {
                name: route.outlet?.name || startWaypoint?.outlet_name || 'North Outlet',
                latitude: route.outlet?.latitude || startWaypoint?.location?.lat || 24.8974,
                longitude: route.outlet?.longitude || startWaypoint?.location?.lng || 46.6269
            };

            html += `
                <div class="border rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold text-lg">Route ${idx + 1}</h3>
                        <button onclick="showRouteOnMap(${idx})" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Show on Map
                        </button>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p><strong>Vehicle:</strong> ${route.vehicle.fleet_id}</p>
                            <p><strong>Type:</strong> ${route.vehicle.vehicle_type}</p>
                            <p><strong>Distance:</strong> ${route.distance.toFixed(2)} km</p>
                            <p><strong>Duration:</strong> ${route.duration} min</p>
                            <p><strong>Total Value:</strong> ${routeValue.toLocaleString('en-SA', { 
                                style: 'currency', 
                                currency: 'SAR'
                            })}</p>
                        </div>
                        <div>
                            <p><strong>Deliveries:</strong> ${route.deliveries.length}</p>
                            <p><strong>Status:</strong> ${route.vehicle.status}</p>
                            <p><strong>Capacity:</strong> ${route.vehicle.capacity_kg}kg</p>
                            <p><strong>Starting Outlet:</strong> ${outlet.name}</p>
                            <p><strong>Outlet Location:</strong> (${outlet.latitude.toFixed(4)}, ${outlet.longitude.toFixed(4)})</p>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h4 class="font-medium mb-2">Delivery Sequence:</h4>
                        <div class="space-y-2">
                            ${route.waypoints.map((wp, i) => {
                                const delivery = route.deliveries.find(d => 
                                    d.latitude === wp.location.lat && 
                                    d.longitude === wp.location.lng
                                );
                                return `
                                    <div class="flex items-center gap-2 p-3 ${i % 2 === 0 ? 'bg-gray-50' : ''} rounded">
                                        <span class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                                            ${i + 1}
                                        </span>
                                        <div class="flex-1">
                                            <div class="flex justify-between items-center">
                                                <span class="font-medium">
                                                    ${wp.type === 'delivery' ? 'Delivery Point' : wp.type.charAt(0).toUpperCase() + wp.type.slice(1)}
                                                </span>
                                                ${wp.type === 'delivery' && delivery ? `
                                                    <span class="text-green-600 font-medium">${Number(delivery.order_value).toLocaleString('en-SA', { 
                                                        style: 'currency', 
                                                        currency: 'SAR'
                                                    })}</span>
                                                ` : ''}
                                            </div>
                                            ${delivery ? `
                                                <div class="text-sm text-gray-600 mt-1">
                                                    <p><strong>Order ID:</strong> ${delivery.order_id}</p>
                                                    ${delivery.customer_name ? `<p><strong>Customer:</strong> ${delivery.customer_name}</p>` : ''}
                                                    ${delivery.customer_address ? `<p><strong>Address:</strong> ${delivery.customer_address}</p>` : ''}
                                                    ${delivery.is_vip ? '<p class="text-yellow-600 font-medium">🌟 VIP Customer</p>' : ''}
                                                    <p><strong>Location:</strong> (${wp.location.lat.toFixed(4)}, ${wp.location.lng.toFixed(4)})</p>
                                                    <p><strong>Order Value:</strong> ${Number(delivery.order_value).toLocaleString('en-SA', {
                                                        style: 'currency',
                                                        currency: 'SAR'
                                                    })}</p>
                                                </div>
                                            ` : wp.type === 'start' ? `
                                                <div class="text-sm text-gray-600 mt-1">
                                                    <p><strong>Starting from:</strong> ${outlet.name}</p>
                                                    <p><strong>Location:</strong> (${wp.location.lat.toFixed(4)}, ${wp.location.lng.toFixed(4)})</p>
                                                </div>
                                            ` : wp.type === 'end' ? `
                                                <div class="text-sm text-gray-600 mt-1">
                                                    <p><strong>Returning to:</strong> ${outlet.name}</p>
                                                    <p><strong>Location:</strong> (${wp.location.lat.toFixed(4)}, ${wp.location.lng.toFixed(4)})</p>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        });

        detailsContainer.innerHTML = html;
        routeDetailsModal.classList.remove('hidden');
    };

    // Add the showRouteOnMap function that combines closing modal and highlighting route
    window.showRouteOnMap = function(routeIndex) {
        document.getElementById('routeDetailsModal').classList.add('hidden');
        window.highlightRoute(routeIndex);
    };

    // Add function to highlight route on map
    window.highlightRoute = function(routeIndex) {
        const route = window.currentRoutePlan.routes[routeIndex];
        if (!route) return;

        // Reset all routes to normal style
        window.currentRoutes.forEach(r => {
            r.setStyle({
                weight: 4,
                opacity: 0.8
            });
        });

        // Highlight selected route
        window.currentRoutes[routeIndex].setStyle({
            weight: 6,
            opacity: 1
        });

        // Zoom to route bounds
        const routePoints = route.waypoints.map(wp => [wp.location.lat, wp.location.lng]);
        map.fitBounds(routePoints);

        // Flash sequence markers
        route.waypoints.forEach((wp, idx) => {
            const marker = L.marker([wp.location.lat, wp.location.lng], {
                icon: L.divIcon({
                    className: 'sequence-marker-highlight',
                    html: `<div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold animate-pulse">
                        ${idx + 1}
                    </div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                })
            }).addTo(map);

            // Remove highlight after 3 seconds
            setTimeout(() => marker.remove(), 3000);
        });
    };

    // Add theme toggle button next to the assistant title
    const headerDiv = document.querySelector('.border-b');
    headerDiv.className = 'border-b p-3 flex items-center justify-between';
    headerDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <div class="text-2xl">🤖</div>
            <div class="font-semibold">Route Optimizer Assistant</div>
        </div>
        <button id="themeToggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg id="lightIcon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <svg id="darkIcon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
        </button>
    `;

    // Add theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const lightIcon = document.getElementById('lightIcon');
    const darkIcon = document.getElementById('darkIcon');

    // Function to update theme
    function updateTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
            updateMapStyle('dark');
        } else {
            document.documentElement.classList.remove('dark');
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
            updateMapStyle('streets');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    // Initialize theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    updateTheme(isDark);

    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const isDark = !document.documentElement.classList.contains('dark');
        updateTheme(isDark);
    });
}); 