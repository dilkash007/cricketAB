import express from 'express';
const router = express.Router();

// Legacy cricket_vendors route - redirects to site2
router.get('/', (req, res) => {
    res.json({ message: 'Use /api/site2/vendors instead' });
});

export default router;
