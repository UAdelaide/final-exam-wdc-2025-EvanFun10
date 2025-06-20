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