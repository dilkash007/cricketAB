import express from 'express';
import { cricketQuery } from '../config/cricket_db.js';

const router = express.Router();

// GET database schemas
router.get('/schemas', async (req, res) => {
    try {
        const result = await cricketQuery(
            `SELECT schema_name FROM information_schema.schemata 
       WHERE schema_name LIKE 'site%' 
       ORDER BY schema_name`
        );

        res.json({ success: true, schemas: result.rows.map(r => r.schema_name) });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
