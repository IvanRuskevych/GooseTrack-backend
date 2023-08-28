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

// const getAll = async (req, res, next) => {
//   const { _id: owner } = req.user;
//   const filter = getFilter({ ...req.query });
//   const result = await Task.find({
//     owner,
//     date: { $regex: filter, $options: "i" },
//   });
//   res.status(200).json({ code: 200, data: result, count: result.length });
// };

const getAll = async (req, res, next) => {
  const { _id: owner } = req.user;
  const filter = getFilter({ ...req.query });
  const results = await Task.find({
    owner,
    date: { $regex: filter, $options: "i" },
  });

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
      data,
    })
  );

  res
    .status(200)
    // .json({ code: 200, data: groupedArray, count: results.length });
    .json(groupedArray);
};

const add = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Task.create({ ...req.body, owner });
  res.status(201).json({ code: 201, data: result });
};

const update = async (req, res) => {
  const { id } = req.params;
  const result = await Task.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!result) {
    throw CustomError(404, "Not found");
  }
  res.status(200).json({ code: 200, data: result });
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  const result = await Task.findByIdAndDelete(id);
  if (!result) {
    throw CustomError(404, "Not found");
  }
  res.status(200).json({ code: 200, message: "Task deleted" });
};

module.exports = {
  getAll,
  add,
  update,
  deleteTask,
};
