const db = require("../config/db/db");


//comment component that runs with articleID 
const getCommentByGifId = async(req, res)=>{
    //get all necessary parameters
    //const userId = req.user?.id;
    const gifId = req.params?.gif_id;

    try{

        //find if article exist
        const getGifQuery = "SELECT * FROM gif WHERE id = $1";
        const getResult = await db.query (getGifQuery, [gifId]);
        if (getResult.rowCount === 0){
            return res.status(403).json({
                status: "error",
                error: "gif not found..."
            }) 
        }
        
        // get the comments
        const getCommentQuery = "SELECT * FROM gif_comment WHERE gif_id = $1 ORDER BY created_on DESC";
        const getCommentResult = await db.query(getCommentQuery, [gifId]);
        const comment = getCommentResult.rows;
        
        if(getCommentResult.rowCount === 0){
            return res.status(403).json({
                status: "error",
                error: "No comments available for this article..."
            })
        }else {
            return res.status(201).json({
                status: "success",
                data: comment  
        })
        }

    }catch(error){
        return res.status(500).json({
            status: "error",
            error: "unexpected error getting gif comments..."
        })
    }

}

//employees can comment on other posts
const createGifComment = async (req, res)=>{
    const user = req.user;
    const admin  = req.user?.admin;
    const gifId = req.params?.gif_id;
    const {comment} = req.body;

    if(!user || admin === "FALSE"){
        return res.status(403).json({
            status: "error",
            error: "Not authorized..."
        }) 
    }

    try{
        const commentQuery = "INSERT INTO gif_comment (comment,gif_id,user_id) VALUES ($1, $2, $3) RETURNING *";
        const commentResult = await db.query(commentQuery, [comment, gifId, user.id]);
        const comments = commentResult.rows;
        
        if(commentResult.rowCount === 1){
             //get gif title and url
             const gifToComment = "SELECT url, title FROM gif WHERE id = $1";
             const gifToCommentResult = await db.query(gifToComment, [gifId])
             
             return res.status(201).json({
                 status: "success",
                 data: comments.map((commentData)=>({
                    message: "Comment successfully created",
                    createdOn: commentData.created_on,
                    gifTitle: gifToCommentResult.rows[0].title,
                    url: gifToCommentResult.rows[0].url,
                    comment: commentData.comment,
                 }))
             })
             
        }else {
            return res.status(403).json({
                status: "error",
                error: "Comment not posted..."
            }) 
           
        }

    }catch(error){
        return res.status(500).json({
            status: "error",
            error: "unexpected error trying to comment..."
        })
    }
}


module.exports = {
    getCommentByGifId,
    createGifComment,
}