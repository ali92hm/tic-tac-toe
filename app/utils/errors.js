
class GameError extends Error {
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

class NoPlayerError extends GameError {
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

class NotTurnError extends GameError {
  constructor (message) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class InvalidMove extends GameError {
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

module.exports = {
  GameError,
  WrongPlayerError,
  SamePlayersError,
  NotTurnError,
  InvalidMove,
  NoPlayerError,
  CellTakenError
}
