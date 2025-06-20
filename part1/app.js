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