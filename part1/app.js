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
        