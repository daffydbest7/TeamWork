const bcrypt = require("bcrypt");
const db = require("../config/db/db");
require("dotenv").config();
const { createUsersAccount } = require("../config/db/queries/initialize-user-table");
const { sign } = require("jsonwebtoken");


//creating new user as an admin ONLY
const createUser = async (req, res) =>{
    const admin = req.user?.admin;
    const userData = req.body;


// check if the authenticated user is an admin
if(!admin){
    return res.status(403).json({
        status: "error",
        error: "Only admin can create a user account"
    })
}

// check if email already exists
const emailCheckQuery = "SELECT COUNT(*) FROM users WHERE email = $1";
const emailCheckValue = [userData.email];
const emailCheckResult = await db.query(emailCheckQuery, emailCheckValue);
const emailExists = emailCheckResult.rows[0].count > 0;

//check if it already exists
if(emailExists){
    return res.status(403).json({
        status: "error",
        error: "Email already exists",
    })
}

// hash the password
const hashedPassword = await bcrypt.hash(userData.password, 10);

//insert the new user data 
const insertUserDataQuery = `
      INSERT INTO users (
        firstName, lastName, email, password, gender, job_role, department, address, admin, created_on
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING *;             
    `;
  const values = [
    userData.firstName,
    userData.lastName,
    userData.email,
    hashedPassword,
    userData.gender,
    userData.job_role,
    userData.department,
    userData.address,
    userData.admin,
    new Date(),
  ];

  try {
    const result = await db.query(insertUserDataQuery, values);
    const createdUser = result.rows[0];

    //Send user details in the response
    res.status(201).json({
        status: "success",
        data: {
            message: "User account successfully created",
            userId: createdUser.id,
            email: createdUser.email,
            admin: createdUser.admin,
            firstName: createdUser.firstName,
            lastName: createdUser.lastName,
            password: createdUser.password,
            gender: createdUser.gender,
            job_role: createdUser.job_role,
            department: createdUser.department,
            address: createdUser.address,
            created_on: createdUser.created_on,
        }
    })

  }catch(error){
    console.error(error);
    res.status(500).json({
        status: "error",
        error: "An error occured while creating a new user",
    })
  }
}

// get all users
const getAllUsers = async (req, res) => {
    const admin = req.user?.admin;
  
    // Check if the authenticated user is an admin
    if ( !admin ) {
      return res.status(403).json({
        status: "error",
        error: "Only admin users can access this resource",
      });
    }
    try {
      const result = await db.query("SELECT * FROM users");
      return res.status(201).json({
        status: "success",
        data: result.rows,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        error: "An error occurred while fetching users",
      });
    }
  };

 //login
 const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
    // check if email already exists
    const emailCheckQuery = "SELECT * FROM users WHERE email = $1";
    const emailCheckValue = [email];
    const emailCheckResult = await db.query(emailCheckQuery, emailCheckValue);
    //const emailExists = emailCheckResult.rows[0].count > 0;
    const user = emailCheckResult.rows[0];
    //if email was not found
    if(!user){
    return res.status(403).json({
        status: "error",
        error: "Email not found ",
    })
    }
    
     //compare password and matching with email
     const isPasswordValid = await bcrypt.compare(password, user.password);
    
      if (isPasswordValid) {

        //user data in the payload for token
        const payload = {
            userId: user.id,
            firstName: user.firstname,
            email: user.email,
            admin: user.admin
        };
        //sign the payload
        const token = sign(payload, process.env.JWT_SECRET, {
            expiresIn: "30d",
        })
        //send the token and user details in the response
        return res.status(201).json({
            status: "success",
            data:{

                userId: user.id,
                firstname: user.firstname,
                email: user.email,
                admin: user.admin,
                token: token,
            }
        });
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      next(error);
    }
  }; 

module.exports = {createUser, getAllUsers, loginUser};  