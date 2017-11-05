/******************
* Argument Errors *
*******************/

class ArgumentError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class NotIntegerError extends ArgumentError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

/**************
* Game Errors *
***************/
class GameError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class CellTakenError extends GameError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class InvalidMoveError extends GameError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class NoPlayerError extends GameError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class NotTurnError extends GameError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class SamePlayersError extends GameError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class WrongPlayerError extends GameError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

/***************
* Slack Errors *
****************/

class SlackError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class SlackAPIError extends SlackError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class SlackGameInProgressError extends SlackError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class SlacNoGameInProgressError extends SlackError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class SlackNotUserIdError extends SlackError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class SlackUknownCommandError extends SlackError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = {
  ArgumentError,
  CellTakenError,
  GameError,
  InvalidMoveError,
  NoPlayerError,
  NotIntegerError,
  NotTurnError,
  SamePlayersError,
  SlackAPIError,
  SlackGameInProgressError,
  SlacNoGameInProgressError,
  SlackNotUserIdError,
  SlackUknownCommandError,
  WrongPlayerError
}
