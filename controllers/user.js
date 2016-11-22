const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Board = require('../models/Board');

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    User.findById(req.user._id).populate('boards')
      .exec(function (err, user) {
        return res.send({ success: true, user: req.user });
      });
  } else {
    return res.send({ success: false });
  }
};

exports.getLog = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  return res.render('account/login');
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    // req.flash('errors', errors);
    console.log(req.headers);
    return res.send({
      success: false,
      redirect: '/login',
      flash: errors
    });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      // req.flash('errors', info);
      return res.send({
        success: false,
        redirect: '/login',
        flash: info
      });
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      // req.flash('success', { msg: 'Success! You are logged in.' });
      res.send({
        success: true,
        user: req.user
      });
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  res.send({ success: true });
  console.log("User logged out: \n");
  console.log(req.session);
};

exports.getAll = (req, res) => {
  User.find({})
    .exec(function (err, users) {
      if (err) { return next(err); }
      return res.send({ success: true, users: users });
    });
}

exports.postMember = (req, res) => {
  console.log(req.body.user._id);
  User.findOne({ _id: req.body.user._id })
    .exec(function (err, user) {
      if (err) { console.log(err); return next(err); }
      let repeted = false;
      if (user) {
        user.colabs.forEach(function (colab) {
          if (colab == req.body.boardId) {
            repeted = true;
          }
        });
        if (!repeted) {
          user.colabs.push(req.body.boardId);
          user.save();
          Board.findOne({ _id: req.body.boardId })
            .exec(function (err, board) {
              if (err) { return next(err); }
              let repeat = false;
              board.members.forEach(function (member) {
                if (member == req.body.user._id) {
                  repeat = true;
                }
              });
              if (!repeat) {
                board.members.push(req.body.user._id);
                board.save();
                return res.send({ success: true });
              } else {
                return res.send({ success: false, flash: 'Repeated record' });
              }
            });
        } else {
          return res.send({ success: false, flash: 'Repeated record' });
        }
      }
    });
}

exports.getMembers = (req, res) => {
  if (req.user) {
    Board.findOne({ _id: req.params.id })
      .populate('members')
      .exec(function (err, board) {
        if (err) { return next(err); }
        return res.send({ success: true, members: board.members });
      });
  }
}

exports.deleteMember = (req, res) =>{
    if(req.user) {
        let deletedMember = req.params.memberid;
        let boardId = req.params.boardid;
        Board.findOne({ _id: boardId })
        .exec(function(err, board){
                if (err) { console.log(err); return next(err); };
                 let newMembers = [];
                 board.members.forEach(function(member){
                    if(member.toString() != deletedMember){
                        newMembers.push(member);
                    }
                });
                board.members = newMembers;
                board.save();
                User.findOne({ _id: deletedMember })
                .exec(function(err, user){
                   if (err) { console.log(err); return next(err); };
                   let colabs = [];
                   user.colabs.forEach(function(colab){
                     if(colab.toString() != boardId){
                       colabs.push(colab);
                     }
                   });
                   user.colabs = colabs;
                   user.save();
                });
                return res.send({ success: true });
        });
    }
}

// /**
//  * GET /signup
//  * Signup page.
//  */
// exports.getSignup = (req, res) => {
//   if (req.user) {
//     return res.redirect('/');
//   }
//   res.render('account/signup', {
//     title: 'Create Account'
//   });
// };

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.assert('name', 'Please enter a name');
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    // req.flash('errors', errors);
    return res.send({ success: false, flash: errors });
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    profile:{
      name: req.body.name
    }
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      return res.send({
        success: false,
        flash: 'Account with that email address already exists.'
      });
    }
    user.save((err) => {
      if (err) { return next(err); }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.send(user);
      });
    });
  });
};

exports.postProfilePictureUpload = (req, res, next) => {
  // req.flash('success', { msg: 'File was uploaded successfully.' });
  console.log(req.file);
  if(req.user){
    let user = req.user;
    user.profile.picture = process.env.BASE_URL + '/' + req.file.path;
    user.save();
    res.redirect(process.env.CLIENT_URL+"/account");
  }
};

exports.getUser = (req, res, next) => {
  if(req.user){
    console.log(req.user);
    return res.send({ success:true, user: req.user });
  }
};

exports.putUpdateUser = (req, res, next) => {
  req.assert('user.email', 'Please enter a valid email address.').isEmail();
  req.sanitize('user.email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.send({success: false, flash: errors});
    // return res.redirect('/account');
  }

  User.findById(req.user._id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.user.email || '';
    user.profile.name = req.body.user.profile.name || '';
    user.profile.gender = req.body.user.profile.gender || '';
    user.profile.location = req.body.user.profile.location || '';
    user.profile.website = req.body.user.profile.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.send({ success: false, flash: 'The email address you have entered is already associated with an account.' });
          // return res.redirect('/account');
        }
        return next(err);
      }
      // req.flash('success', { msg: 'Profile information has been updated.' });
      // res.redirect('/account');
      res.send({success: true, user: user})
    });
  });
};



/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render('account/profile');
};

exports.getAccountInfo = (req, res) => {
  res.json(req.user);
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function (done) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
          if (err) { return next(err); }
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function (user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function (done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
          return res.redirect('/forgot');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/forgot');
  });
};
