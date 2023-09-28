const db = require("../db");
require("dotenv").config();


const createGifTable = async () => {
  const dropTableQuery = `DROP TABLE IF EXISTS gif;`;

  const createGifTableQuery = `
    CREATE TABLE IF NOT EXISTS gif (
      id SERIAL PRIMARY KEY,
      url TEXT,
      user_id INT,
      title TEXT,
      created_on TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertGifDataQuery = `
    INSERT INTO gif (
      url, title, user_id, created_on
    ) VALUES (
      $1, $2, $3, $4
    );
  `;
  
  const gifData = {
    url: "https://media.giphy.com/media/X7s4uckfyihGJDrSpo/giphy.gif",
    title: "testing postgres",
    user_id: 1,
    created_on: new Date(),
   
  };
  const values = [
    gifData.url,
    gifData.title,
    gifData.user_id,
    gifData.created_on,
    
  ];

  try {
    // Drop the table if it exists
    await db.query(dropTableQuery);

    // Create the users table
    await db.query(createGifTableQuery);
    console.log("Gifs table created");

    // Insert dummy user data
    await db.query(insertGifDataQuery, values);
    console.log("Dummy Gif data inserted");
  } catch (error) {
    console.error("Error:", error);
  }
};

// create Gif table for testing purposes
//createGifTable();

module.exports = { createGifTable };
