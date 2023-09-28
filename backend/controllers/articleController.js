const db = require("../config/db/db");
//const vieww = "../models/viewSpecificArticle.js";


const createArticle = async (req, res)=>{
    // get necessary information to perform the create
    //action from the user's request
    const user = req.user;
    const admin = req.user.admin;
    const {title , content} = req.body;

    //check if user is valid
    if(!user || admin === "FALSE"){
        return res.status(403).json({
            status: "error",
            error: "Access denied, you're not a user"
        })
    }
    // try to perform action
    try{
    const insertArticleDataQuery = `INSERT INTO article (
      title, content, user_id
    ) VALUES (
      $1, $2, $3
    ) RETURNING * ;
  `;
     const insertArticleValue = [title, content, user.id];
     const insertArticle = await db.query(insertArticleDataQuery, insertArticleValue);
     const insertArticleCheck = insertArticle.rows[0];

     return res.status(200).json({
        status:"success",
        data:{
            message: "Article created successfully...",
            id: insertArticleCheck.id,
            title: insertArticleCheck.title,
            content: insertArticleCheck.content,
            userId: insertArticleCheck.user_id,

        }
       
     })

    }catch(error){
        return res.status(500).json({
            status: "error",
            error: "An unexpected error occured while creating an article..."
        })
    }
}

// deleting Article only admin OR the user who created an article post can delete it    
const deleteArticle = async(req, res)=>{
    const user = req.user;
    const articleId = req.params.id;
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
            const deleteQueryAsAdmin = 'DELETE FROM article WHERE id = $1';
            const deleteValueAsAdmin = [articleId];
            const deleteActionByAdmin = await db.query(deleteQueryAsAdmin, deleteValueAsAdmin);
            if (deleteActionByAdmin.rowCount === 0) {
            return res.status(404).json({
              status: "error",
              error: "Cannot delete an empty article ...",
            });
          }
          return res.status(201).json({
            status: "success",
            data:
            {
                message: "deleted article successfully with admin priviledge...",
            }   
        })
        }

        // deleting as a valid user or probably an admin
        if(user || admin){
            const deleteQuery = 'DELETE FROM article WHERE id = $1 AND user_id = $2 ';
            const deleteValue = [articleId, user.id];
            const deleteActionByUser = await db.query(deleteQuery, deleteValue);
          if (deleteActionByUser.rowCount === 0) {
            return res.status(404).json({
              status: "error",
              error: "Cannot delete another users article or not authorized to delete",
            });
          }
          return res.status(201).json({
            status: "success",
            data:
            {
                message: "deleted your article successfully...",
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

 //update article post only the user can update his own post
const updateArticle = async (req, res)=>{
    const user = req.user;
    const title = req.params.title;
    const { newTitle, content } = req.body;
 
    //if user is NOT valid
    if(!user){
     return res.status(403).json({
         status: "error",
         error: "not allowed to access "
     })
    }
     
     try{
        // check for the specific post which belongs to the loggedIn user
        const updateArticleQuery = 'UPDATE article SET title = $1, content = $2 WHERE title = $3 AND user_id = $4 RETURNING *;' ;
        const updateValue = [newTitle , content, title , user.id ]; 
        const updateResult = await db.query(updateArticleQuery, updateValue);
        const checkResult = updateResult.rowCount;   
        //return the response
        if(!checkResult){
            return res.status(403).json({
                status:"error",
                error: "invalid article title.. cannot update"
            })
        }else {
            return res.status(201).json({
                status:"success",
                data: updateResult.rows[0]
            }) 
        }
           
        }
           catch(error){
            return res.status(500).json({
                status:"error",
                error: "An error occured while performing update..."
            })
           }
    }  

//get All articles  
const getAllArticle = async (req, res) => {
//get parameters needed from the user's request
    const user = req.user;
    const admin = req.user?.admin;

    {/**

    //check if the user is valid
    if(!user || admin ==="FALSE"){
        return res.status(403).json({
            status: "error",
            error: "Not Authorized ..."
        })
    }

    */}

    try{
    //try to perform the get query
    const getAllArticleQuery = await db.query('SELECT * FROM article ORDER BY created_on DESC');
    const getResult = getAllArticleQuery.rowCount;
    //const result = getAllArticleQuery.rows

    //send response
    if(getResult === 0){
        return res.status(403).json({
            status: "error",
            error: "An unexpected error occured while fetching",
        })
    }else{
        return res.status(200).json({
            status: "success",
            data: getAllArticleQuery.rows.map((article) =>(
                {
                    articleId: article.id,
                    title: article.title,
                    article: article.content,
                    userId: article.user_id,
                    createdOn: article.created_on,  
                }
            )),
        }) 
    }
    
    }catch(error){
        return res.status(500).json({
            status: "error",
            error: "Opps! an error occured while performing operation..."
        })
    }
    
}

//get Single Article
const getSingleArticle = async (req, res) =>{
    //get the parameters from the user's request
    const user = req.user;
    const admin = req.user?.admin;
    const articleId = req.params.id;

    //check if user is authorized
    if(!user || admin === "FALSE"){
        return res.status(403).json({
            status: "error",
        })
    }

    //perform the getSingle action
    try{
    const getSingleArticleQuery = 'SELECT * FROM article WHERE id = $1';
    const value = [articleId]; 
    const getSingleResult = await db.query(getSingleArticleQuery, value);
    
    if(!getSingleResult.rowCount){
        return res.status(403).json({
            status:"error",
            error: "resource does not exist..."
        })                                  
    } else {
        return res.status(201).json({
            status:"success",
            data: getSingleResult.rows[0]
        }) 
    }

    }catch(error){
        return res.status(500).json({
            status:"error",
            error: "An unexpected error occured while performin the operation..."
        })
    }

}

//get all articles with user id
const  getAllArticlesByUserId = async(req,res)=>{
    const user = req.user;
    const admin = req.user?.admin;

    if(!user || admin === "FALSE"){
        return res.status(403).json({
            status: "error",
            error: "Not authorized"
        })
    }

// perform the get functionality
    try{
        const getarticleQuery = "SELECT * FROM article WHERE user_id = $1 ORDER BY created_on DESC"
        const getArticleResult = await db.query(getarticleQuery, [user.id]);

        //if not successful
        if(!getArticleResult.rowCount){
            return res.status(403).json({
                status: "error",
                error: "Opps! seems you don't have any post yet..."
            })  
        }else{
            return res.status(200).json({
                status: "success",
                data: getArticleResult.rows.map((article) =>(
                    {
                        articleId: article.id,
                        title: article.title,
                        article: article.article,
                        userId: article.user_id,
                        createdOn: article.created_on,  
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

//Employees can view a specific article
const getArticleById = async (req, res) =>{
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
        const viewSpecificArticle ="SELECT * FROM article WHERE id = $1";
        const getCommentQuery = "SELECT * FROM article_comment WHERE article_id = $1";
        
    // get the values and pair it with the comment ONE to ONE
     const articleResult = await db.query(viewSpecificArticle, [id]);
     
     //if article doesn't exist
    if(articleResult.rowCount === 0){
        return res.status(403).json({
            status: "error",
            error: "No such article..."
        })   
    }
    //if article exist
    const articleCommentResult = await db.query(getCommentQuery, [id]);
    
    //if comment is associated with the article
       if(articleCommentResult.rowCount > 0){
        return res.status(201).json({
            status: "success",
            data: articleResult.rows.map((article) =>(
                {
                    Id: article.id,
                    title: article.title,
                    createdOn: article.created_on,
                    article: article.content,
                    userId: article.user_id,
                    comments: articleCommentResult.rows.map((comment)=>({
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
            data: articleResult.rows.map((article) =>(
                {
                    Id: article.id,
                    title: article.title,
                    createdOn: article.created_on,
                    article: article.content,
                    userId: article.user_id,
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
    createArticle,
    deleteArticle,
    updateArticle,
    getAllArticle,
    getSingleArticle,
    getAllArticlesByUserId,
    getArticleById,
};