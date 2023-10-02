"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Packages
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
// Local Files
const database_controller_1 = require("./controllers/database-controller");
const node_router_1 = require("./routers/node-router");
// Configs
const config_json_1 = __importDefault(require("./config.json"));
const dbController = new database_controller_1.DatabaseController();
const nodeRouter = new node_router_1.NodeRouterClass(dbController);
const app = (0, express_1.default)();
// The main function of our server
function startService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Setup express
            const port = config_json_1.default.port;
            app.use((0, cors_1.default)());
            app.use(body_parser_1.default.json());
            // Setup database controller
            yield dbController.InitializeConnection(config_json_1.default.dbInfo);
            yield dbController.preseedDB();
            app.use('/node', nodeRouter.router);
            app.get('/', (req, res) => {
                // Redirect to node router
                res.redirect('/node');
            });
            app.listen(port, () => {
                console.log(`Started service on port: ${port}`);
            });
        }
        catch (err) {
            console.log(`Error occurred during initialization: ${err}`);
            process.exit(100);
        }
    });
}
startService().then(() => console.log("Finished Initialising."));
module.exports = app;
