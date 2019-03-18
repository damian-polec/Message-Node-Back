const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');
const Post = require('../models/post');


const deleteImage =  filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
  };

exports.getPosts = (req, res, next) => {
    Post.find()
        .then(posts => {
            res.status(200).json({ posts: posts })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.createPost = (req, res, next) => {
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
    console.log(imageUrl);
    const post = new Post({
            title: title,
            imageUrl: imageUrl,
            content: content,
            creator: {
                name: 'Damian'
            }
        });
    post.save()
        .then(result => {
            res.status(201).json({
                message: 'Post created successfully!',
                post: result
                })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post was not found');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                post: post
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.updatePost = (req, res, next) => {
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

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post was not found');
                error.statusCode = 404;
                throw error;
            }
            if ( updatedImageUrl !== post.imageUrl ) {
                deleteImage(post.imageUrl);
            }
            post.title = updatedTitle;
            post.imageUrl = updatedImageUrl;
            post.content = updatedContent;
            return post.save();
        })
        .then(result => {
            res.status(200).json({ post: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

