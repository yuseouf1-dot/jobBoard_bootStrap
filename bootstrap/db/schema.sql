-- HireLoop bootstrap schema
-- Re-runnable: drops and recreates the whole database.

DROP DATABASE IF EXISTS hireloop;
CREATE DATABASE hireloop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hireloop;

-- Companies post job ads.
CREATE TABLE companies (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    website     VARCHAR(255),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Each ad belongs to exactly one category.
CREATE TABLE categories (
    id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE ads (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id        INT UNSIGNED NOT NULL,
    category_id       INT UNSIGNED NOT NULL,
    title             VARCHAR(150) NOT NULL,
    short_description VARCHAR(255) NOT NULL,
    description       TEXT,
    location          VARCHAR(100),
    salary            VARCHAR(50),
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id)  REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE people (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50)  NOT NULL,
    last_name  VARCHAR(50)  NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    phone      VARCHAR(30)
);

-- Join table for the many-to-many people <-> ads relation.
-- Keeps a trace of the message sent and the date.
CREATE TABLE applications (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ad_id      INT UNSIGNED NOT NULL,
    person_id  INT UNSIGNED NOT NULL,
    message    TEXT NOT NULL,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id)     REFERENCES ads(id)    ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
    UNIQUE KEY one_application_per_ad (ad_id, person_id)
);
