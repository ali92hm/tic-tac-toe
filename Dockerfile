FROM node:carbon-alpine

# Setting the working directory
WORKDIR /usr/src/

# Setting the env variables for npm install and execution
ENV NODE_ENV=production
EXPOSE 3000

# Copy files and installing dependencies
COPY . .
RUN npm install

# Running the application
CMD npm start
