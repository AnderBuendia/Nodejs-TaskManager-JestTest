const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');
const auth = require('../middleware/auth');
const User = require('../models/user');

/* Login */
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

/* Logout */
router.post('/users/logout/', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        });

        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll/', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

/* CRUD (Create, Read, Update, Delete) */
/* Create */
router.post('/users', async (req, res) => {
    // console.log(req.body);
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
    
    // user.save().then(() => {
        // res.status(201).send(user);
    // }).catch(e => {
        // res.status(400).send(e);
    // })
});

/* Read */
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
    // try {
    //     const users = await User.find({});
    //     res.send(users);
    // } catch (error) {
    //     res.status(500).send();
    // }
 
    // User.find({}).then((users) => {
    //     res.send(users);
    // }).catch(e => {
    //     res.status(500).send();
    // })
});

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
    
//     try {
//         const user = await User.findById(_id);
//         if (!user) {
//             return res.status(404).send();
//         }

//         res.send(user);
//     } catch (error) {
//         res.status(500).send();
//     }

//     // User.findById(_id).then(user => {
//     //     if (!user) {
//     //         return res.status(404).send();
//     //     }

//     //     res.status(200).send(user);
//     // }).catch(e => {
//     //     res.status(500).send();
//     // });
// });

/* Update */
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try {
        // const user = await User.findById(req.params.id);

        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

       // const user = await User.findByIdAndUpdate(req.params.id, 
       //     req.body, { new: true, runValidators: true });
        
        // if (!user) {
        //     return res.status(404).send();
        // }
        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);   
    }
});

/* Delete */
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id);

        // if(!user) {
        //     return res.status(404).send();
        // }
        sendCancelationEmail(req.user.email, req.user.name);
        await req.user.remove();
        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
});

/* Upload files */
const storage = multer.memoryStorage(); /* multer newer versions to includes buffer */
const upload = multer({
    dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        // if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        //     cb(new Error('Please upload an image'))
        // }
        // cb(undefined, true);
        const allowedMIMETypes = [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg', 'image/jpg', 'image/png'
          ];
          if (!allowedMIMETypes.includes(file.mimetype)) {
            return cb(new Error('Please upload a correct file'));
          }

          cb(undefined, true);
    },
    storage /* multer newer versions to show includes buffer */
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    /* Sharp, you can resize and change the format image */
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();    
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send();
    }
});

module.exports = router;