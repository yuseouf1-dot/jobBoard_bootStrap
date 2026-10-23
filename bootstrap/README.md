# HireLoop — Job Board Bootstrap

A tiny job board for the fictional recruiting agency **HireLoop**, built in three layers:

| Layer     | Folder    | Stack                         |
|-----------|-----------|-------------------------------|
| Database  | `db/`     | MySQL 8                       |
| REST API  | `api/`    | Node.js, Express 5, mysql2    |
| Front-end | `front/`  | HTML, CSS, vanilla JS (`fetch()`) |

```
front/index.html  --fetch()-->  api (localhost:3000)  --SQL-->  MySQL (hireloop)
```

## Project structure

```
bootstrap/
├── db/
│   ├── schema.sql        # creates the hireloop database and its tables (re-runnable)
│   ├── seed.sql          # fake rows: 2 companies, 3 categories, 3 ads, 3 people, 5 applications
│   └── queries.sql       # the three analysis queries
├── api/
│   ├── .env              # local configuration (git-ignored, create it yourself)
│   ├── package.json
│   └── src/
│       ├── server.js     # Express app, error handling
│       ├── db.js         # MySQL connection pool
│       ├── validate.js   # required-field and id helpers
│       └── routes/
│           ├── ads.js
│           └── companies.js
└── front/
    ├── index.html
    ├── style.css
    └── app.js            # fetches ads and renders them into the DOM
```

## Prerequisites

- MySQL 8 server running locally
- A MySQL client: `mysql`, MySQL Shell (`mysqlsh`) or MySQL Workbench
- Node.js 20 or later

## Setup

### 1. Create the database

Run `schema.sql` then `seed.sql`. `schema.sql` drops and recreates `hireloop`, so running both again resets the data.

With the `mysql` client:

```sh
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql
```

With MySQL Shell:

```sh
mysqlsh --sql -u root -h localhost -f db/schema.sql
mysqlsh --sql -u root -h localhost -f db/seed.sql
```

With MySQL Workbench: **File → Open SQL Script**, open each file, then click ⚡ (Execute).

### 2. Create a database user for the API (recommended)

The API does not need root. As root, create a user restricted to the `hireloop` database:

```sql
CREATE USER 'hireloop'@'localhost' IDENTIFIED BY 'choose-a-password';
GRANT ALL PRIVILEGES ON hireloop.* TO 'hireloop'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure the API

Create `api/.env` with the following content, using the user and password from step 2:

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=hireloop
DB_PASSWORD=choose-a-password
DB_NAME=hireloop
```

Every variable is optional and falls back to the default below:

| Variable      | Default     | Description                 |
|---------------|-------------|-----------------------------|
| `PORT`        | `3000`      | Port the API listens on     |
| `DB_HOST`     | `localhost` | MySQL host                  |
| `DB_PORT`     | `3306`      | MySQL port                  |
| `DB_USER`     | `root`      | MySQL user (e.g. `hireloop`) |
| `DB_PASSWORD` | *(empty)*   | MySQL password              |
| `DB_NAME`     | `hireloop`  | Database name               |

`.env` is git-ignored: never commit real credentials.

### 4. Run the API

```sh
npm install
npm run dev               # restarts on code changes
```

The API is ready when it prints `HireLoop API listening on http://localhost:3000`.
`.env` is only read at startup: restart the server after editing it.

### 5. Open the front-end

With the API running, open `front/index.html` in a browser (double-click it, or use a local server such as VS Code Live Server).
The API URL is set at the top of `front/app.js` (`API_URL`).

## Database schema

```
companies 1───* ads *───1 categories
                 1
                 │
                 *
            applications *───1 people
```

| Table          | Purpose | Key columns |
|----------------|---------|-------------|
| `companies`    | Companies posting ads | `name`, `description`, `website` |
| `categories`   | Job categories | `name` (unique) |
| `ads`          | Job ads, each with exactly one company and one category | `company_id`, `category_id`, `title`, `short_description`, `description`, `location`, `salary` |
| `people`       | Applicants | `first_name`, `last_name`, `email` (unique), `phone` |
| `applications` | Join table for the many-to-many people ↔ ads relation | `ad_id`, `person_id`, `message`, `applied_at` |

A person can apply to several ads and an ad can receive several applications, but a person can apply only once to the same ad (`UNIQUE (ad_id, person_id)`).

`db/queries.sql` answers:

1. How many ads has each company posted?
2. Which ad has received the most applications? (ties are all returned)
3. Who applied to a given ad, and with which message?

## API routes

| Method | Route                   | Description                     | Success | Errors |
|--------|-------------------------|---------------------------------|---------|--------|
| GET    | `/ads`                  | List all ads                    | 200     | |
| GET    | `/ads/:id`              | Full detail of one ad           | 200     | 404 unknown ad |
| POST   | `/ads`                  | Create an ad                    | 201     | 400 missing field, unknown company or category |
| POST   | `/ads/:id/applications` | Apply to an ad                  | 201     | 400 missing field, 404 unknown ad, 409 already applied |
| GET    | `/companies/:id/ads`    | List the ads of one company     | 200     | 404 unknown company |

Any other route returns `404`, a malformed JSON body returns `400`. Errors are JSON: `{ "error": "..." }`, plus `fields` listing missing fields for a `400`.

### Request bodies

`POST /ads`

| Field               | Required |
|---------------------|----------|
| `company_id`        | yes |
| `category_id`       | yes |
| `title`             | yes |
| `short_description` | yes |
| `description`       | no  |
| `location`          | no  |
| `salary`            | no  |

`POST /ads/:id/applications`

| Field        | Required |
|--------------|----------|
| `first_name` | yes |
| `last_name`  | yes |
| `email`      | yes |
| `message`    | yes |
| `phone`      | no  |

The applicant is matched by email: an existing person is reused, otherwise a new one is created.

### Testing with curl

Run these from a POSIX shell (Git Bash, WSL, macOS, Linux). In PowerShell, call `curl.exe` and adapt the JSON quoting.

```sh
curl -i localhost:3000/ads
curl -i localhost:3000/ads/1
curl -i localhost:3000/ads/999                          # 404
curl -i localhost:3000/companies/1/ads
curl -i localhost:3000/companies/999/ads                # 404

curl -i -X POST localhost:3000/ads -H "Content-Type: application/json" \
  -d '{"company_id":2,"category_id":1,"title":"Frontend Intern","short_description":"Build UIs with JS."}'   # 201
curl -i -X POST localhost:3000/ads -H "Content-Type: application/json" \
  -d '{"title":"x"}'                                     # 400

curl -i -X POST localhost:3000/ads/2/applications -H "Content-Type: application/json" \
  -d '{"first_name":"Dan","last_name":"Lee","email":"dan@example.com","message":"Hello!"}'                 # 201, then 409 if repeated
curl -i -X POST localhost:3000/ads/999/applications -H "Content-Type: application/json" \
  -d '{"first_name":"a","last_name":"b","email":"a@b.c","message":"m"}'                                    # 404
```

## Front-end

`front/index.html` is a single page:

- on load, it calls `GET /ads` and shows each ad's title, company and short description;
- **View details** calls `GET /ads/:id` and fills the side panel with the full ad.

Everything is updated in the DOM with `fetch()`: the URL never changes and the page never reloads. Text is inserted with `textContent`, so ad content cannot inject HTML.

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `500` on every route, server log shows `ER_ACCESS_DENIED_ERROR` | Wrong `DB_USER` / `DB_PASSWORD` in `api/.env`. Fix it and restart the server. |
| `ER_BAD_DB_ERROR: Unknown database 'hireloop'` | Run `db/schema.sql` first. |
| `Duplicate entry` when running `seed.sql` | Seed already loaded. Run `schema.sql` again to reset, then `seed.sql`. |
| Front shows *Could not load ads... Is the API running?* | Start the API (`npm run dev`) and check `API_URL` in `front/app.js`. |
| `EADDRINUSE: address already in use :::3000` | Another server is already on port 3000. Stop it or change `PORT`. |
| `mysqlsh`: *Unable to open configuration file ... Illegal byte sequence* (Windows) | The user profile path has non-ASCII characters. Set `MYSQLSH_USER_CONFIG_HOME` to an ASCII folder, e.g. `$env:MYSQLSH_USER_CONFIG_HOME = "C:\mysqlsh-config"`. |
