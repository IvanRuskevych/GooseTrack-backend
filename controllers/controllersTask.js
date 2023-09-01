const { Task } = require("../models/task");
const { CustomError } = require("../utils");

// Таски по контроллеру getAll получаем за указанный месяц или день. Если ничего не указано - за текущий месяц

const getCurrentMonth = () => {
  const formatNumber = (value) => {
    return value.toString().padStart(2, "0");
  };
  const currentDate = new Date();
  // Номер текущего месяца (0 - январь)
  const currentMonth = currentDate.getMonth() + 1;
  const currentYearh = new Date().getFullYear();
  return `${currentYearh}-${formatNumber(currentMonth)}`;
};

const getFilter = (params) => {
  const { day, month } = params;
  let filter = "";
  if (day) {
    filter = day;
  } else if (month) {
    filter = month.slice(0, 7);
  } else {
    filter = getCurrentMonth();
  }
  return filter;
};

const getAll = async (req, res, next) => {
  const { _id: owner } = req.user;
  const filter = getFilter({ ...req.query });
  const results = await Task.find({
    owner,
    date: { $regex: filter, $options: "i" },
  }).populate("owner", "name avatarURL");

  results.sort((a, b) => (a.category > b.category ? 1 : -1));

  const groupedResults = {};

  results.forEach((result) => {
    if (!groupedResults[result.category]) {
      groupedResults[result.category] = [];
    }
    groupedResults[result.category].push(result);
  });

  const groupedArray = Object.entries(groupedResults).map(
    ([category, data]) => ({
      category,
      amount: data.length,
      data,
    })
  );

  res.status(200).json(groupedArray);
};

const add = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Task.create({ ...req.body, owner });
  res.status(201).json({ code: 201, data: result });
};

const update = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user._id;
  const newData = req.body;

  // Проверяем, является ли пользователь владельцем задачи
  const taskToUpdate = await Task.findById(id);
  if (!taskToUpdate) {
    throw CustomError(404, "Task not found");
  }
  if (taskToUpdate.owner.toString() !== ownerId.toString()) {
    return res
      .status(403)
      .json({ code: 403, message: "У вас нет прав на изменение этой задачи" });
  }

  // Если пользователь владелец, обновляем задачу
  const result = await Task.findByIdAndUpdate(id, newData, { new: true });

  res.status(200).json({ code: 200, data: result });
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user._id;

  // Проверяем, является ли пользователь владельцем задачи
  const taskToDelete = await Task.findById(id);
  if (!taskToDelete) {
    throw CustomError(404, "Task not found");
  }
  if (taskToDelete.owner.toString() !== ownerId.toString()) {
    return res
      .status(403)
      .json({ code: 403, message: "У вас нет прав на удаление этой задачи" });
  }

  // Если пользователь владелец, удаляем задачу
  const result = await Task.findByIdAndDelete(id);

  res
    .status(200)
    .json({ code: 200, message: "Task deleted", deletedTask: result });
};

module.exports = {
  getAll,
  add,
  update,
  deleteTask,
};
