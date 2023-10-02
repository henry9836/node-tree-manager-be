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
exports.NodeRouterClass = void 0;
// Packages
const express_1 = __importDefault(require("express"));
class NodeRouterClass {
    constructor(_databaseController) {
        // Setup
        this.router = express_1.default.Router();
        this.databaseController = _databaseController;
        if (!this.router || !this.databaseController) {
            console.error("Router or Database Controller failed to be valid in NodeRouterClass constructor");
            process.exit(300);
        }
        // Get node subtree, path prediction or whole tree
        this.router.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.databaseController) {
                    return next("databaseController not set");
                }
                // Get query values
                const { path, predictPath, getAllTrees } = req.query;
                if (path) {
                    let nodePath = path.toString();
                    if (nodePath.at(0) == "/") {
                        nodePath = nodePath.slice(1);
                    }
                    if (nodePath.at(nodePath.length - 1) != "/") {
                        nodePath += "/";
                    }
                    if (nodePath.length == 0) {
                        return next("Path is empty");
                    }
                    // Find the node from the path
                    const pathResult = yield this.databaseController.GetNodeFromPath(nodePath);
                    if (!pathResult) {
                        return next("No node found at path");
                    }
                    // Get the node's subtree
                    const nodeTreeInfo = yield this.databaseController.GetNodeSubtree(pathResult);
                    res.json(nodeTreeInfo);
                }
                else if (predictPath) {
                    let nodePath = predictPath.toString();
                    if (nodePath.at(0) == "/") {
                        nodePath = nodePath.slice(1);
                    }
                    if (nodePath.at(nodePath.length - 1) != "/") {
                        nodePath += "/";
                    }
                    if (nodePath.length == 0) {
                        return next("Path is empty");
                    }
                    // Find the node from the path
                    const pathResult = yield this.databaseController.GetPossiblePaths(nodePath);
                    res.json(pathResult);
                }
                else if (getAllTrees) {
                    const nodeTree = yield this.databaseController.GetAllNodes();
                    res.json(nodeTree);
                }
                else {
                    next("Error: No valid query: " + req.query);
                }
            }
            catch (error) {
                return next(error);
            }
        }));
        // Create a new node
        this.router.post('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.databaseController) {
                    return next("databaseController not set");
                }
                // Get request body
                let { parent, name, properties } = req.body;
                // Create new node
                const newNode = {
                    nodeId: -1,
                    parent: parent,
                    name: name.toString(),
                    dateCreated: Date.now(),
                    property: properties
                };
                res.json(yield this.databaseController.CreateNewNode(newNode));
            }
            catch (error) {
                return next(error);
            }
        }));
        // Delete a node
        this.router.delete('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.databaseController) {
                    return next("databaseController not set");
                }
                // Get request body
                let { nodeId } = req.body;
                // Get node from id
                let nodeToDelete = yield this.databaseController.GetNodeFromId(nodeId);
                if (!nodeToDelete) {
                    return next("Node does not exist");
                }
                // Delete node and subtree
                res.send(yield this.databaseController.DeleteNode(nodeToDelete));
            }
            catch (error) {
                return next(error);
            }
        }));
        // Update a node values
        this.router.patch('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.databaseController) {
                    return next("databaseController not set");
                }
                // Get request body
                let { nodeId, properties } = req.body;
                console.log(req.body);
                // Get Node from Id
                let nodeToUpdate = yield this.databaseController.GetNodeFromId(nodeId);
                if (!nodeToUpdate) {
                    return next("Node does not exist");
                }
                // Update values
                nodeToUpdate.property = properties;
                res.send(yield this.databaseController.UpdateNode(nodeToUpdate));
            }
            catch (error) {
                return next(error);
            }
        }));
    }
}
exports.NodeRouterClass = NodeRouterClass;
