const db = require("../db");
require("dotenv").config();


const createArticleTable = async () => {
  const dropTableQuery = `DROP TABLE IF EXISTS article;`;

  const createArticleTableQuery = `
    CREATE TABLE IF NOT EXISTS article (
      id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      content TEXT,
      user_id INT,
      created_on TIMESTAMP DEFAULT NOW(),
      updated_on TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertArticleDataQuery = `
    INSERT INTO article (
      title, content, user_id
    ) VALUES (
      $1, $2, $3
    );
  `;
  
  const articleData = {
    title: "CR7 the greatest of all time",
    content: "It is no longer stories that numbers don't lie, and CR7 is the current leading goal scorer of all time",
    user_id: 1,
    
  };
  const values = [
    articleData.title,
    articleData.title,
    articleData.user_id,
  
    
  ];

  try {
    // Drop the table if it exists
    await db.query(dropTableQuery);

    // Create the users table
    await db.query(createArticleTableQuery);
    console.log("Article table created");

    // Insert dummy user data
    await db.query(insertArticleDataQuery, values);
    console.log("Dummy Article data inserted");
  } catch (error) {
    console.error("Error:", error);
  }
};

// create Gif table for testing purposes
//createArticleTable();

module.exports = { createArticleTable };
