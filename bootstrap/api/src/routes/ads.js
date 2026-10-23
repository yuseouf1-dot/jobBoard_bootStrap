const express = require('express');
const pool = require('../db');
const { missingFields, parseId } = require('../validate');

const router = express.Router();

// GET /ads — list all ads (used by the front-end on page load).
router.get('/', async (req, res) => {
    const [ads] = await pool.query(
        `SELECT a.id, a.title, a.short_description, c.name AS company
         FROM ads a
         JOIN companies c ON c.id = a.company_id
         ORDER BY a.created_at DESC, a.id DESC`
    );
    res.status(200).json(ads);
});

// GET /ads/:id — full detail of one ad.
router.get('/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: 'Ad not found' });

    const [rows] = await pool.query(
        `SELECT a.id, a.title, a.short_description, a.description, a.location, a.salary,
                a.created_at, a.company_id, c.name AS company, c.website AS company_website,
                a.category_id, cat.name AS category
         FROM ads a
         JOIN companies c    ON c.id = a.company_id
         JOIN categories cat ON cat.id = a.category_id
         WHERE a.id = ?`,
        [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Ad not found' });
    res.status(200).json(rows[0]);
});

// POST /ads — create a new ad.
router.post('/', async (req, res) => {
    const missing = missingFields(req.body, ['company_id', 'category_id', 'title', 'short_description']);
    if (missing.length) return res.status(400).json({ error: 'Missing required fields', fields: missing });

    const { company_id, category_id, title, short_description, description, location, salary } = req.body;

    // Referenced rows must exist, otherwise the body is invalid.
    const [[company]] = await pool.query('SELECT id FROM companies WHERE id = ?', [company_id]);
    const [[category]] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (!company || !category) {
        return res.status(400).json({ error: 'Unknown company_id or category_id' });
    }

    const [result] = await pool.query(
        `INSERT INTO ads (company_id, category_id, title, short_description, description, location, salary)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [company_id, category_id, title, short_description, description ?? null, location ?? null, salary ?? null]
    );
    const [[ad]] = await pool.query('SELECT * FROM ads WHERE id = ?', [result.insertId]);
    res.status(201).location(`/ads/${ad.id}`).json(ad);
});

// POST /ads/:id/applications — record a new application for that ad.
// The applicant is identified by email: reused if known, created otherwise.
router.post('/:id/applications', async (req, res) => {
    const adId = parseId(req.params.id);
    if (!adId) return res.status(404).json({ error: 'Ad not found' });

    const [[ad]] = await pool.query('SELECT id FROM ads WHERE id = ?', [adId]);
    if (!ad) return res.status(404).json({ error: 'Ad not found' });

    const missing = missingFields(req.body, ['first_name', 'last_name', 'email', 'message']);
    if (missing.length) return res.status(400).json({ error: 'Missing required fields', fields: missing });

    const { first_name, last_name, email, phone, message } = req.body;

    let [[person]] = await pool.query('SELECT id FROM people WHERE email = ?', [email]);
    if (!person) {
        const [result] = await pool.query(
            'INSERT INTO people (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)',
            [first_name, last_name, email, phone ?? null]
        );
        person = { id: result.insertId };
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO applications (ad_id, person_id, message) VALUES (?, ?, ?)',
            [adId, person.id, message]
        );
        const [[application]] = await pool.query('SELECT * FROM applications WHERE id = ?', [result.insertId]);
        res.status(201).json(application);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This person already applied to this ad' });
        }
        throw err;
    }
});

module.exports = router;
