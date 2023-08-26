const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const { CustomError } = require("../utils");

const { SECRET_KEY } = process.env;


const authenticate = async (req, res, next) => {
    const { authorization = "" } = req.headers;
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
        next(CustomError(401));
    }
    try {
        const { id } = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(id);
        if (!user || !user.token || user.token !== token) {
            next(CustomError(401));
        }
        req.user = user;
        next();
    }
    catch {
        next(CustomError(401));
    }

}

module.exports = authenticate