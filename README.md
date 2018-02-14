# Tic Tac Toe
An implementation of tic tac toe game.

## Usage

### Install
To install all dependencies and npm packages run:

Preferred way:

```
$ docker-compose run tic-tac-toe npm i
```

Not preferred way (through npm directly):

```
npm i
```

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
* Runs the tic-tac-toe express app on [http://localhost:3000](http://localhost:3000) by default

## Dependencies
Development and deployment of this application is completely dockerized. You don't need anything except `docker` and `docker-compose` for local development.

* [Docker](https://www.docker.com/)
* [Docker-compose (usually installed with docker)](https://docs.docker.com/compose/install/)
* [node](http://nodejs.org) (optional)
* [npm](https://www.npmjs.com) (optional)


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
    ├── deployment                  - Contains kubernetes helm chart and deployment scripts
    ├── README.md
    ├── node_modules                - Contains npm modules
    ├── config                      - Configuration for app
    │   ├── default.js                  - Reading env variables and providing constants etc.
    │   ├── test.js                     - Env variables for testing
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


## [Potential Bugs](https://github.com/ali92hm/tic-tac-toe/issues)

## [To do](https://github.com/ali92hm/tic-tac-toe/milestones)

## License
[MIT license](http://opensource.org/licenses/MIT)