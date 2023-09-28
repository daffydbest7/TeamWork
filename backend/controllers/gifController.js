const db = require("../config/db/db");
const cloudinary = require("../utils/cloudinaryConfig");
const multer = require('multer');
//const upload = multer({dest: 'uploads/'});

//post new gif
const postGif = async (req, res)=>{
    //get the base64Encodedurl & title from the users req body
    const {title} = req.body;
    const base64EncodedGif = req.file;
    const user = req.user;
    
    

    //check if its NOT user or admin
    if (!user) {
        return res.status(403).json({
            status: "error",
            error: "Only logged In users or admin can create gif post"
        })
    }
    


    //check if post title already exist
    const titleCheckQuery = "SELECT COUNT(*) FROM gif WHERE title = $1";
    const titleCheckValue = [title];
    const titleCheckResult = await db.query(titleCheckQuery, titleCheckValue);
    const titleExists = titleCheckResult.rows[0].count > 0;

    //check if it already exists
    if(titleExists){
    return res.status(403).json({
        status: "error",
        error: "Opps! gif post title already exists...",
    })
    }  

    //do the action of creating the gif post
    try {
    
        //use cloudinary api to uploadimage and get url
    const uploadedImage = await cloudinary.v2.uploader.upload(base64EncodedGif, {
        public_id: `${Date.now()}`,
        resource_type: "auto",
      });
    // get secured url of the uploaded image
    const url = uploadedImage.secure_url;
    
    //insert the new user data 
    const insertGifDataQuery = `
    INSERT INTO gif (
      url, title, user_id
        ) VALUES (
      $1, $2, $3
    ) RETURNING *;
    `;
    //const url = "https://media.giphy.com/media/X7s4uckfyihGJDrSpo/giphy.gif";

    const values = [
    url,
    title,
    user.id,
    ]
        const result = await db.query(insertGifDataQuery, values);
        const createdGif = result.rows[0];
    
        //Send user details in the response
        return res.status(201).json({
            status: "success",
            data: {
                message: "Gif post successfully created",
                gifId: createdGif.id,
                userId: createdGif.user_id,
                url: createdGif.url,
                title: createdGif.title,
                created_on: createdGif.created_on,
            }
        })
    
        }catch(error){
        console.error(error);
        return res.status(500).json({
            status: "error",
            error: "An error occured while creating a new Gif Post",
        })
      }
    
};

//get All gif posts
const getAllGif = async (req, res)=>{
   const user = req.user;

   //if user is NOT valid
   if(!user){
    return res.status(403).json({
        status: "error",
        error: "not allowed to access "
    })
   }
   try{
    const getAllGifQuery = await db.query('SELECT * FROM gif');
    const result = getAllGifQuery.rows;
    //return the response
   return  res.status(201).json({
        status:"success",
        data:result
    })
   }catch(error){
    return res.status(500).json({
        status:"error",
        error: "An error occured while fetching..."
    })
   }
}

//get single gif by title or slug
const getSingleGif = async (req, res)=>{
    const user = req.user;
    const title = req.params.title;
 
    //if user is NOT valid
    if(!user){
     return res.status(403).json({
         status: "error",
         error: "not allowed to access "
     })
    }
    // check for the title
    const getSingleGifQuery = 'SELECT * FROM gif WHERE title = $1' ;
    const value = [title]; 
    const result = await db.query(getSingleGifQuery, value);
    
        try{
            //return the response
            return res.status(201).json({
                status:"success",
                data: result.rows[0],
            })
           }
           catch(error){
            return res.status(500).json({
                status:"error",
                error: "An error occured while fetching..."
            })
           }
    }

    
//get gifpost by userid
const getUserGif = async (req, res)=>{
    const user = req.user;
 
    //if user is NOT valid
    if(!user){
     return res.status(403).json({
         status: "error",
         error: "not allowed to access "
     })
    }
    // check for the title
    const getUserGifQuery = 'SELECT * FROM gif WHERE user_id = $1' ;
    const getUservalue = [user.id]; 
    const getUserresult = await db.query(getUserGifQuery, getUservalue);
    
        try{
            //return the response
            return res.status(201).json({
                status:"success",
                data: getUserresult.rows,
            })
           }
           catch(error){
            return res.status(500).json({
                status:"error",
                error: "An error occured while fetching..."
            })
           }
    }    

//update gif post only the user can update his own post
const updateGif = async (req, res)=>{
    const user = req.user;
    const {title,newtitle, url} = req.body;
 
    //if user is NOT valid
    if(!user){
     return res.status(403).json({
         status: "error",
         error: "not allowed to access "
     })
    }
    // check for the specific post which belongs to the loggedIn user
    const updateGifQuery = 'UPDATE gif SET url = $1, title = $2 WHERE user_id = $3 AND title = $4';
    const updatevalue = [url, newtitle, user.id,title ]; 
    const updateresult = await db.query(updateGifQuery, updatevalue);
    
        try{
            //return the response
            return res.status(201).json({
                status:"success",
                data: updateresult.rows[0],
            })
           }
           catch(error){
            return res.status(500).json({
                status:"error",
                error: "An error occured while fetching..."
            })
           }
    }    
  
// delete gif only admin and the user who created a gif post can delete it    
 const deleteGif = async(req, res)=>{
    const user = req.user;
    const gifId = req.params.id;
    const admin = req.user?.admin;

    //check if user exist
    if(!user || admin === "FALSE"){ 
       return res.status(403).json({
          status:"error",
          error: "cannot delete! not authorized",
        })
    }

    // query for deleting
    try{

        //deleting as an admin ONLY
        if(admin){
            const deleteQueryAsAdmin = 'DELETE FROM gif WHERE id = $1';
            const deleteValueAsAdmin = [gifId];
            const deleteActionByAdmin = await db.query(deleteQueryAsAdmin, deleteValueAsAdmin);
            if (deleteActionByAdmin.rowCount === 0) {
            return res.status(404).json({
              status: "error",
              error: "Cannot delete an empty gif ...",
            });
          }
          return res.status(201).json({
            status: "success",
            data:
            {
                message: "deleted successfully with admin priviledge...",
            }   
        })
        }

        // deleting as a valid user or probably an admin
        if(user || admin){
            const deleteQuery = 'DELETE FROM gif WHERE id = $1 AND user_id = $2 ';
            const deleteValue = [gifId, user.id];
            const deleteActionByUser = await db.query(deleteQuery, deleteValue);
          if (deleteActionByUser.rowCount === 0) {
            return res.status(404).json({
              status: "error",
              error: "Cannot delete another users gif or not authorized to delete",
            });
          }
          return res.status(201).json({
            status: "success",
            data:
            {
                message: "deleted your gif successfully...",
            }   
        })
        }
        
                    
    }catch(error){
        return res.status(500).json({
            status:"error",
            error: "An error occured while performing delete..."
        })
    }
 }   

//Employees can view a specific gif
const getGifById = async (req, res) =>{
    const user = req.user;
    const id = req.params?.id;
    //const articleId = id;
    if (!user){
        return res.status(403).json({
            status: "error",
            error: "Not Permitted.."
        })
    }

    try{
        const viewSpecificGif ="SELECT * FROM gif WHERE id = $1";
        const getCommentQuery = "SELECT * FROM gif_comment WHERE gif_id = $1";
        
    // get the values and pair it with the comment ONE to ONE
     const gifResult = await db.query(viewSpecificGif, [id]);
     
     //if gif doesn't exist
    if(gifResult.rowCount === 0){
        return res.status(403).json({
            status: "error",
            error: "No such gif..."
        })   
    }
    //if article exist
    const gifCommentResult = await db.query(getCommentQuery, [id]);
    
    //if comment is associated with the article
       if(gifCommentResult.rowCount > 0){
        return res.status(201).json({
            status: "success",
            data: gifResult.rows.map((gif) =>(
                {
                    Id: gif.id,
                    title: gif.title,
                    createdOn: gif.created_on,
                    url: gif.url,
                    userId: gif.user_id,
                    comments: gifCommentResult.rows.map((comment)=>({
                        commentId: comment.id,
                        authorId: comment.user_id,
                        comment: comment.comment
                    })),
                   
                      
                }
            )),
        })  
       }else{
        return res.status(201).json({
            status: "success",
            data: gifResult.rows.map((gif) =>(
                {
                    Id: gif.id,
                    title: gif.title,
                    createdOn: gif.created_on,
                    url: gif.url,
                    userId: gif.user_id,
                    comments: "No comments yet..."
                      
                }
            )),
        })  
       }
       
    }catch(error){
        return res.status(500).json({
            status: "error",
            error: "An error occured while performing action..."
        })
    }

} 


module.exports = {
     postGif,
     getAllGif,
     getSingleGif, 
     getUserGif,
     updateGif,
     deleteGif,
     getGifById,
    };