const db = require('./db');

// Wait for database initialization
setTimeout(() => {
    db.serialize(() => {
        // Verify tables
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
                console.error('Error checking tables:', err);
                process.exit(1);
            }
            console.log('Tables created:', tables.map(t => t.name));
            
            // Check sales_orders schema
            db.all("PRAGMA table_info(sales_orders)", (err, columns) => {
                if (err) {
                    console.error('Error checking sales_orders schema:', err);
                    process.exit(1);
                }
                console.log('sales_orders columns:', columns.map(c => c.name));
                process.exit(0);
            });
        });
    });
}, 1000); 