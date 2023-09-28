import { verify } from "jsonwebtoken";
const db = require("../config/db/db");
require("dotenv").config();

export const authGuard = async (req, res, next) =>{
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ){
        try{
          const token = req.headers.authorization.split(" ")[1];
          const id =  verify(token, process.env.JWT_SECRET);
          const result = await db.query("SELECT * FROM users WHERE id = $1", [
            id.userId,
          ]); 
          // if user is not found
          if (!result.rows.length) {
            return res.status(404).json({
              status: "error",
              error: "User not found",
            });
          }
          // assign the user to the selected row
          req.user = result.rows[0];
          next();

          // if token exist but is incorrect or expired
        }catch(error){
            let err = new Error ("Not authorized, Token failed")
            err.statusCode = 401;
            next(err);
        }

        // if there's no token at all
    }else {
        let error = new Error ("Not authorized, No token")
        error.statusCode = 401;
        next(error);
    }
};


// admin authmiddleware
export const adminGuard = (req, res, next) => {
    if (req.user && req.user.admin) {
      next();
    } else {
      let error = new Error("Not authorized as an admin");
      error.statusCode = 401;
      next(error);
    }
  };
