cricket_betting Database
├── users           → Betting players
├── matches         → Cricket matches
├── bets            → User bets
├── transactions    → Money in/out
└── admins          → Dashboard admins
```

**NO VENDORS!** Sirf Admin aur Users.

---

## Setup Steps

### 1️⃣ Create Database

1. **pgAdmin** open karo
2. Left side mein **Databases** pe right-click
3. **Create → Database**
4. Name: `cricket_betting`
5. **Save** click karo

![Created Database](file:///C:/Users/The%20Machine/.gemini/antigravity/brain/b11228ed-854e-43b0-8081-96ffa0bd9a78/uploaded_media_1769933319777.png)

---

### 2️⃣ Execute SQL Script

1. `cricket_betting` database pe **right-click**
2. **Query Tool** select karo
3. **File → Open**
4. Select: `server/sql/simple_setup.sql`
5. **Execute (F5)** press karo
6. Neeche "Query returned successfully" dikhna chahiye!

---

### 3️⃣ Verify Tables Created

Query tool mein run karo:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Output:**
- admins
- bets
- matches
- transactions
- users

---

### 4️⃣ Check Sample Data

```sql
-- View users
SELECT * FROM users;

-- View matches  
SELECT * FROM matches;

-- View admin
SELECT * FROM admins;
```

---

### 5️⃣ Update .env File

Verify `.env` has:

```env
# Cricket Betting Database
CRICKET_DB_HOST=localhost
CRICKET_DB_USER=postgres
CRICKET_DB_PASSWORD=dilkash@321
CRICKET_DB_NAME=cricket_betting
CRICKET_DB_PORT=5432
```

---

### 6️⃣ Restart Backend

```bash
# Stop current server (Ctrl+C)
npm run server
```

Backend should connect automatically!

---

## Test Credentials

**Admin Dashboard:**
- Username: `admin`
- Password: `admin123`

**Test Betting Users:**
- Username: `testplayer1`, `testplayer2`, `testplayer3`
- Password: `test@123`
- Balance: $5000, $10000, $2500

---

## What's Next?

1. ✅ Database ready
2. ✅ Backend connects
3. ✅ Admin can create users
4. ✅ Users can login on betting site
5. ⏳ Test everything!

Done! Simple aur clean! 🎉
