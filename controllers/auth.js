const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { response } = require('express');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const { validationResult } = require('express-validator/check')

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  })
);

exports.getLogin = (req, res, next) => {
  let errorMessage = req.flash('error');
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: errorMessage,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let errorMessage = req.flash('errorMessage');
  let message = req.flash('errorMessage');
  if (message.length > 0) {
    message = message[0].msg;
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }
    User.findOne({ email: email})
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid username or password',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }
      bcrypt
      .compare(password, user.password)
      .then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err)
            res.redirect('/')
          });
        }
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid username or password',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      })
      .catch(err => {
        console.log(err);
        res.redirect('/login');
      });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: { 
        email: email, 
        password: password, 
        confirmPassword: req.body.confirmPassword 
      },
      validationErrors: errors.array()
    });
  }
    bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'bro12112@byui.edu',
        subject: 'Signup succeeded!',
        html: '<h1>You successfully signed up!</h1>'
      });
    })
    .catch(err => {
      console.log(err);
  })
};
 
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err)
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let errorMessage = req.flash('error');
  let successMessage = req.flash('success');
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: errorMessage,
    successMessage: successMessage
  });
};
 
exports.postReset = (req, res, next ) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        req.flash('error', 'No account with that email was found');
        return res.redirect('/reset');
      }
      req.flash('success', 'Password reset email sent');
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save()
    })
    .then(result => {
      res.redirect('/reset');
      transporter.sendMail({
        to: req.body.email,
        from: 'bro12112@byui.edu',
        subject: 'Password Reset',
        html: `
          <p>You requested a password reset</p>
          <a href="https://cse341-prove06-andrewbrower.herokuapp.com/reset/${token}">Click here to set a new password</a>
          <p>This link is set to expire in one hour from the time you received it</p>
        `
      });
    })
    .catch(err => {
      console.log(err);
    });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
  .then(user => {
    let errorMessage = req.flash('error');
    let successMessage = req.flash('success');
    if (errorMessage.length > 0) {
      errorMessage = errorMessage[0];
    } else {
      errorMessage = null;
    }
    // req.flash('success', 'Password reset email sent');
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: errorMessage,
      successMessage: successMessage,
      userId: user._id.toString(),
      passwordToken: token
    });
  })
  .catch(err => {
    console.log(err)
  });
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken, 
    resetTokenExpiration: {$gt: Date.now() },
  })
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = null;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err => {
    console.log(err);
  })
}