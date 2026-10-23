// Returns the list of required fields missing (or blank) in body.
function missingFields(body, fields) {
    return fields.filter((f) => {
        const v = body?.[f];
        return v === undefined || v === null || String(v).trim() === '';
    });
}

// Parses a positive integer id from a URL param, or returns null.
function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = { missingFields, parseId };
