const express = require('express');
const pool = require('./db');
const app = express();
const port = 8080;

const setupDatabase = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`DROP DATABASE IF EXISTS DogWalkService`);
    await conn.query(`CREATE DATABASE DogWalkService`);
    await conn.query(`USE DogWalkService`);

    await conn.query(`
      CREATE TABLE Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('owner', 'walker') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE Dogs (
        dog_id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        size ENUM('small', 'medium', 'large') NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES Users(user_id)
      )
    `);

    await conn.query(`
      CREATE TABLE WalkRequests (
        request_id INT AUTO_INCREMENT PRIMARY KEY,
        dog_id INT NOT NULL,
        requested_time DATETIME NOT NULL,
        duration_minutes INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
      )
    `);

    await conn.query(`
      CREATE TABLE WalkApplications (
        application_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        walker_id INT NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
        FOREIGN KEY (walker_id) REFERENCES Users(user_id),
        CONSTRAINT unique_application UNIQUE (request_id, walker_id)
      )
    `);

    await conn.query(`
      CREATE TABLE WalkRatings (
        rating_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        walker_id INT NOT NULL,
        owner_id INT NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        comments TEXT,
        rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
        FOREIGN KEY (walker_id) REFERENCES Users(user_id),
        FOREIGN KEY (owner_id) REFERENCES Users(user_id),
        CONSTRAINT unique_rating_per_walk UNIQUE (request_id)
      )
    `);

    // Insert users (including melon123 and coco456)
    await conn.query(`
      INSERT INTO Users (username, email, password_hash, role) VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
        ('carol123', 'carol@example.com', 'hashed789', 'owner'),
        ('daveowner', 'dave@example.com', 'daveowns', 'owner'),
        ('elliewalks', 'ellie@example.com', 'elliepass456', 'walker'),
        ('Melon123', 'melon@example.com', 'melonpass', 'owner'),
        ('coco456', 'coco@example.com', 'cocopass', 'owner')
    `);

     // Insert dogs
     await conn.query(`
      INSERT INTO Dogs (name, size, owner_id) VALUES
        ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
        ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
        ('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
        
