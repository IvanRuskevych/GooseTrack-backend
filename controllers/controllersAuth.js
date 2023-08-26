const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const { customError, ctrlWrapper } = require("../utils");

const { SECRET_KEY } = process.env;

// Функція яка обробляє запит POST для реєстрації користувача.

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw customError(409, "Email in use")
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ ...req.body, password: hashPassword });
    const userRegister = { email: newUser.email, subscription: newUser.subscription };
    const object = { user: userRegister };

    res.status(201).json(object);
};

// Функція яка обробляє запит POST для авторизації користувача.

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw customError(401, "Email or password wrong.");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw customError(401, "Email or password wrong.");
    }

    const userLogin = { email: user.email, subscription: user.subscription };

    const payload = {
        id: user.id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
        token,
        user: userLogin
    })
}

// Функція для перевірки дійсності токена

const Current = async (req, res) => {
    const { email, subscription } = req.user;

    res.json({ email, subscription })
}

// Функція для розлогінення користувача

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.status(204, "No content").json();
}


module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    Current: ctrlWrapper(Current),
    logout: ctrlWrapper(logout),
}

