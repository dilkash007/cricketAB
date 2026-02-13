# 🗄️ Database Rebuild Guide

## Architecture Overview

### Multi-Site Data Sharing Architecture

```
cricket_betting Database
│
├── public (SHARED)
│   ├── matches         → All sites see same matches
│   ├── markets         → Betting markets (odds)
│   ├── selections      → Betting options
│   └── admins          → Master admin users
│
├── vender_master_agent_site2 (ISOLATED)
│   ├── vendors         → Site 2 vendors only
│   ├── users           → Site 2 users only
│   ├── bets            → References public.matches
│   ├── transactions    → Financial logs
│   └── audit_logs      → Admin action tracking
│
└── vender_master_agent_site3 (ISOLATED)
    ├── vendors         → Site 3 vendors only
    ├── users           → Site 3 users only
    ├── bets            → References public.matches
    ├── transactions    → Financial logs
    └── audit_logs      → Admin action tracking
```

## 🚀 Rebuild Steps

### Step 1: Backup Current Database (Optional)

```bash
# In pgAdmin or terminal
pg_dump -U postgres cricket_betting > backup_$(date +%Y%m%d).sql
```

### Step 2: Drop & Recreate Database

Open **pgAdmin** → Right-click `cricket_betting` → Delete/Drop

Then run:
```sql
CREATE DATABASE cricket_betting;
```

### Step 3: Execute Complete Schema

1. Open **pgAdmin**
2. Connect to `cricket_betting` database
3. Open Query Tool
4. Load file: `server/sql/complete_rebuild.sql`
5. Click **Execute (F5)**

### Step 4: Verify Installation

```sql
-- Check all schemas created
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name LIKE 'vender%' OR schema_name = 'public';

-- Should show:
-- public
-- vender_master_agent_site2
-- vender_master_agent_site3

-- Check tables
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema IN ('public', 'vender_master_agent_site2', 'vender_master_agent_site3')
ORDER BY table_schema, table_name;
```

### Step 5: Test Sample Data

```sql
-- View shared matches (all sites can see)
SELECT * FROM public.matches;

-- View Site 2 users
SELECT * FROM vender_master_agent_site2.users;

-- View Site 3 users
SELECT * FROM vender_master_agent_site3.users;

-- View Site 2 vendors
SELECT * FROM vender_master_agent_site2.vendors;
```

## 📊 Key Features

### ✅ Data Sharing

- **Matches** in `public.matches` → Visible to ALL sites
- **Markets & Odds** → Shared across all sites
- Users from Site 2 and Site 3 can bet on SAME matches

### ✅ Data Isolation

- Site 2 users **CANNOT** see Site 3 users
- Site 2 vendors **CANNOT** see Site 3 vendors
- Each site has independent financial ledgers

### ✅ Scalability

To add **Site 4**, just copy Site 3 structure:
```sql
CREATE SCHEMA vender_master_agent_site4;
-- Then copy all table definitions, replacing site3 with site4
```

## 🔧 Backend Compatibility

Your existing APIs will work perfectly:

```typescript
// Get Site 2 users
GET /api/cricket/users/vender_master_agent_site2

// Get Site 3 users
GET /api/cricket/users/vender_master_agent_site3

// Get Site 2 vendors
GET /api/cricket/vendors/vender_master_agent_site2

// Shared matches (all sites)
GET /api/cricket/matches
```

## 📝 After Rebuild

1. ✅ Restart backend server (auto-reconnects)
2. ✅ Test user creation from admin dashboard
3. ✅ Verify schema selector shows both sites
4. ✅ Create test users in both sites
5. ✅ Verify users can login on betting website

## 🎯 Benefits

1. **Clean Structure** - Proper organization
2. **Data Sharing** - Matches shared across sites
3. **Privacy** - Users isolated per site
4. **Scalable** - Easy to add Site 4, 5, 6...
5. **Performance** - Proper indexes added
6. **Audit Trail** - All admin actions logged

## ⚠️ Important Notes

- **Password Hashes**: Update admin password hash in seed data
- **Foreign Keys**: Bets reference public matches (data sharing!)
- **Transactions**: Each site tracks its own
- **Exposure**: User's locked funds in active bets

Ready to rebuild! 🚀
