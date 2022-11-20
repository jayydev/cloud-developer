import {Sequelize} from 'sequelize-typescript';
import { config } from './config/config';


const c = config.dev;



// Instantiate new Sequelize instance!
console.log("Instantiating sequelizer");

  export const sequelize = new Sequelize({
    "username": c.username,
    "password": c.password,
    "database": c.database,
    "host":     c.host,
    dialect: 'postgres',
 //   storage: ':memory:',
    logging: console.log,  
  });


console.log("sequelizer instantiated");

