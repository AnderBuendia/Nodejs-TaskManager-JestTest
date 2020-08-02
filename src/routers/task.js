const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

/* Create */
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);        
    }
    // task.save().then(() => {
    //     res.status(201).send(task);
    // }).catch(e => {
    //     res.status(400).send(e);
    // })
});



/* Read */
/*  GET /tasks?completed=true
 *  GET /tasks?limit=10&skip=0 E.G First ten results
 *  GET /tasks?sortBy=field:order (createdAt:asc) */
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = (req.query.completed === 'true');
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = (parts[1] === 'desc' ? -1 : 1);
    }

    try {
        // const tasks = await Task.find({ owner: req.user._id });
        /* With populate */
        await req.user.populate({
            path: 'tasks',
            match, /* Filtering data */
            options: { /* Pagination */
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
                // sort: {
                //     // createdAt: 1 /* asc 1 desc -1 */
                //     completed: -1
                // }        
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (error) {
        res.status(500).send();
    }
    /* Promise then catch */
    // Task.find({}).then((tasks) => {
    //     res.send(tasks);
    // }).catch(e => {
    //     res.status(500).send();
    // })
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        // const task = await Task.findById(_id);
        const task = await Task.findOne({ _id, owner: req.user._id })
        
        if (!task) {
           return res.status(404).send();
        }

        res.send(task);
    } catch (error) {
        res.status(500).send();
    }
    // Task.findById(_id).then(task => {
    //     if (!task) {
    //         return res.status(404).send();
    //     }

    //     res.status(200).send(task);
    // }).catch(e => {
    //     res.status(500).send();
    // });
});

/* Update */
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try {
        // const task = await Task.findById(req.params.id);
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.send(task);
    } catch (error) {
        res.status(400).send(error);   
    }
});

/* Delete */
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if(!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;