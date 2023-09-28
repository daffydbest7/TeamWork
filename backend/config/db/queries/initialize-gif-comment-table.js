const db = require("../db");
require("dotenv").config(); 


const createGifCommentTable = async () => {
  const dropTableQuery = `DROP TABLE IF EXISTS gif_comment;`;

  const createGifCommentTableQuery = `
    CREATE TABLE IF NOT EXISTS gif_comment (
      id SERIAL PRIMARY KEY,
      comment TEXT,
      gif_id INT REFERENCES gif(id) ON DELETE CASCADE, 
      user_id INT,
      created_on TIMESTAMP DEFAULT NOW(),
      updated_on TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertGifCommentDataQuery = `
  INSERT INTO gif_comment (
    comment, gif_id, user_id
  ) VALUES (
    $1, $2, $3
  );
  `;
  
  const gifCommentData = {
    comment: "It is no longer stories that numbers don't lie, and CR7 is the current leading goal scorer of all time",
    gif_id: 1,
    user_id: 1,
    
  };
  const values = [
    gifCommentData.comment,
    gifCommentData.gif_id,
    gifCommentData.user_id,
  
    
  ];

  try {
    // Drop the table if it exists
    //await db.query(dropTableQuery);

    // Create the users table
    await db.query(createGifCommentTableQuery);
    console.log("gif_Comment table created");

    // Insert dummy user data
    await db.query(insertGifCommentDataQuery, values);
    console.log("Dummy gif_comment data inserted");
  } catch (error) {
    console.error("Error:", error);
  }
};

// create Gif table for testing purposes
//createGifCommentTable();

module.exports = { createGifCommentTable };
