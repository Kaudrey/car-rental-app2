const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/api.response.js");
const { verify } = jwt;

module.exports = function (req, res, next) {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).send("Access denied! You must be logged in.");
  }

  try {
    const tokenWithoutBearer = token.replace("Bearer ", "").trim();
    let user = verify(tokenWithoutBearer, process.env.JWT)
    req.user = user;
    next();
  } catch (ex) {
    console.error(ex);
    return errorResponse("Invalid token!", res);
  }
};


