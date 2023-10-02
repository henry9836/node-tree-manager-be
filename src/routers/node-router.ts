// Packages
import express, {Router} from 'express';
import {DatabaseController, NodeInfo} from "../controllers/database-controller";

export class NodeRouterClass {
    router : Router;
    databaseController : DatabaseController | undefined;

    constructor(_databaseController: DatabaseController) {
        // Setup
        this.router = express.Router();
        this.databaseController = _databaseController;
        if (!this.router || !this.databaseController){
            console.error("Router or Database Controller failed to be valid in NodeRouterClass constructor");
            process.exit(300);
        }

        // Get node subtree, path prediction or whole tree
        this.router.get('/', async (req, res, next) => {
            try {
                if (!this.databaseController) {
                    return next("databaseController not set");
                }

                // Get query values
                const {path, predictPath, getAllTrees} = req.query;

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
                    const pathResult = await this.databaseController.GetNodeFromPath(nodePath);
                    if (!pathResult) {
                        return next("No node found at path");
                    }

                    // Get the node's subtree
                    const nodeTreeInfo = await this.databaseController.GetNodeSubtree(pathResult);
                    res.json(nodeTreeInfo);
                }
                else if (predictPath){
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
                    const pathResult = await this.databaseController.GetPossiblePaths(nodePath);
                    res.json(pathResult);
                }
                else if (getAllTrees){
                    const nodeTree = await this.databaseController.GetAllNodes();
                    res.json(nodeTree);
                }
                else{
                    next("Error: No valid query: " + req.query);
                }
            } catch (error) {
                return next(error)
            }
        });

        // Create a new node
        this.router.post('/', async (req, res, next) => {
            try {
                if (!this.databaseController) {
                    return next("databaseController not set");
                }

                // Get request body
                let {parent, name, properties} = req.body;

                // Create new node
                const newNode : NodeInfo =
                {
                    nodeId: -1,
                    parent: parent,
                    name: name.toString(),
                    dateCreated: Date.now(),
                    property: properties
                };
                res.json(await this.databaseController.CreateNewNode(newNode));
            } catch (error) {
                return next(error)
            }
        });

        // Delete a node
        this.router.delete('/', async (req, res, next) => {
            try {
                if (!this.databaseController) {
                    return next("databaseController not set");
                }

                // Get request body
                let {nodeId} = req.body;

                // Get node from id
                let nodeToDelete = await this.databaseController.GetNodeFromId(nodeId);
                if (!nodeToDelete){
                    return next("Node does not exist");
                }

                // Delete node and subtree
                res.send(await this.databaseController.DeleteNode(nodeToDelete));
            } catch (error) {
                return next(error)
            }
        });

        // Update a node values
        this.router.patch('/', async (req, res, next) => {
            try {
                if (!this.databaseController) {
                    return next("databaseController not set");
                }

                // Get request body
                let {nodeId, properties} = req.body;

                console.log(req.body)

                // Get Node from Id
                let nodeToUpdate: any = await this.databaseController.GetNodeFromId(nodeId);
                if (!nodeToUpdate){
                    return next("Node does not exist");
                }

                // Update values
                nodeToUpdate.property = properties;
                res.send(await this.databaseController.UpdateNode(nodeToUpdate));
            } catch (error) {
                return next(error)
            }
        });
    }
}

