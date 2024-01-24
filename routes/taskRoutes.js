const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Task = require('../models/Task');
const { findOne, find } = require('../models/User');
const { object } = require('webidl-conversions');

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

//update a task
router.patch('/:id', auth, async(req,res)=>{
    const taskid= req.params.id;
    const updates= object.keys(req.body);
    const allowedUpdates= ['description', 'completed'];
    const isValidOperation = updates.every(update=>allowedUpdates.includes(update));
    if(!isValidOperation){
        return res.status(400).json({error: "invalid updates"});
    }
    try{
        const task = await findOne({
            _id: taskid,
            owner: req.user._id
        })
        if(!task){
            res.status(404).json({message: 'Task not found'});
        }
        updates.forEach(update =>task[update]= req.body[update]);
        await task.save();

        res.json({
            message: "Task Updated successfully"
        })
    }
    catch(err){
        res.status(404).send({error: err});
    }
})

//delete a task by id
router.delete('/:id', auth, async(req,res)=>{
    const taskid= req.params.id;
    try{
        const task = await Task.findOneAndDelete({
            _id: taskid,
            owner: req.user,_id
        })
        if(!task){
            res.status(404).json({message: "Task not found"});
        }
        res.json({
            message: "Task Deleted successfully"
        })

    }
    catch(err){
        res.status(404).json({error: err});
    }
})

module.exports = router;