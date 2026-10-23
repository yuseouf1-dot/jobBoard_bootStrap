require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');

const adsRouter = require('./routes/ads');
const companiesRouter = require('./routes/companies');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/ads', adsRouter);
app.use('/companies', companiesRouter);

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Malformed JSON body -> 400, anything else -> 500.
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log(`HireLoop API listening on http://localhost:${port}`);
});
