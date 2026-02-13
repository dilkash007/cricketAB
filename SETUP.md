
# Elite Admin: Database Setup Guide

This dashboard is designed to be connected to a PostgreSQL database. Follow these steps to make it workable:

### 1. Database Setup
1. Install **PostgreSQL** locally or use a provider like Supabase/Neon.
2. Run the code inside `database_schema.sql` in your SQL Editor to create the tables.
3. Run the "Seeds" (example data) found in `data.ts` translated to SQL `INSERT` statements to see initial data.

### 2. Backend API (Recommendation)
Use **Node.js with Express** and `pg` (node-postgres) to create routes:
- `GET /api/dashboard/stats`: Returns JSON for the 4 top cards.
- `GET /api/dashboard/chart`: Returns the 24-hour bet/win data.
- `GET /api/vendors`: Returns all vendors.
- `POST /api/vendors`: Create a new vendor.

### 3. Connecting the Frontend
The `api_service.ts` file is already created in this project. 
- Currently, it returns **Mock Data** with a simulated delay.
- To connect to your real database, change the `BASE_URL` in `api_service.ts` and uncomment the `fetch` calls.

### 4. Shared Database Logic
Since you mentioned 2 other websites will connect to this database:
- The `users` table should be the source of truth for all apps.
- Use `vendor_id` to separate users belonging to different betting shops.
