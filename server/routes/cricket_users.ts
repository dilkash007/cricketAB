import express from 'express';
const router = express.Router();

// Legacy cricket_users route - redirects to site3
router.get('/', (req, res) => {
    res.json({ message: 'Use /api/site3/users instead' });
});

export default router;
