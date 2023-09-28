const db = require("../db");
require("dotenv").config();
const bcrypt = require("bcrypt");

const createUsersAccount = async () => {
  const dropTableQuery = `DROP TABLE IF EXISTS users;`;

  const createUsersQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      firstName VARCHAR(60) NOT NULL,
      lastName VARCHAR(60) NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      gender VARCHAR(6),
      job_role VARCHAR(60),
      department VARCHAR(60),
      address VARCHAR(255),
      admin BOOLEAN NOT NULL,
      created_on TIMESTAMP NOT NULL,
      last_login TIMESTAMP
    );
  `;

  const insertUserDataQuery = `
    INSERT INTO users (
      firstName, lastName, email, password, gender, job_role, department, address, admin, created_on
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    );
  `;
  const hashedPassword = await bcrypt.hash("admin88888", 10);
  const userData = {
    firstName: "David",
    lastName: "Lawrence",
    email: "admin@gmail.com",
    password: hashedPassword,
    gender: "Male",
    job_role: "Manager",
    department: "IT",
    address: "13 Chinese street",
    admin: "TRUE",
  };
  const values = [
    userData.firstName,
    userData.lastName,
    userData.email,
    userData.password,
    userData.gender,
    userData.job_role,
    userData.department,
    userData.address,
    userData.admin,
    new Date(),
  ];

  try {
    // Drop the table if it exists
    await db.query(dropTableQuery);

    // Create the users table
    await db.query(createUsersQuery);
    console.log("Users table created");

    // Insert dummy user data
    await db.query(insertUserDataQuery, values);
    console.log("Dummy user data inserted");
  } catch (error) {
    console.error("Error:", error);
  }
};

// create user table for testing purposes
//createUsersAccount();

module.exports = { createUsersAccount };
