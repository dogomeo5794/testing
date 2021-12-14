import cors from "cors";
import helmet from "helmet";
import express, { Request, Response, NextFunction, json } from "express";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { AppRoutes } from "./routes";
import session = require("express-session");
declare module "express-session" {
  export interface SessionData {
    userId: any;
    email: string;
    otp: string;
  }
}

declare module "express" {
  export interface Request {
    user: any;
  }
}

// create connection with database
// note that it's not active database connection
// TypeORM creates connection pools and uses them for your requests
createConnection()
  .then(async (connection) => {
    // create express app
    const app = express();
    const corsOpts = {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "authorization",
        "x-access-token",
        "Origin",
        "X-Requested-With",
        "Accept",
      ],
      optionsSuccessStatus: 200,
      credentials: true,
      exposedHeaders: ["set-cookie"],
    };
    app.use(cors(corsOpts));
    app.use(helmet());
    app.use(json({ limit: "50mb" }));

    // register all application routes
    AppRoutes.forEach((route) => {
      app[route.method](route.path, (request: Request, response: Response) => {
        route.action(request, response);
      });
    });

    // run app
    app.listen(parseInt(process.env.PORT), () => {
      console.log(`server started on localhost: ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log("TypeORM connection error: ", error));
