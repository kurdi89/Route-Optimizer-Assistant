const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

// Initialize database tables
db.serialize(() => {
  // Drop existing table
  db.run("DROP TABLE IF EXISTS sales_orders");

  // Create sales_orders table with outlet_id
  db.run(`CREATE TABLE IF NOT EXISTS sales_orders (
    id INTEGER PRIMARY KEY,
    order_id TEXT UNIQUE,
    outlet_id INTEGER,
    customer_name TEXT,
    customer_address TEXT,
    latitude REAL,
    longitude REAL,
    order_value REAL,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(outlet_id) REFERENCES outlets(id)
  )`);

  // Create outlets table
  db.run(`
    CREATE TABLE IF NOT EXISTS outlets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create fleet table
  db.run(`
    CREATE TABLE IF NOT EXISTS fleet (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_id TEXT UNIQUE,
      outlet_id INTEGER,
      vehicle_type TEXT,
      capacity_kg INTEGER,
      status TEXT,
      current_latitude REAL,
      current_longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (outlet_id) REFERENCES outlets(id)
    )
  `);

  // Route Plans table
  db.run(`CREATE TABLE IF NOT EXISTS route_plans (
    id INTEGER PRIMARY KEY,
    route_id TEXT UNIQUE,
    fleet_id TEXT,
    planned_start_time DATETIME,
    planned_finish_time DATETIME,
    total_orders INTEGER,
    total_items INTEGER,
    status TEXT,
    FOREIGN KEY(fleet_id) REFERENCES fleet(fleet_id)
  )`);

  // AI Settings table
  db.run(`CREATE TABLE IF NOT EXISTS ai_settings (
    id INTEGER PRIMARY KEY,
    model_for_conversation TEXT,
    model_for_reasoning TEXT,
    model_for_optimization TEXT,
    persistent_instructions TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Initialize outlets if they don't exist
  db.get("SELECT COUNT(*) as count FROM outlets", (err, row) => {
    if (err || row.count === 0) {
      db.run(`
        INSERT INTO outlets (name, district, latitude, longitude, icon) VALUES
        ('North Outlet', 'Al-Arid', 24.8974, 46.6269, '🏭'),
        ('South Outlet', 'Al-Sulay', 24.5755, 46.8509, '🏭')
      `);
    }
  });
});

module.exports = db; 