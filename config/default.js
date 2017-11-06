const path = require('path')
const env = process.env.NODE_ENV || 'development'

module.exports = {
  root: path.normalize(path.join(__dirname, '..')),
  env: env,
  isProduction: env === 'production',
  port: process.env.PORT || 3000,
  db: {
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://db/default',
      options: {
        useMongoClient: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 500,
        poolSize: 5
      }
    }
  },
  winston: {
    logLevel: process.env.WINSTON_LOG_LEVEL || 'verbose'
  },
  game: {
    xSymbole: 'X',
    oSymbole: 'O',
    drawSymbole: 'Draw'
  },
  slack: {
    baseApiUrl: 'https://slack.com/api',
    outletName: 'SLACK',
    reqToken: process.env.SLACK_REQ_TOKEN,
    devBearerToken: process.env.SLACK_DEV_BEARER_TOKEN,
    clientId: process.env.SLACK_CLIENT_ID,
    secret: process.env.SLACK_SECRET,
    commands: {
      default: 'DEFAULT',
      displayBoard: 'DISPLAY',
      challenge: 'CHALLENGE',
      place: 'PLACE',
      help: 'HELP'
    },
    messages: {
      noGameInProgress: ['Oops, no game in progress!!', 'You can start one by saying `/ttt challenge @name`'],
      gameInProgress: ['There is a game in progress for this channel :cry:', 'Please try another channel'],
      draw: ['What a shame. No one won the game :scream:'],
      winner: ['won the game :tada:'],
      nextMoveHint: ['Type `/ttt place 1-9` to make a move.'],
      catchAllMessage: ['Oops, something went wrong.'],
      wrongPlayer: ['Sorry, you\'re not one of the players :expressionless:'],
      notTurn: ['It\'s not your turn :stuck_out_tongue_closed_eyes:'],
      notUserId: ['Please try selecting someone using `@username`'],
      noOpponent: ['No opponent specified.', 'Please use `/ttt challenge @username`'],
      challengeSelf: ['You cant challenge yourself.', 'Please pick someone else as opponent'],
      invalidMove: ['Place numbers between 1-9'],
      help: ['Type `/ttt help` to see the available options.'],
      helpMessage: [ 'Hello :wave: Welcome to Tic-Tac-Toe Slack game.',
        'Type `/ttt challenge @name` to start a game.',
        'Type `/ttt display` to display the ongoing game.',
        'Type `/ttt place [1-9]` to place a move.']
    }
  }
}
