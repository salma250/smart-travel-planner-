const Post = require('../models/postModel')
const User = require('../models/userModel')

async function createPost(req,res,next){
  try{
    const user_id = req.user.id
    const {image,comment,location} = req.body
    const post = await Post.createPost({user_id,image,comment,location})
    // bonus: give user points for posting
    await User.addPoints(user_id, 10)
    res.status(201).json({post})
  }catch(err){next(err)}
}

async function getPosts(req,res,next){
  try{
    const posts = await Post.getAll()
    res.json({posts})
  }catch(err){next(err)}
}

module.exports = { createPost, getPosts }
