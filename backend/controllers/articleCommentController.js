const db = require("../config/db/db");


//comment component that runs with articleID 
const getArticleCommentByArticleId = async(req, res)=>{
    //get all necessary parameters
    //const userId = req.user?.id;
    const articleId = req.params?.article_id;

    try{

        //find if article exist
        const getArticleQuery = "SELECT * FROM article WHERE id = $1";
        const getResult = await db.query (getArticleQuery, [articleId]);
        if (getResult.rowCount === 0){
            return res.status(403).json({
                status: "error",
                error: "Article not found..."
            }) 
        }
        
        // get the comments
        const getCommentQuery = "SELECT * FROM article_comment WHERE article_id = $1 ORDER BY created_on DESC";
        const getCommentResult = await db.query(getCommentQuery, [articleId]);
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
            error: "unexpected error getting article comments..."
        })
    }

}

//employees can comment on other posts
const createComment = async (req, res)=>{
    const user = req.user;
    const admin  = req.user?.admin;
    const articleId = req.params?.article_id;
    const {comment} = req.body;

    if(!user || admin === "FALSE"){
        return res.status(403).json({
            status: "error",
            error: "Not authorized..."
        }) 
    }

    try{
        const commentQuery = "INSERT INTO article_comment (comment,article_id,user_id) VALUES ($1, $2, $3) RETURNING *";
        const commentResult = await db.query(commentQuery, [comment, articleId, user.id]);
        const comments = commentResult.rows;
        
        if(commentResult.rowCount === 1){
             //get article title and article content
             const ArticleToComment = "SELECT content, title FROM article WHERE id = $1";
             const ArticleToCommentResult = await db.query(ArticleToComment, [articleId])
             
             return res.status(201).json({
                 status: "success",
                 data: comments.map((commentData)=>({
                    message: "Comment successfully created",
                    createdOn: commentData.created_on,
                    articleTitle: ArticleToCommentResult.rows[0].title,
                    article: ArticleToCommentResult.rows[0].content,
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
    getArticleCommentByArticleId,
    createComment,
}