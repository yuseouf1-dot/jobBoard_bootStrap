const express = require('express');
const pool = require('../db');
const { parseId } = require('../validate');

const router = express.Router();

// GET /companies/:id/ads — list all ads posted by a company.
router.get('/:id/ads', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: 'Company not found' });

    const [companies] = await pool.query('SELECT id FROM companies WHERE id = ?', [id]);
    if (companies.length === 0) return res.status(404).json({ error: 'Company not found' });

    const [ads] = await pool.query(
        `SELECT a.id, a.title, a.short_description, a.location, a.salary, a.created_at,
                cat.name AS category
         FROM ads a
         JOIN categories cat ON cat.id = a.category_id
         WHERE a.company_id = ?
         ORDER BY a.created_at DESC`,
        [id]
    );
    res.status(200).json(ads);
});

module.exports = router;
