const vieww = async (database, a,b)=>{
    const viewSpecificArticle =`
        SELECT * FROM article WHERE id = $1
    `;
    
    const getCommentQuery = `
        SELECT * FROM article_comment WHERE article_id = $2
    `;
    value = [a,b];
   await database.query(viewSpecificArticle, value)
}

module.exports = vieww;
