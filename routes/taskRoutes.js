const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Task = require('../models/Task');

router.get('/test', auth, (req,res)=> {
    res.json({
        message: 'Task routes are working!',
        user: req.user
    })
}); 

//Create a task
router.post('/', auth, async(req,res)=>{

    try{
    const task= new Task({
        ...req.body,
        owner: req.user._id
    })
    await task.save();
    res.status(201).json({task, message:"Task Created Successfully"});
    }
    catch(err){
        res.status(400).send({error: err});
    }
})

//get a task
router.get('/', auth, async(req,res)=>{
    try{
        const tasks= await Task.findOne({
            owner: req.user._id
        })
        res.status(200).json({
            tasks, count: tasks.length,
            message: 'Task fetched successfully'
        })
    }
    catch(err){
        res.status(400).send({error: err})
    }
});

//fetch a task by id
router.get('/:id', auth, async(req,res)=>{
    const taskId= req.params.id;
    try{
        const task= await Task.findOne({
            _id: taskId,
            owner: req.user._id
        });
        if(!task){
            return res.status(404).json({
                message: 'task not found'
            });
        }
        res.status(200).json({
            task, 
            message: 'task fetched successfully'
        })
    }
    catch(err){
        res.status(400).send({error: err});
    }
})
module.exports = router;