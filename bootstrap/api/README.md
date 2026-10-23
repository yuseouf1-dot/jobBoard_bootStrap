# HireLoop API

Express 5 + mysql2 REST API on top of the `hireloop` MySQL database (`../db`).

## Setup

```sh
# 1. Create and fill the database (drops and recreates `hireloop`)
mysql -u root -p < ../db/schema.sql
mysql -u root -p < ../db/seed.sql

# 2. Configure and run the API
cp .env.example .env    # then set DB_PASSWORD
npm install
npm run dev             # http://localhost:3000
```

## Routes

| Method | Route                     | Success | Errors |
|--------|---------------------------|---------|--------|
| GET    | `/ads`                    | 200     |        |
| GET    | `/ads/:id`                | 200     | 404 unknown ad |
| POST   | `/ads`                    | 201     | 400 missing field / unknown company or category |
| POST   | `/ads/:id/applications`   | 201     | 400 missing field, 404 unknown ad, 409 already applied |
| GET    | `/companies/:id/ads`      | 200     | 404 unknown company |

`POST /ads` body: `company_id`, `category_id`, `title`, `short_description` (required), `description`, `location`, `salary`.

`POST /ads/:id/applications` body: `first_name`, `last_name`, `email`, `message` (required), `phone`.
The applicant is matched by email: an existing person is reused, otherwise a new one is created.

## Testing with curl

```sh
curl -i localhost:3000/ads
curl -i localhost:3000/ads/1
curl -i localhost:3000/ads/999                      # 404
curl -i localhost:3000/companies/1/ads

curl -i -X POST localhost:3000/ads -H "Content-Type: application/json" \
  -d '{"company_id":2,"category_id":1,"title":"Frontend Intern","short_description":"Build UIs with JS."}'   # 201
curl -i -X POST localhost:3000/ads -H "Content-Type: application/json" -d '{"title":"x"}'                    # 400

curl -i -X POST localhost:3000/ads/2/applications -H "Content-Type: application/json" \
  -d '{"first_name":"Dan","last_name":"Lee","email":"dan@example.com","message":"Hello!"}'               # 201
```
