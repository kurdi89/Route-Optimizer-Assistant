# 🚀 Route Optimization AI App - Setup Guide

## **📌 Overview**

This document provides step-by-step instructions to set up a **simple yet powerful** AI-powered route optimization app using:

- **HTML + TailwindCSS + Alpine.js** (Minimal frontend, no React/Next.js)
- **Node.js + LangChain** (Backend AI orchestration)
- **SQLite** (Lightweight database)
- **Mapbox API** (Route calculation)
- **OpenRouter LLMs** (Choose different models for each task)

---

## **📂 Project Structure**

```
📦 route-optimization-app
 ┣ 📂 backend
 ┃ ┣ 📜 server.js          # Express server & LangChain logic
 ┃ ┣ 📜 db.js              # SQLite database setup
 ┃ ┗ 📜 .env               # Environment variables
 ┣ 📂 frontend
 ┃ ┣ 📜 index.html         # UI layout
 ┃ ┣ 📜 styles.css         # Tailwind styles (optional)
 ┃ ┗ 📜 app.js             # Alpine.js logic
 ┣ 📜 package.json         # Node.js dependencies
 ┗ 📜 README.md            # Project documentation
```

---

## **🛠 Setup Instructions**

### **1️⃣ Install Dependencies**

Ensure you have **Node.js (18+)** installed, then run:

```sh
npm init -y
npm install express dotenv sqlite3 langchain axios openai @langchain/community
```

### **2️⃣ Set Up Environment Variables**

Create a `.env` file in the `backend/` folder and add:

```sh
OPENROUTER_API_KEY=your-api-key-here
MAPBOX_API_KEY=your-mapbox-key-here
PORT=3000
```

---

## **🌍 Backend (Node.js & LangChain)**

### **3️⃣ Database Setup (********`db.js`********)**

Create an SQLite database for **sales orders, fleet, and stocks**:

```js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/data.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS sales_orders (
    id INTEGER PRIMARY KEY,
    latitude REAL,
    longitude REAL,
    priority TEXT,
    branch TEXT,
    status TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS fleet (
    id INTEGER PRIMARY KEY,
    capacity_kg INTEGER,
    capacity_volume REAL,
    branch TEXT,
    status TEXT
  )`);
});

module.exports = db;
```

### **4️⃣ Server & AI Logic (********`server.js`********)**

```js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { OpenAI } = require("@langchain/community/llms/openai");
const db = require("./db");

const app = express();
app.use(express.json());

const aiModels = {
  chat: new OpenAI({ model: "mistral-7b", apiKey: process.env.OPENROUTER_API_KEY }),
  reasoning: new OpenAI({ model: "deepseek-coder", apiKey: process.env.OPENROUTER_API_KEY }),
  optimization: new OpenAI({ model: "mixtral", apiKey: process.env.OPENROUTER_API_KEY })
};

app.post("/optimize-route", async (req, res) => {
  try {
    const orders = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM sales_orders WHERE status = 'PENDING'", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    const response = await aiModels.optimization.call(
      `Optimize a delivery route for these orders: ${JSON.stringify(orders)}`
    );
    
    res.json({ route_plan: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
```

---

## **🖥 Frontend (HTML + Tailwind + Alpine.js)**

### **5️⃣ UI (********`index.html`********)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x/dist/cdn.min.js"></script>
</head>
<body class="p-6 bg-gray-100">
  <div x-data="chatApp()" class="max-w-lg mx-auto bg-white p-4 shadow-lg">
    <h2 class="text-xl font-bold">Route Optimization AI</h2>
    <div class="mt-4">
      <input type="text" x-model="userMessage" class="w-full p-2 border" placeholder="Ask AI...">
      <button @click="sendMessage" class="mt-2 bg-blue-500 text-white px-4 py-2">Send</button>
    </div>
    <div class="mt-4 p-2 bg-gray-50" x-text="response"></div>
  </div>
  
  <script src="app.js"></script>
</body>
</html>
```

### **6️⃣ Chat Logic (********`app.js`********)**

```js
function chatApp() {
  return {
    userMessage: "",
    response: "",
    async sendMessage() {
      let res = await fetch("http://localhost:3000/optimize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: this.userMessage })
      });
      let data = await res.json();
      this.response = data.route_plan;
    }
  };
}
```

---

## **🔄 Alternative AI Models**

This setup allows users to choose different models for each task:

| Task         | Default Model    | Alternatives              |
| ------------ | ---------------- | ------------------------- |
| Chat         | `mistral-7b`     | `gemma-7b`, `llama-3`     |
| Reasoning    | `deepseek-coder` | `gpt-4`, `code-llama`     |
| Optimization | `mixtral`        | `claude-3-haiku`, `gemma` |

To change models, edit `server.js`:

```js
aiModels.optimization = new OpenAI({ model: "claude-3-haiku", apiKey: process.env.OPENROUTER_API_KEY });
```

---

## **🚀 Running the App**

### **7️⃣ Start Backend**

```sh
node backend/server.js
```

### **8️⃣ Open ********`index.html`******** in a Browser**

That’s it! You now have a **minimal yet powerful AI-powered route optimization app.** 🎉

---

## **🔗 Next Steps**

- ✅ Add **Mapbox API** for real route visualization.
- ✅ Extend AI memory to improve responses.
- ✅ Deploy on **Vercel (Frontend)** & **Railway (Backend)**.

Let me know if you need further refinements! 🚀



---

# 🚀 Route Optimization AI App - Detailed Overview

## **📌 What is This App For?**
This application is designed to optimize delivery routes using AI-powered decision-making. It assists logistics companies, delivery services, and businesses with managing large numbers of daily orders while ensuring efficiency. The AI will analyze order locations, available fleet capacity, and delivery constraints to generate optimized delivery plans. Users interact with the system via a **conversational AI interface**, making it simple and intuitive to use without requiring manual configuration of routes.

### **Key Features:**
- AI-assisted route optimization based on live sales orders and fleet availability.
- Interactive chat-based interface for users to provide instructions and receive optimized plans.
- Lightweight frontend with **HTML, TailwindCSS, and Alpine.js** for a minimal yet powerful UI.
- Backend powered by **Node.js and LangChain** for AI reasoning and decision-making.
- Integration with **SQLite** to manage orders, fleet data, and stock levels.
- Use of **OpenRouter LLMs** to allow AI-driven route optimization, reasoning, and conversation.
- Configurable AI model selection, enabling users to pick the best LLM for specific tasks.

---

## **📌 How Will It Be Created?**
The app will be built with a focus on **simplicity, speed, and flexibility**. The stack will ensure minimal dependencies while maintaining a smooth user experience. The system will include:

1. **Frontend** (User Interface)
   - Designed with **HTML, TailwindCSS, and Alpine.js** for an intuitive, lightweight UI.
   - A **chat-based** input system where users can type instructions for the AI.
   - A **map visualization** for displaying optimized routes (integrated with Mapbox).
   - A **configuration panel** for selecting AI models and setting preferences.

2. **Backend** (Logic & Processing)
   - Built with **Node.js (Express.js)** to handle API requests and AI logic.
   - Uses **LangChain** to integrate AI reasoning and model selection.
   - Stores data in **SQLite**, managing sales orders, fleet distribution, and stock levels.
   - Processes AI requests using **OpenRouter LLMs**, allowing different models for conversation, reasoning, and optimization.

3. **AI Models** (Decision-Making & Optimization)
   - **Chat Interaction**: Uses `mistral-7b`, `gemma-7b`, or `llama-3` for user interactions.
   - **Reasoning & Analysis**: Utilizes `deepseek-coder`, `gpt-4`, or `code-llama` to process user instructions.
   - **Route Optimization**: Powered by `mixtral`, `claude-3-haiku`, or `gemma` for generating optimized delivery routes.
   - AI models are configurable, so users can select which model to use for each task in the settings panel.

---

## **📌 Layout & User Interaction**

### **User Interface Design:**
- **Map (Left Side)**: Displays order locations and optimized delivery routes.
- **Configuration Menu (Right Side)**: Allows users to set preferences, select AI models, and configure settings.
- **Chatbox (Bottom Section)**: Users can type commands and receive AI-generated responses for optimized routes.
- **Settings Icon**: Provides access to model selection, fleet constraints, and priority configurations.
- **Wide-Screen Modal**: Once the system generates the optimized routes, it displays them on the map as labeled routes. A large, wide-screen modal will appear, showing a table with the created trips. Each trip will include detailed information such as:
  - **Planned Start Time**
  - **Planned Finish Time**
  - **Fleet Number**
  - **Number of Orders**
  - **Number of Items**
  - **Other relevant trip details**

### **How It Works:**
1. **Startup & Order Generation**: Each day, the app generates **3,000 random sales orders** unless existing data is found.
2. **User Interaction**: The user enters a request in the chatbox (e.g., "Optimize deliveries for today").
3. **AI Processing**: LangChain processes the request, retrieving sales orders and fleet data from SQLite.
4. **Optimization Execution**: The AI selects the best fleet-to-order assignment and generates an optimized delivery route.
5. **Visualization & Response**: The optimized route appears on the map, and a structured response is sent in the chat.
6. **Trip Summary Display**: A wide-screen modal opens with a table listing all trips and their associated details.
7. **Customization**: Users can adjust AI models, change parameters, and re-run the optimization.

---

## **📌 How Can It Be Used?**
- **Delivery Services**: Optimize daily deliveries across multiple branches.
- **Fleet Management**: Ensure the best use of vehicle capacity and availability.
- **E-Commerce & Retail**: Improve delivery efficiency for online orders.
- **Supply Chain Operations**: Plan and execute large-scale logistics movements.
- **AI Experimentation**: Test different LLMs for decision-making in a logistics context.

---

## **📌 Extensibility & Future Improvements**
This app is designed to be **easily extendable**. Possible future enhancements include:
- **Real-time Traffic Data**: Integrate traffic conditions into route optimization.
- **Live GPS Tracking**: Monitor delivery progress dynamically.
- **Multi-Agent AI Collaboration**: Use different AI agents for scheduling, prediction, and customer interactions.
- **Web Deployment**: Deploy on **Vercel (Frontend)** and **Railway (Backend)** for scalability.

With this comprehensive design, an AI code generator can build the full application efficiently! 🚀

---

Here’s the list of database tables and their schemas for your Route Optimization AI App using SQLite:

📌 Database Schema Overview

The system requires a structured database to manage sales orders, fleet data, inventory, and route optimizations. The following tables will be created:

1️⃣ sales_orders (Stores daily generated sales orders)

Manages all incoming orders that need to be delivered.

Column Name	Data Type	Description
id	INTEGER (PK)	Auto-incrementing unique order ID
order_id	TEXT (UNIQUE)	Unique identifier for the order
customer_name	TEXT	Name of the customer
customer_address	TEXT	Delivery address
latitude	REAL	Latitude for delivery location
longitude	REAL	Longitude for delivery location
order_value	REAL	Total price of the order
status	TEXT	Status of the order (pending, in_progress, completed, canceled)
created_at	DATETIME	Timestamp when order was created

2️⃣ fleet (Stores fleet and vehicle details)

Represents available vehicles for deliveries.

Column Name	Data Type	Description
id	INTEGER (PK)	Auto-incrementing unique vehicle ID
fleet_id	TEXT (UNIQUE)	Unique fleet identifier
branch	TEXT	The branch where the vehicle is stationed (north_riyadh, south_riyadh)
capacity	INTEGER	Maximum number of orders/items the vehicle can handle
status	TEXT	Fleet availability status (available, in_transit, under_maintenance)
current_location_lat	REAL	Current latitude of the vehicle
current_location_lon	REAL	Current longitude of the vehicle
last_updated	DATETIME	Last time the fleet location/status was updated

3️⃣ items (Stores individual items within sales orders)

Keeps track of items in each order.

Column Name	Data Type	Description
id	INTEGER (PK)	Auto-incrementing unique item ID
order_id	TEXT (FK)	Foreign key referencing sales_orders(order_id)
item_name	TEXT	Name of the item
quantity	INTEGER	Number of items in the order
weight	REAL	Weight of the item (kg)
category	TEXT	Item category (e.g., electronics, groceries, furniture)

4️⃣ stocks (Tracks available inventory levels)

Stores stock availability at different branches.

Column Name	Data Type	Description
id	INTEGER (PK)	Auto-incrementing unique stock ID
branch	TEXT	The branch where stock is stored (north_riyadh, south_riyadh)
item_name	TEXT	Name of the item
available_qty	INTEGER	Available stock quantity
last_updated	DATETIME	Last time stock was updated

5️⃣ route_plans (Stores generated optimized delivery routes)

Contains the AI-generated delivery routes.

Column Name	Data Type	Description
id	INTEGER (PK)	Auto-incrementing unique route ID
route_id	TEXT (UNIQUE)	Unique identifier for the route
fleet_id	TEXT (FK)	Foreign key referencing fleet(fleet_id)
planned_start_time	DATETIME	Expected start time of the trip
planned_finish_time	DATETIME	Expected finish time of the trip
total_orders	INTEGER	Total number of orders in the route
total_items	INTEGER	Total number of items in the route
status	TEXT	Route status (pending, in_progress, completed)

6️⃣ route_stops (Stores each stop within a route)

Defines all stops within a generated delivery route.

Column Name	Data Type	Description
id	INTEGER (PK)	Auto-incrementing unique stop ID
route_id	TEXT (FK)	Foreign key referencing route_plans(route_id)
stop_number	INTEGER	Order of the stop in the route
order_id	TEXT (FK)	Foreign key referencing sales_orders(order_id)
latitude	REAL	Latitude of the stop location
longitude	REAL	Longitude of the stop location
eta	DATETIME	Estimated arrival time at the stop
actual_arrival_time	DATETIME	Actual arrival time (null if not yet arrived)

7️⃣ ai_settings (Stores user-defined AI preferences)

Allows users to configure AI settings dynamically.

Column Name	Data Type	Description
id	INTEGER (PK)	Auto-incrementing unique setting ID
model_for_conversation	TEXT	LLM model selected for chat (mistral-7b, gemma-7b, llama-3, etc.)
model_for_reasoning	TEXT	LLM model selected for processing logic (deepseek-coder, gpt-4, etc.)
model_for_optimization	TEXT	LLM model selected for route optimization (mixtral, claude-3-haiku, etc.)
last_updated	DATETIME	Timestamp when settings were last modified

8️⃣ user_sessions (Tracks ongoing AI interactions)

Stores previous conversations to maintain chat memory.

Column Name	Data Type	Description
id	INTEGER (PK)	Auto-incrementing unique session ID
session_id	TEXT (UNIQUE)	Unique session identifier
user_query	TEXT	User’s input/query to the AI
ai_response	TEXT	AI’s response to the query
timestamp	DATETIME	Timestamp of the interaction

9️⃣ logs (Tracks system events and errors)

Stores operational logs for debugging and monitoring.

Column Name	Data Type	Description
id	INTEGER (PK)	Auto-incrementing unique log ID
log_type	TEXT	Type of log (info, warning, error)
message	TEXT	Log message
created_at	DATETIME	Timestamp of log entry

📌 Summary of Database Tables
	1.	sales_orders → Stores customer orders.
	2.	fleet → Manages delivery vehicles.
	3.	items → Tracks items within each order.
	4.	stocks → Stores inventory levels.
	5.	route_plans → Holds AI-generated delivery routes.
	6.	route_stops → Defines all stops in a delivery route.
	7.	ai_settings → Allows users to configure AI model selection.
	8.	user_sessions → Maintains AI chat memory.
	9.	logs → Stores system activity logs.

📌 Summary of Database Relationships
	1.	One-to-many relationship between sales_orders and items.
	2.	One-to-many relationship between sales_orders and route_plans.
	3.	One-to-many relationship between sales_orders and route_stops.
	4.	One-to-many relationship between sales_orders and stocks.
	5.	One-to-many relationship between sales_orders and fleet.
	6.	One-to-many relationship between route_plans and route_stops.
	7.	One-to-many relationship between route_plans and ai_settings.
	8.	One-to-many relationship between route_plans and user_sessions.
	9.	One-to-many relationship between route_plans and logs.

📌 Updated Database Schema with Persistent User Instructions for Optimization

I’ve added a new column to the ai_settings table to store persistent user-defined instructions for route optimization. These instructions allow users to specify constraints such as avoiding highways, limiting fleet capacity per trip, prioritizing certain customers, or preferring shortest vs. fastest routes.

📌 Updated Database Schema Overview

The updated schema allows users to input persistent optimization rules, ensuring AI considers their preferences when generating routes.

📌 Updated Table: ai_settings

This table now includes a column for persistent instructions.

Column Name	Data Type	Description
id	INTEGER (PK)	Auto-incrementing unique setting ID
model_for_conversation	TEXT	LLM model selected for chat (mistral-7b, gemma-7b, llama-3, etc.)
model_for_reasoning	TEXT	LLM model selected for processing logic (deepseek-coder, gpt-4, etc.)
model_for_optimization	TEXT	LLM model selected for route optimization (mixtral, claude-3-haiku, etc.)
persistent_instructions	TEXT	JSON or TEXT storing user-defined rules (e.g., "avoid_highways": true, "max_orders_per_fleet_x": 5")
last_updated	DATETIME	Timestamp when settings were last modified

📌 How Persistent Instructions Work
	1.	User enters rules in the settings menu
	•	Example:
	•	Avoid highways
	•	Limit Fleet-X to 5 orders per trip
	•	Prioritize VIP customers first
	•	Prefer shortest route over fastest route
	•	Group orders by region
	2.	System stores these rules in ai_settings.persistent_instructions
	•	Stored in JSON format for easy processing.
	•	Example JSON structure:

{
  "avoid_highways": true,
  "max_orders_per_fleet_x": 5,
  "priority_customers": ["Customer A", "Customer B"],
  "route_preference": "shortest"
}


	3.	Route Optimization Model Reads These Rules Before Generating Routes
	•	When optimizing routes, the AI will always check these rules before making decisions.
	•	Example Impact:
	•	If avoid_highways = true, routes will be generated using only city roads.
	•	If max_orders_per_fleet_x = 5, fleet X won’t be assigned more than 5 orders.
	4.	Users Can Update Instructions Anytime
	•	Changes take effect immediately for all future route generations.

📌 Summary of Enhancements
	•	Users can now define persistent rules that AI follows always during route optimization.
	•	Stored in ai_settings.persistent_instructions in JSON format.
	•	Rules dynamically impact how routes are created, making AI customizable to business needs.
	•	Flexible for future expansion (e.g., new constraints like “avoid toll roads” or “prefer early deliveries”).

🚀 This makes the system more powerful, user-friendly, and adaptable to real-world logistics constraints! 😊


📌 Configuration Side Menu - Full Details

The configuration side menu is a critical feature of your route optimization app, allowing users to customize settings, choose AI models, define optimization rules, and tweak parameters that affect how deliveries are planned.

It consists of multiple sections that give users full control over the AI’s behavior, fleet settings, map display, and optimization constraints.

📌 Sections of the Configuration Menu

1️⃣ AI & Model Selection

This section allows the user to choose which AI models will handle different tasks. Since multiple models can be used for different aspects, users can select the best model for each.

Option	Description	Example Choices
LLM for Conversation	The AI model that responds to user queries and commands.	mistral-7b, gemma-7b, llama-3, gpt-4, claude-3-haiku
LLM for Reasoning & Decision Making	The AI model used for processing complex constraints and making smart decisions.	deepseek-coder, gpt-4, mixtral, llama-3-8b
LLM for Route Optimization	The AI model responsible for optimizing routes and fleet assignments.	mixtral, gpt-4-turbo, claude-3-sonnet

🔹 Why is this needed?
	•	Some models are better for reasoning, while others are faster for conversation.
	•	Users can switch models dynamically based on their needs (e.g., prioritize speed vs. accuracy).

2️⃣ Optimization Settings

This section allows the user to control how AI optimizes deliveries by setting rules and constraints.

Option	Description	Example Values
Optimization Goal	Optimize for fastest time, shortest distance, or cost-effectiveness.	fastest_time, shortest_distance, minimize_cost
Max Orders per Fleet Vehicle	Limit the number of orders a fleet vehicle can take.	5, 10, unlimited
Prioritize Certain Customers	Always deliver to specific customers first.	VIP Customers, Warehouse Orders
Group Orders by Region	Ensure orders in the same area are grouped into the same trips.	true/false
Avoid Highways	Prevents AI from suggesting highway routes.	true/false
Avoid Toll Roads	Avoids routes that have toll fees.	true/false
Delivery Time Window	Define the range when deliveries can be made.	8 AM - 6 PM

🔹 How it Works:
	•	The AI will always consider these rules when planning routes.
	•	Users can dynamically update constraints, and the AI will recalculate trips instantly.

3️⃣ Fleet & Vehicle Settings

This section allows users to configure details about their fleet, such as vehicle capacity and availability.

Option	Description	Example Values
Number of Available Vehicles	How many fleet vehicles are in operation today.	10, 20, 50
Vehicle Capacity (per trip)	Maximum number of items a vehicle can carry.	100 kg, 200 kg, 500 kg
Vehicle Type Preference	Select different vehicle types for different trip requirements.	Vans, Trucks, Motorcycles
Fuel Efficiency Consideration	Whether AI should optimize for fuel efficiency.	true/false

🔹 Why is this important?
	•	Helps the AI assign orders to the best-suited vehicles.
	•	Avoids overloading or underutilizing fleet capacity.

4️⃣ User Preferences & Custom Rules

Users can set persistent instructions that AI will always follow when optimizing routes.

Option	Description	Example Values
Persistent AI Instructions	Custom rules users want AI to follow every time.	"Always limit Fleet-X to 5 orders"
Preferred Route Strategy	Users can choose how AI calculates routes.	Shortest, Fastest, Balanced
Blacklisted Areas/Zones	Areas where deliveries should not be planned.	"Industrial Zone 5", "Traffic Congested Area"

🔹 Example Persistent Instruction:
	•	"Always avoid downtown during rush hours (7-9 AM & 4-6 PM)."
	•	"Prioritize VIP customers before standard customers."

This ensures the AI remembers user-defined strategies for every new route.

5️⃣ Map Display Options

Since the app features a map on the left, users can control how data is displayed.

Option	Description	Example Values
Show Routes on Map	Toggle visibility of route paths.	true/false
Label Routes by Fleet Number	Display fleet numbers on map routes.	true/false
Color Code Trips	Assign different colors to different trips.	true/false
Show Traffic Conditions	Overlay real-time traffic data.	true/false
Show Vehicle Live Location	Track fleet vehicles in real-times.	true/false

🔹 Why is this useful?
	•	Helps dispatchers visualize routes in real time.
	•	Allows quick adjustments to trips based on traffic and delays.

📌 Final Thoughts

This configuration menu makes the AI highly flexible and customizable, allowing users to control every aspect of route planning, fleet management, and AI decision-making.

# Chat Interactions : 
here is how the chat interactions should work : 

1. the user will be able to ask for the routes for the day :
- generate the routes for the day based on the optimization settings and the persistent instructions
- the user can ask for the routes for the day by fleet 
- the user can ask for the status of the routes for the day 
- the user can ask for the routes for the day by fleet 
- the user can ask for the status of the routes for the day by fleet

system should respond with (in sequensed steps and replies) : 
- ok let me help you with that 
- let me check the routes for the day, I can see that you have X fleets available today 
- I can see you have X orders to deliver today
- let me start by generating the routes for the day based on the optimization settings and the persistent instructions
- I can see that your custom instructions X and to do Y
- let me try cluster the orders by region and see if I can find the best routes for the day
- confirming on the stock levels for the day 
- let me check the orders for the day, I can see that you have X orders to deliver today
- let me check the orders for the day by fleet 
- let me check the status of the orders for the day 
- let me check the status of the orders for the day by fleet
- I am building the routes for the day based on the optimization settings and the persistent instructions
- here is the most efficient routes for the day based on given instructions for each fleet by outlet

then shows the on the maps and gives the user the option to view a table of routes with the following details : 
- fleet number
- outlet name
- address
- estimated time of arrival
- status
- distance
- duration
- route
- route details
- route instructions
- route map
- route summary
- list of orders in the route
- list of orders in the route by fleet
- sequence of the route

