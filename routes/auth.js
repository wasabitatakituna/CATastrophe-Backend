const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user')

router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json(
                { error: 'Username has already been taken.' }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ username, passwordHash});

        await newUser.save();

        res.status(201).json({ message: 'Created New Account.' })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Signup failed, please try again.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Invalid Username or Password.' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid Username or Password.' });

        const token = jwt.sign({ userId: user._id, userName: user.username }, process.env.JWT_SECRET);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.get('/profile', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('username createdAt');
        res.json(user);
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    res.json({ message: 'Successfully Logged Out' });
});

// put
router.put('/update', async (req, res) => {
    const { newUsername } = req.body;

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const existingUser = await User.findOne({ newUsername });
        if (existingUser) {
            return res.status(409).json(
                { error: 'Username has already been taken.' }
            );
        }

        await User.findByIdAndUpdate(decoded.userId, { username: newUsername });

        res.status(201).json({ message: 'Successfully Updated Account.' })
    } catch {
        res.status(401).json({ error: 'Unable to Update Account.' });
    }
});

// delete
router.delete('/delete', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.findByIdAndDelete(decoded.userId);
        
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.status(201).json({ message: 'Successfully Deleted Account.' })
    } catch {
        res.status(401).json({ error: 'Unable to Delete Account.' });
    }
});


module.exports = router;