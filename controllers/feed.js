const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const User = require('../models/user');


const deleteImage =  filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
  };

exports.getPosts = async (req, res, next) => {
    const page = req.query.page || 1;
    const perPage = 2;
    
    try {
        const totalItems = await Post.find().countDocuments();            
        const posts = await Post.find()
            .populate('creator')
            .skip((page - 1) * perPage)
            .limit(perPage);
        
        res.status(200)
            .json({ 
                posts: posts, 
                totalItems: totalItems 
            })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }        
}

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422
        throw error;
    } 

    if(!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }
    
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace('\\','/');
    const newPost = new Post({
            title: title,
            imageUrl: imageUrl,
            content: content,
            creator: req.userId
        });
    newPost.save()
    try {
        const user = await User.findById(req.userId);
        user.posts.push(newPost);
        user.save();
        const post = await Post.findOne(newPost._id)
            .populate('creator', 'name');
        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
            creator: { _id: user._id, name: user.name }
        })
    } catch (err) {
        if (!err.statusCode) {
        err.statusCode = 500;
        }
        next(err);
    }
}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    try {
        if (!post) {
            const error = new Error('Post was not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            post: post
        })

    } catch(err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
    }
}

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty) {
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422
        throw error;
    } 

    const updatedTitle = req.body.title;
    const updatedContent = req.body.content;
    let updatedImageUrl = req.body.image;

    if (req.file) {
        updatedImageUrl = req.file.path.replace('\\', '/')
    }
    if (!updatedImageUrl) {
        const error = new Error('No image provided');
        error.statusCode(422);
        throw error;
    }

    const post = await Post.findById(postId);
    try {
        if (!post) {
            const error = new Error('Post was not found');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        if ( updatedImageUrl !== post.imageUrl ) {
            deleteImage(post.imageUrl);
        }
        post.title = updatedTitle;
        post.imageUrl = updatedImageUrl;
        post.content = updatedContent;
        post.save();
        res.status(200).json({ post: post });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId)
    try {
        if (!post) {
            const error = new Error('Post was not found');
            error.statusCode = 404;
            throw error;
        };

        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        };

        deleteImage(post.imageUrl);
        await Post.findByIdAndDelete(postId);

        const user = await User.findById(req.userId);
        user.posts.pull(postId)
        user.save();
        res.status(200).json({ message: 'Post deleted' })
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}