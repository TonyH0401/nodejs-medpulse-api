# Medpulse - Backend  API
## Version 1.01

## Medpulse API Documentation
Postman: https://documenter.getpostman.com/view/23243291/2s9YyqiMnB

## Installation
Access Github Repository: https://github.com/TonyH0401/nodejs-medpulse-backend.
Download the Github Reposity:
```sh
git clone https://github.com/TonyH0401/nodejs-medpulse-backend.git
cd nodejs-medpulse-backend
```

Medpulse Backend API requires [Node.js](https://nodejs.org/) v10+ to run.
Install the dependencies and devDependencies and start the server.
```sh
cd nodejs-medpulse-backend
npm i
npm i nodemon --save-dev
npm run api
```

## Environment Variables:

```sh
API_PORT=""
MONGODB=""
MONGODBV2=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

## Update Log
### Version 1.01
* Update and fix middleware, remove deprecated middlewares and function for Pricings, Contents, Services, Users, Accounts and Posts.
* Update Postman.
* Initialize api version 2.
### Version 1.00
* Created Medpulse Backend API Version 1.
* Completed Routes: Pricings, Contents, Services, Users, Accounts and Posts.
* Created Postman documentation.