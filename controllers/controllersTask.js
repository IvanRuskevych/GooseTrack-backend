const { Task } = require("../models/tasks");

const getAll = async (req, res, next) => {
  //   const { _id: owner } = req.user;
  //   const result = await Task.find({ owner });
  const result = await Task.find();
  res.json(result);
};

const add = async (req, res) => {
  //   const { _id: owner } = req.user;
  //   const result = await Task.create({ ...req.body, owner });
  const result = await Task.create({ ...req.body });

  res.status(201).json(result);
};

module.exports = {
  getAll,
  add,
};
