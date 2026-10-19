-- Fake rows to have something to query.
USE hireloop;

INSERT INTO companies (name, description, website) VALUES
    ('Acme Corp',  'Industrial software for factories.', 'https://acme.example'),
    ('Pixel Labs', 'Small studio building mobile apps.',  'https://pixellabs.example');

INSERT INTO categories (name) VALUES
    ('Development'),
    ('Design'),
    ('Data');

INSERT INTO ads (company_id, category_id, title, short_description, description, location, salary) VALUES
    (1, 1, 'Backend Developer Intern',
        'Build REST APIs with Node.js.',
        'You will join the platform team and help design and test REST APIs used by our factory dashboards.',
        'Paris', '1200 EUR/month'),
    (1, 3, 'Data Analyst',
        'Turn production data into reports.',
        'Write SQL queries and build dashboards to track machine performance across our sites.',
        'Lyon', '38000 EUR/year'),
    (2, 2, 'UI Designer',
        'Design screens for our mobile apps.',
        'Create mockups and design systems for iOS and Android apps, working closely with developers.',
        'Remote', '35000 EUR/year');

INSERT INTO people (first_name, last_name, email, phone) VALUES
    ('Alice', 'Martin', 'alice.martin@example.com', '0601020304'),
    ('Bob',   'Durand', 'bob.durand@example.com',   '0605060708'),
    ('Chloe', 'Kim',    'chloe.kim@example.com',    NULL);

INSERT INTO applications (ad_id, person_id, message, applied_at) VALUES
    (1, 1, 'I have built two Express APIs during my studies and would love to join.', '2026-10-01 09:15:00'),
    (1, 2, 'Motivated backend student, available from January.',                       '2026-10-02 14:30:00'),
    (1, 3, 'I enjoy SQL and API design, please find my CV attached.',                  '2026-10-03 11:00:00'),
    (2, 3, 'Data is my favourite topic, I would be happy to talk.',                    '2026-10-04 16:45:00'),
    (3, 1, 'I also do UI design on the side, here is my portfolio.',                   '2026-10-05 10:20:00');
