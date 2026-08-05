import Task from '../models/tasks.model.js';
import path from 'path';
import fs from 'fs';

export const getAllTask = async(req,res) => {
   try {
        const tasks = await Task.find({}).lean();
        res.status(200).json(tasks);
   } catch (error) {
        res.status(500).json({message:error.message})
   }
}

export const fetchTask = async(req,res) => {
    try {
        const task = await Task.findById(req.params.id).lean();
        if(!task) return res.status(404).json({message : 'task not found !!'})
        res.status(200).json(task);
    } catch (error) {
       res.status(500).json({message : error.message})
    }
}


export const createTask = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image not uploaded!' });
    }

    const task = new Task({
      ...req.body,
      document: req.file.filename
    });

    const newTask = await task.save();

    return res.status(200).json({
      message: 'Task created successfully',
      data: newTask
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const updateTask = async(req, res) => {
    try {
        const existingTask = await Task.findById(req.params.id).lean();
        if(!existingTask) return res.status(400).json({message : 'Task not find !!'})
        
        if(req.file){
            if(existingTask.document){
              const oldDoc =  path.join(process.cwd(),'uploads',path.basename(existingTask.document))
              if(fs.existsSync(oldDoc)){
                fs.unlinkSync(oldDoc)
              }
            }
           req.body.document = req.file.filename
        }
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {new : true});
        res.status(200).json(updatedTask)
        
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}


export const deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id).lean();

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found!" });
    }

    // Delete document file if exists
    if (deletedTask.document) {
      const filepath = path.join(
        process.cwd(),
        "uploads",
        path.basename(deletedTask.document)
      );

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    return res.status(200).json({
      message: "Task deleted successfully!"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


