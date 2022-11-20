import express from 'express';
import { sequelize } from './sequelize';

import { IndexRouter } from './controllers/v0/index.router';

import bodyParser from 'body-parser';

import { V0MODELS } from './controllers/v0/model.index';

(async () => {
  

  console.log("Adding model...");
  await sequelize.addModels(V0MODELS);
  
  console.log("Trying to connect to database...");
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfuly");
  } catch(error) {
    console.log("Unable to connect to database", error);
  }
  
  console.log("Syncing model...");
  try {
    await sequelize.sync();
    console.log("Model is synched");
  } catch(error) {
    console.log("Unable to sync model.", error);
  }
  

  const app = express();
  const port = process.env.PORT || 8080; // default port to listen
  console.log("express app is created");
  
  
  app.use(bodyParser.json());
  console.log("app.use done");

  //CORS Should be restricted
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8100");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

  app.use('/api/v0/', IndexRouter)

  // Root URI call
  app.get( "/", async ( req, res ) => {
    res.send( "/api/v0/" );
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();