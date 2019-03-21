const User = require('../models/user');
exports.getStatus = async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById(userId);
  try {
    if(!user) {
      const error = new Error('User was not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({status: user.status})
  } catch(err) {
      if (!err.statusCode) {
          err.statusCode = 500;
      }
      next(err);
  }
}

exports.updateStatus = async (req, res, next) => {
  const userId = req.userId;
  const status = req.body.status;
  const user = await User.findById(userId);
  
  try {
    if(!user) {
      const error = new Error('User was not found');
      error.statusCode = 404;
      throw error;
    }
    user.status = status;
    user.save();
    res.status(200)
      .json({ 
        message: 'Status updated'
      });

  } catch(err) {
      if (!err.statusCode) {
          err.statusCode = 500;
      }
      next(err);
  }
}