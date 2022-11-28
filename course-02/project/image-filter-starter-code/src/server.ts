import express, { Request, Response, NextFunction, response } from 'express';
import bodyParser from 'body-parser';
import * as jwt from 'jsonwebtoken';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
import { config } from './config/config';
import { request } from 'http';
import { nextTick } from 'process';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());


  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  app.get("/filteredimage",
    requireAuth,
    //validateUrl,
    async (req: Request, resp: Response, next: NextFunction) => {
      const imageUrl = req.query.image_url as string;
      try {
        let absolutePath = await filterImageFromURL(imageUrl) as string;
        resp.status(200).sendFile(absolutePath, function () {
          deleteLocalFiles([absolutePath]);
        });
      } catch (error) {
        return next(error);
      }
    });

  // validate authentication 
  function requireAuth(req: Request, resp: Response, next: NextFunction) {
    if (!req.headers || !req.headers.authorization) {
      return resp.status(401).send({ message: 'No authorization headers.' });
    }

    const token_bearer = req.headers.authorization.split(' ');
    if (token_bearer.length != 2) {
      return resp.status(401).send({ message: 'Malformed token.' });
    }

    const token = token_bearer[1];
    return jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        return resp.status(500).send({ auth: false, message: 'Failed to authenticate.' });
      }
      return next();
    });
  }

  // validate url
  function validateUrl(req: Request, resp: Response, next: NextFunction) {
    const imageUrl = req.query.image_url;
    if (!imageUrl || typeof imageUrl !== "string") {
      return resp.status(400).send(`Query param url has to be of the type string`);
    }
    else {
      try {
        const validUrl = new URL(imageUrl);
      } catch (error) {
        console.log(error);
        return resp.status(400).send(`Query param url ${imageUrl} is not a valid url`);
      }
    }
    next();
  }

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });

})();