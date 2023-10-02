// Packages
import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";

// Local Files
import {DatabaseController} from './controllers/database-controller';
import {NodeRouterClass} from './routers/node-router';

// Configs
import config from './config.json';

const dbController =  new DatabaseController();
const nodeRouter = new NodeRouterClass(dbController);

const app = express();

// The main function of our server
async function startService(){

    try {
        // Setup express
        const port = config.port;

        app.use(cors());
        app.use(bodyParser.json());

        // Setup database controller
        await dbController.InitializeConnection(config.dbInfo);
        await dbController.preseedDB();

        app.use('/node', nodeRouter.router);

        app.get('/', (req, res) => {
            // Redirect to node router
            res.redirect('/node');
        });

        app.listen(port, () => {
            console.log(`Started service on port: ${port}`)
        });
    }
    catch (err) {
        console.log(`Error occurred during initialization: ${err}`);
        process.exit(100);
    }
}

startService().then(() => console.log("Finished Initialising."));

module.exports = app;