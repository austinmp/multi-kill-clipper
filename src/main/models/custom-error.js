class CustomError extends Error {
  constructor(...params) {
    super(...params)
  }
}

module.exports = {CustomError};

