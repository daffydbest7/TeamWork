const db = require("../db");
require("dotenv").config();


const createArticleCommentTable = async () => {
  const dropTableQuery = `DROP TABLE IF EXISTS article_comment;`;

  const createArticleCommentTableQuery = `
    CREATE TABLE IF NOT EXISTS article_comment (
      id SERIAL PRIMARY KEY,
      comment TEXT,
      article_id INT REFERENCES article(id) ON DELETE CASCADE, 
      user_id INT,
      created_on TIMESTAMP DEFAULT NOW(),
      updated_on TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertArticleCommentDataQuery = `
    INSERT INTO article_comment (
      comment, article_id, user_id
    ) VALUES (
      $1, $2, $3
    );
  `;
  
  const articleCommentData = {
    comment: "It is no longer stories that numbers don't lie, and CR7 is the current leading goal scorer of all time",
    article_id: 1,
    user_id: 1,
    
  };

  const values = [
    articleCommentData.comment,
    articleCommentData.article_id,
    articleCommentData.user_id,
  ];

  try {
    // Drop the table if it exists
    //await db.query(dropTableQuery);

    // Create the users table
    await db.query(createArticleCommentTableQuery);
    console.log("Article_Comment table created");

    // Insert dummy user data
    await db.query(insertArticleCommentDataQuery, values);
    console.log("Dummy article_comment data inserted");
  } catch (error) {
    console.error("Error:", error);
  }
};

// create Gif table for testing purposes
//createArticleCommentTable();

module.exports = { createArticleCommentTable };
