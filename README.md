# Tick-Tac-Toe
A tick tac toe game.

## Dependencies
Development and deployment of this application is completely dockerized. You don't need anything except `docker` and `docker-compose` for local development.

* [Docker](https://www.docker.com/)
* [Docker-compose (usually installed with docker)](https://docs.docker.com/compose/install/)
* [node](http://nodejs.org) (optional)
* [npm](https://www.npmjs.com) (optional)


## Development
### Interfaces
This app was designed to be independent of any interface. So different mediums can use it in order to play Tic tac toe. Currently the only implemented integration is with Slack as a Slash command, but it is easily extendable to other interfaces such as web, FB Messenger, text interface, REST API as a service etc.

#### Slack
To use this app with Slack you need to first create a [Slack app](https://api.slack.com/slack-apps).
Then you need to:

* Enable Slash commands and point one to your app
* Enable interactive components
* Give it `users:read` permission

### Install
To install all dependencies and npm packages run:

Preferred way:

```
$ docker-compose run tic-tac-toe npm i
```

Not preferred way (through npm directly):

`npm i`

### Environment Variables
This app uses environment for its configuration. The environment variables are passed to apps by `docker-compose` `env_file: .env`

The express app reads these env variables using [config npm package](https://www.npmjs.com/package/config). All this logic is contained in `config/default.js` file along side with constants and other goodies.

The file `.env` is not tracked by git since it contains secrets and connection strings. Instead `.env.example` is provided so you know what the name of the variables are. Copy the `.env.example` and name it `.env`, then supply the necessary parameters.

### Local Execution
To run the application and all it's dependencies locally run.

```
docker-compose up
```

What this command does:

* Runs a MongoDB container
* Runs [mongo-express](https://github.com/mongo-express/mongo-express) on [http://localhost:8081](http://localhost:8081/) for seeing what's in Mongo
* Runs the tic-tac-toe express app on [http://localhost:3000](http://localhost:3000) by defualt

You can use [ngrok](https://ngrok.com/) or [localtunnel](https://github.com/localtunnel/localtunnel) to test against slack locally.

## Deployment
//TODO

## Playing instructions
### Slack
* Start a game by typing `/ttt challenge @opponent`
    * There can be at most one game in progress per chanel
    * You cannot challenge yourself
* Place a move by typing `/ttt place [1-9]`
    * You can only play if you are a player of that game
    * You cannot overwrite a cell that is taken
* Anyone can see the board and players by typing `/ttt display`
    * There needs to be an on going game for that channel

Board sample

```
  +---+---+---+
  | 1 | 2 | O |
  |---+---+---|
  | 4 | X | 6 |
  |---+---+---|
  | 7 | 8 | 9 |
  +---+---+---+
```

## Structure
    tic-tac-toe
    .
    ├── .editorconfig
    ├── .gitignore
    ├── .dockerignore               - Ignore files for docker build
    ├── Dockerfile                  - Instructions to build docker container
    ├── docker-compose.yml          - Instructions to run all the services for development
    ├── package.json                - Used npm packages
    ├── .env.example                - Example of env variables needed
    ├── .env                        - File env variables are read from (ignored by git)
    ├── README.md
    ├── node_modules                - Contains bower modules
    ├── config                      - configuration for app
    │   ├── default.js                  - Reading env variables and providing constants etc.
    │   ├── express.js                  - Configures express
    │   ├── mongo.js                    - Configures mongo (datastore)
    │   └── winston.js                  - Configures winston (logging)
    ├── app                         - application files
    │   ├── apis                        - api handlers
    │   ├── controllers                 - controllers responsible for api handlers
    │   ├── services                    - Adapters to external services
    │   │    ├── db                         - Database scripts (mongo)
    │   │    └── slack                      - Slack integration
    │   ├── auth                        - Auth middleware
    │   └── utils                       - Utility scripts
    └── test                        - Folder containing all the tests (mirrors app directory)


## Potential Bugs

## To do
