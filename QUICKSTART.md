# Quick Fix Guide - Elite Admin Dashboard

## Files Created/Fixed:
1. ✅ `index.css` - Global styles (was missing)
2. ✅ `server/config/database.ts` - Database connection
3. ✅ `server/services/diamond_api.ts` - Diamond Betting API
4. ✅ Updated `vite.config.ts` - Added API proxy
5. ✅ Updated `.env` - Local PostgreSQL config

## How to Run:

### Frontend:
```bash
npm run dev
# Runs on http://localhost:3000
```

### Backend:
```bash  
npm run server
# Runs on http://localhost:5000
```

## Login Credentials:
- Email: `demo123@gmail.com`
- Password: `demo123`

## Next Steps:
1. Create `master_project_db` database in pgAdmin
2. Run SQL files from `server/sql/` folder
3. Start backend first, then frontend

## Common Issues:
- **White page**: Check browser console for errors
- **Database errors**: Make sure PostgreSQL is running
- **Port conflicts**: Change ports in `.env` if needed
