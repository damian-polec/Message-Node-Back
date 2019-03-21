const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');


exports.createUser = async ( req, res, next ) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  try {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
          name: name,
          email: email,
          password: hashedPassword
    })
    user.save();
    res.status(201).json({ message: 'User creation success', userId: user._id });

  } catch(err) {
      if (!err.statusCode) {
          err.statusCode = 500;
      }
      next(err);
  }
}

exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({email: email});
    const bcryptCompare = bcrypt.compare(password, user.password);

    if(!bcryptCompare) {
      const error = new Error('Password is incorrect');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
      email: user.email,
      name: user.name,
      userId: user._id.toString()
    },
     '~dS%`Fz2gKq[c%.g', 
     { expiresIn: '1h' }
    );
    res.status(200)
      .json({ 
        token: token,
        userId: user._id.toString() 
      })
  } catch(err) {
      if (!err.statusCode) {
          err.statusCode = 500;
      }
      next(err);
    }
}