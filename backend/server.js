import express from 'express';
const bodyParser = require("body-parser");
import cors from "cors";
//const db = require("./config/db/db");
const userRoutes = require("./routes/userRoutes");
const gifRoutes = require("./routes/gifRoutes")
const articleRoutes = require("./routes/articleRoutes")
const articleCommentRoutes = require("./routes/articleCommentRoutes");
const gifCommentRoutes = require("./routes/gifCommentRoutes")
const { createUsersAccount } = require("./config/db/queries/initialize-user-table");
const {createGifTable} = require("./config/db/queries/initialize-gif-table");
const {createArticleTable} = require("./config/db/queries/initialize-article-table");
const {createArticleCommentTable} = require("./config/db/queries/initialize-article-comment-table ");
const {createGifCommentTable} = require("./config/db/queries/initialize-gif-comment-table");
const fileupload = require('express-fileupload'); 


//create a port to listen to
const app = express();
app.use(express.json());
app.use(cors());
app.use(fileupload({useTempFiles: true}))

//instantiate bodyparser
app.use(bodyParser.json());

//define a route for the root URL
app.get("/", (req, res) => {
  res.send("Server is running now...");
});

//routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", gifRoutes);
app.use("/api/v1", articleRoutes);
app.use("/api/v1/", articleCommentRoutes);
app.use("/api/v1/", gifCommentRoutes);


//tell if the server is running
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running now on port ${PORT}`));