const db = require("../config/db/db");

const joinArticleToGif = `
(SELECT id, user_id,title,NULL AS url, content AS article, created_on FROM article
	UNION ALL
		SELECT id,user_id, title,url AS url_,NULL AS article, created_on FROM gif
	ORDER BY created_on DESC)

`;

const viewArticleOrGif = async(req, res)=>{
    const user = req.user;
    const admin = req.user?.admin;
    if(!user || admin === "FALSE"){
        return res.status(403).json({
            status: "error",
            error: "Not Authorized..."
        }) 
    }

    try{
        const getFeed = await db.query(joinArticleToGif)
        const getResult = getFeed.rows;

        return res.status(201).json({
            status:"success",
            data: getResult.map((feed)=>({
              message: "successfully viewing all feeds",
              id: feed.id,
              createdOn: feed.created_on,
              title: feed.title,
              
              "article / url": feed.article || feed.url,
              authorId: feed.user_id,
             // fish: authorId
            }))
        })

    }catch(error){
        return res.status(500).json({
            status: "error",
            error: "unexpected error trying to get feed..."
        })
    }

}

module.exports = {
    viewArticleOrGif,
}