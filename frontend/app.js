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

    // Add this at the beginning of your file, right after the initial imports/setup
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        .sequence-marker {
            background: white;
            border: 2px solid #4f46e5;
            border-radius: 8px;
            color: #4f46e5;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            position: relative;
            left: -30px;  /* Move left */
            top: -10px;   /* Move up */
        }

        .sequence-marker.sequence-outlet {
            background: #4f46e5;
            color: white;
            border-color: white;
        }

        .sequence-marker.sequence-waypoint {
            background: white;
            color: #4f46e5;
        }

        .order-marker {
            z-index: 1000 !important;
        }

        .sequence-marker {
            z-index: 900 !important;
        }

        .outlet-marker {
            z-index: 1000 !important;
        }

        /* Ensure popups are always on top */
        .leaflet-popup {
            z-index: 1100 !important;
        }
    `;
    document.head.appendChild(styleTag);

    // Update the route details modal HTML
    const routeDetailsModalHtml = `
        <div id="routeDetailsModal" class="fixed inset-0 bg-black/50 items-center justify-center z-[9999] hidden">
            <div class="relative bg-white rounded-lg shadow-xl w-[80vw] max-h-[80vh] overflow-auto m-4">
                <div class="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 class="text-xl font-semibold">Route Details</h2>
                    <button id="closeRouteDetailsX" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div id="routeDetails" class="p-4">
                    <!-- Route details will be inserted here -->
                </div>
                <div class="sticky bottom-0 bg-white border-t p-4">
                    <button id="closeRouteDetails" class="w-full px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add the modal to the document body immediately
    document.body.insertAdjacentHTML('beforeend', routeDetailsModalHtml);

    // Set up route details modal close handlers
    document.getElementById('closeRouteDetails')?.addEventListener('click', () => {
        document.getElementById('routeDetailsModal').classList.add('hidden');
        document.getElementById('routeDetailsModal').style.display = 'none';
    });

    document.getElementById('closeRouteDetailsX')?.addEventListener('click', () => {
        document.getElementById('routeDetailsModal').classList.add('hidden');
        document.getElementById('routeDetailsModal').style.display = 'none';
    });

    // Click outside to close route details modal
    document.getElementById('routeDetailsModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('routeDetailsModal')) {
            e.target.classList.add('hidden');
            e.target.style.display = 'none';
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

    // Update the marker icons definition with improved popup handling
    const markerIcons = {
        order: L.divIcon({
            className: 'order-marker',
            html: `<div class="w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">📦</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]  // Position popup above the marker
        }),
        vehicle: L.divIcon({
            className: 'vehicle-marker',
            html: `<div class="w-8 h-8 rounded-full bg-white border-2 border-green-500 flex items-center justify-center">🚚</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        }),
        outlet: L.divIcon({
            className: 'outlet-marker',
            html: `<div class="w-8 h-8 rounded-full bg-white border-2 border-red-500 flex items-center justify-center">🏪</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        })
    };

    // Initialize chat panel with better styling
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = `
        <div class="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm h-full">
            <div class="border-b border-gray-200 p-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="text-2xl">🤖</div>
                    <div class="font-semibold text-gray-900">Route Optimizer Assistant</div>
                </div>
            </div>
            <div class="flex-1 p-4 space-y-4 overflow-auto bg-white" id="messages"></div>
            <div class="border-t border-gray-200 p-4 space-y-2 bg-white">
                <textarea 
                    id="userMessage"
                    placeholder="Type your message... (e.g., 'plan routes')"
                    class="min-h-[60px] w-full rounded-md border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                ></textarea>
                <button id="sendButton" class="w-full bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600 transition-colors">
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

    function addMessage(type, content, action = null) {
        const messagesDiv = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        
        const classes = {
            user: 'ml-auto bg-gray-100 text-gray-900',
            ai: 'mr-auto bg-gray-200 text-gray-900',
            system: 'mx-auto bg-blue-50 text-blue-900',
            error: 'mx-auto bg-red-50 text-red-900',
            success: 'mx-auto bg-blue-50 text-blue-900'
        };
        
        messageDiv.className = `message ${type} p-4 rounded-lg max-w-[80%] ${classes[type]}`;
        
        // Create text content
        const textElement = document.createElement('div');
        textElement.className = 'mb-2';
        textElement.textContent = content;
        messageDiv.appendChild(textElement);
        
        // Add action button if provided
        if (action) {
            const button = document.createElement('button');
            button.className = 'mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full';
            button.textContent = action.text;
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                action.onClick();
            });
            messageDiv.appendChild(button);
        }
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
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
                            html: `
                                <div class='sequence-marker ${isOutlet ? 'sequence-outlet' : 'sequence-waypoint'}'>
                                    <span>${idx + 1}</span>
                                </div>
                            `,
                            iconSize: [30, 30],
                            iconAnchor: [15, 15],
                            popupAnchor: [0, -16]  // Position popup above the marker
                        });

                        const sequenceMarker = L.marker([wp.location.lat, wp.location.lng], { 
                            icon,
                            interactive: false  // Make sequence markers non-interactive
                        }).addTo(map);
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

        // Add success message with route details button after drawing routes
        addMessage('success', `Routes planned successfully!\n• Total Routes: ${routePlan.routes.length}\n• Total Distance: ${routePlan.totalDistance.toFixed(2)} km\n• Total Duration: ${routePlan.totalDuration} minutes`, {
            text: 'View Route Details',
            onClick: () => {
                const modal = document.getElementById('routeDetailsModal');
                const detailsContainer = document.getElementById('routeDetails');
                
                detailsContainer.innerHTML = `
                    <div class="space-y-6">
                        <div class="bg-blue-50 p-4 rounded">
                            <h3 class="font-semibold text-lg mb-2">Route Summary</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p><strong>Total Routes:</strong> ${routePlan.routes.length}</p>
                                    <p><strong>Total Distance:</strong> ${routePlan.totalDistance.toFixed(2)} km</p>
                                </div>
                                <div>
                                    <p><strong>Total Duration:</strong> ${routePlan.totalDuration} minutes</p>
                                    <p><strong>Total Deliveries:</strong> ${routePlan.routes.reduce((acc, route) => acc + route.deliveries.length, 0)}</p>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            ${routePlan.routes.map((route, idx) => `
                                <div class="border rounded-lg p-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <h4 class="font-semibold">Route ${idx + 1}</h4>
                                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            ${route.deliveries.length} stops
                                        </span>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p><strong>Vehicle:</strong> ${route.vehicle.fleet_id}</p>
                                            <p><strong>Type:</strong> ${route.vehicle.vehicle_type}</p>
                                            <p><strong>Distance:</strong> ${route.distance.toFixed(2)} km</p>
                                        </div>
                                        <div>
                                            <p><strong>Duration:</strong> ${route.duration} minutes</p>
                                            <p><strong>Load:</strong> ${route.load_kg} kg</p>
                                            <p><strong>Capacity:</strong> ${route.vehicle.capacity_kg} kg</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        });
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

    // First, create both modals
    const fleetModalHTML = `
        <div id="fleetModal" class="fixed inset-0 bg-black/50 z-[2000] hidden">
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96">
                <h2 class="text-lg font-semibold mb-4">🚚 Generate Fleet</h2>
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
                    <button id="closeFleet" class="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
                    <button id="generateFleet" class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
                        Generate
                    </button>
                </div>
            </div>
        </div>
    `;

    const ordersModalHTML = `
        <div id="ordersModal" class="fixed inset-0 bg-black/50 z-[2000] hidden">
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96">
                <h2 class="text-lg font-semibold mb-4">📦 Generate Orders</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Number of Orders</label>
                        <input type="number" id="ordersSize" value="20" min="1" max="1000" 
                               class="w-full rounded-md border p-2">
                    </div>
                </div>
                <div class="mt-6 flex justify-end gap-2">
                    <button id="closeOrders" class="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
                    <button id="generateOrders" class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
                        Generate
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add modals to document
    document.body.insertAdjacentHTML('beforeend', fleetModalHTML);
    document.body.insertAdjacentHTML('beforeend', ordersModalHTML);

    // Update the existing button click handlers
    // Remove existing click handlers
    fleetButton.replaceWith(fleetButton.cloneNode(true));
    generateButton.replaceWith(generateButton.cloneNode(true));

    // Get fresh references to the buttons
    const newFleetButton = document.querySelector('button:has(svg path[d*="M8 7h12m0"])');
    const newGenerateButton = document.querySelector('button:has(svg path[d*="M12 9v3m0"])');

    // Add new click handlers
    newFleetButton.addEventListener('click', () => {
        const modal = document.getElementById('fleetModal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    });

    newGenerateButton.addEventListener('click', () => {
        const modal = document.getElementById('ordersModal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    });

    // Rest of the modal handlers...
    // [Previous event handlers for close buttons, generate buttons, etc. remain the same]

    // Generate fleet handler
    document.getElementById('generateFleet').addEventListener('click', async () => {
        const modal = document.getElementById('fleetModal');
        const fleetSize = parseInt(document.getElementById('fleetSize').value);
        const includeTrucks = document.getElementById('includeTrucks').checked;
        const includeVans = document.getElementById('includeVans').checked;

        try {
            modal.classList.add('hidden');
            modal.style.display = 'none';

            const response = await fetch('/api/generate-fleet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ size: fleetSize, includeTrucks, includeVans })
            });

            const data = await response.json();
            if (data.success) {
                handleFleetGeneration(data);
            }
        } catch (error) {
            console.error('Error generating fleet:', error);
            addMessage('error', 'Failed to generate fleet. Please try again.');
        }
    });

    // Generate orders handler
    document.getElementById('generateOrders').addEventListener('click', async () => {
        const modal = document.getElementById('ordersModal');
        const ordersSize = parseInt(document.getElementById('ordersSize').value);

        try {
            modal.classList.add('hidden');
            modal.style.display = 'none';

            const response = await fetch('/api/generate-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    count: ordersSize,
                    bounds: {
                        north: 24.8500,
                        south: 24.5500,
                        east: 46.8500,
                        west: 46.5500
                    }
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
            }
        } catch (error) {
            console.error('Error generating orders:', error);
            addMessage('error', 'Failed to generate orders. Please try again.');
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
    [settingsModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Store the current fleet data globally
    window.currentFleetData = null;

    function handleFleetGeneration(fleetData) {
        // Store the fleet data globally
        window.currentFleetData = {
            trucks: fleetData.distribution.trucks,
            vans: fleetData.distribution.vans,
            available: fleetData.distribution.available,
            maintenance: fleetData.distribution.maintenance,
            vehicles: fleetData.fleets
        };
        
        // Add message with button
        addMessage('success', `Fleet generated successfully! 🚛\n
• Total Vehicles: ${fleetData.distribution.trucks + fleetData.distribution.vans}
• Trucks: ${fleetData.distribution.trucks} 🚛
• Vans: ${fleetData.distribution.vans} 🚐
• Available: ${fleetData.distribution.available} ✅
• In Maintenance: ${fleetData.distribution.maintenance} 🔧`, {
            text: 'View Fleet Details',
            onClick: () => {
                // First, ensure the modal exists
                if (!document.getElementById('fleetDetailsModal')) {
                    const modalHTML = `
                        <div id="fleetDetailsModal" class="fixed inset-0 bg-black/50 items-center justify-center z-[9999] hidden">
                            <div class="relative bg-white rounded-lg shadow-xl w-[80vw] max-h-[80vh] overflow-auto m-4">
                                <div class="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                                    <h2 class="text-xl font-semibold">Fleet Details</h2>
                                    <button id="closeFleetDetailsX" class="text-gray-500 hover:text-gray-700">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div id="fleetDetails" class="p-4">
                                    <!-- Fleet details will be inserted here -->
                                </div>
                                <div class="sticky bottom-0 bg-white border-t p-4">
                                    <button id="closeFleetDetails" class="w-full px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    document.body.insertAdjacentHTML('beforeend', modalHTML);

                    // Add event listeners for the new modal
                    document.getElementById('closeFleetDetails').addEventListener('click', () => {
                        document.getElementById('fleetDetailsModal').classList.add('hidden');
                        document.getElementById('fleetDetailsModal').style.display = 'none';
                    });

                    document.getElementById('closeFleetDetailsX').addEventListener('click', () => {
                        document.getElementById('fleetDetailsModal').classList.add('hidden');
                        document.getElementById('fleetDetailsModal').style.display = 'none';
                    });

                    document.getElementById('fleetDetailsModal').addEventListener('click', (e) => {
                        if (e.target === document.getElementById('fleetDetailsModal')) {
                            e.target.classList.add('hidden');
                        }
                    });
                }

                const modal = document.getElementById('fleetDetailsModal');
                const detailsContainer = document.getElementById('fleetDetails');
                
                detailsContainer.innerHTML = `
                    <div class="space-y-6">
                        <div class="bg-blue-50 p-4 rounded">
                            <h3 class="font-semibold text-lg mb-2">Fleet Summary</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p><strong>Total Vehicles:</strong> ${fleetData.distribution.trucks + fleetData.distribution.vans}</p>
                                    <p><strong>Trucks:</strong> ${fleetData.distribution.trucks}</p>
                                    <p><strong>Vans:</strong> ${fleetData.distribution.vans}</p>
                                </div>
                                <div>
                                    <p><strong>Available:</strong> ${fleetData.distribution.available}</p>
                                    <p><strong>In Maintenance:</strong> ${fleetData.distribution.maintenance}</p>
                                    <p><strong>Utilization:</strong> ${((fleetData.distribution.available / (fleetData.distribution.trucks + fleetData.distribution.vans)) * 100).toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>

                        <div class="border rounded-lg p-4">
                            <h3 class="font-semibold text-lg mb-3">Vehicle Details</h3>
                            <div class="space-y-3">
                                ${fleetData.fleets.map((vehicle, idx) => `
                                    <div class="p-3 ${idx % 2 === 0 ? 'bg-gray-50' : ''} rounded">
                                        <div class="flex justify-between items-center">
                                            <span class="font-medium">
                                                ${vehicle.vehicle_type === 'TRUCK' ? '🚛' : '🚐'} ${vehicle.fleet_id}
                                            </span>
                                            <span class="px-2 py-1 rounded text-sm ${
                                                vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }">
                                                ${vehicle.status}
                                            </span>
                                        </div>
                                        <div class="text-sm text-gray-600 mt-1">
                                            <p><strong>Type:</strong> ${vehicle.vehicle_type}</p>
                                            <p><strong>Capacity:</strong> ${vehicle.capacity_kg}kg</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;

                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        });
    }
});