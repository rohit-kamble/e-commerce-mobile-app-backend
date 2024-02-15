export const errorMiddleWare = (err, req, res, next) => {
  err.message = err.message || "internal server error";
  err.statusCode = err.statusCode || 500;
  if (err.code === 11000) {
    err.message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err.statusCode = 400;
  }
  console.log("---", err.name);
  if (err.name === "CastError") {
    err.message = `Invalid ${err.path} `;
    err.statusCode = 400;
  }
  return res.status(400).json({
    success: false,
    message: err.message,
  });
};

export const asyncError = (passFunction) => (req, res, next) =>
  Promise.resolve(passFunction(req, res, next)).catch(next);
