USE hireloop;

-- 1. How many ads has each company posted?
-- LEFT JOIN keeps companies with zero ads.
SELECT c.id, c.name, COUNT(a.id) AS ad_count
FROM companies c
LEFT JOIN ads a ON a.company_id = c.id
GROUP BY c.id, c.name
ORDER BY ad_count DESC;

-- 2. Which ad has received the most applications?
-- Compares against the max so ties all show up.
SELECT a.id, a.title, COUNT(ap.id) AS application_count
FROM ads a
LEFT JOIN applications ap ON ap.ad_id = a.id
GROUP BY a.id, a.title
HAVING COUNT(ap.id) = (
    SELECT MAX(cnt) FROM (
        SELECT COUNT(*) AS cnt FROM applications GROUP BY ad_id
    ) AS counts
);

-- 3. List all applicants for a given ad, with their message.
SET @ad_id = 1;
SELECT a.title, p.first_name, p.last_name, p.email, ap.message, ap.applied_at
FROM applications ap
JOIN people p ON p.id = ap.person_id
JOIN ads a    ON a.id = ap.ad_id
WHERE ap.ad_id = @ad_id
ORDER BY ap.applied_at;
