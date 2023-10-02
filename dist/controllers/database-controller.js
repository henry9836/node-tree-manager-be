"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseController = void 0;
// Import dependanices
const mariadb = __importStar(require("mariadb"));
class DatabaseController {
    constructor() {
        // Checks for common sql injection chars and commands
        this.sqlInjectionPattern = /(--)|["';`%=#]|(\b(UNION|OR|AND|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TABLE|FROM|WHERE)\b)/ig;
        this.pool = mariadb.createPool({});
        this.dbConnection = null;
    }
    // Get our connection ready
    InitializeConnection(dbInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Initialising database connection...");
            this.pool = mariadb.createPool(dbInfo);
            try {
                this.dbConnection = yield this.pool.getConnection();
                yield this.dbConnection.query(`USE ${dbInfo.database}`);
            }
            catch (err) {
                console.log(`Error occurred during database initialization: ${err}`);
                process.exit(200);
            }
            return;
        });
    }
    // Create a new node
    CreateNewNode(nodeInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Add input checks
                if (this.NodeHasInvalidChars(nodeInfo)) {
                    const error = "Invalid characters used in query";
                    console.error("Error occurred during node creation: ", error);
                    return -1;
                }
                // Query
                // https://mariadb.com/kb/en/insertreturning/
                const propertyString = JSON.stringify(nodeInfo.property);
                const queryArguments = [nodeInfo.parent, nodeInfo.name, propertyString];
                const returnValue = yield this.Query(`INSERT INTO node_tree (node_id, parent, name, property) VALUES(NULL, ?, ?, ?) RETURNING node_id;`, queryArguments);
                // Get node id and return
                return returnValue[0].node_id;
            }
            catch (err) {
                console.error("Error occurred during node creation: ", err);
                throw err;
            }
        });
    }
    // Returns the whole node_tree table
    GetAllNodes() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.Query(`SELECT * FROM node_tree`, []);
            }
            catch (err) {
                console.error("Error occurred during DisplayDatabase: ", err);
                throw err;
            }
        });
    }
    // Gets a node from an ID
    GetNodeFromId(nodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (nodeId < 0) {
                    return {
                        nodeId: -1,
                        parent: -1,
                        name: "Error: Invalid node path",
                        dateCreated: -1,
                        property: {}
                    };
                }
                var result = yield this.Query(`SELECT * FROM node_tree WHERE node_id = ?`, [nodeId]);
                const node = result[0];
                return {
                    nodeId: node.node_id,
                    parent: node.parent,
                    name: node.name,
                    dateCreated: node.date_created,
                    property: node.property
                };
            }
            catch (err) {
                console.error("Error occurred during GetNodeFromId: ", err);
                throw err;
            }
        });
    }
    //Get the node at the end of a path e.g /root/subNode/endNode
    GetNodeFromPath(nodePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const nodeNames = nodePath.split("/");
                // Input checks
                if (nodeNames.length <= 0) {
                    // Return an error object
                    return {
                        nodeId: -1,
                        parent: -1,
                        name: "Error: Invalid node path",
                        dateCreated: -1,
                        property: {}
                    };
                }
                for (let index = 0; index < nodeNames.length; index++) {
                    if (this.StringHasInvalidChars(nodeNames[index])) {
                        // Return an error object
                        return {
                            nodeId: -1,
                            parent: -1,
                            name: "Error: Invalid node path",
                            dateCreated: -1,
                            property: {}
                        };
                    }
                }
                // https://mariadb.com/kb/en/recursive-common-table-expressions-overview/
                // This will recursively search for the node with the correct path and parent ids, this starts from the top and works downwards into the tree
                // This query can return more than one node but the last one should be the one we want (nl = nodeList, cn = currentNode)
                const recursivePathSearch = `
            WITH RECURSIVE nodes AS(
                SELECT *
                FROM node_tree
                WHERE name = ? AND parent = -1
                UNION ALL
                SELECT nl.*
                FROM node_tree AS nl, nodes AS cn
                WHERE (nl.parent = cn.node_id AND nl.name IN (?))
            )
            SELECT * FROM nodes;`;
                // This will return our node from the path
                var returnValue = yield this.Query(recursivePathSearch, [nodeNames[0], nodeNames.slice(1)]);
                if (returnValue && returnValue.length > 0) {
                    const lastNode = returnValue[returnValue.length - 1];
                    return {
                        nodeId: lastNode.node_id,
                        parent: lastNode.parent,
                        name: lastNode.name,
                        dateCreated: lastNode.date_created,
                        property: lastNode.property
                    };
                }
                else {
                    // Return an error object
                    return {
                        nodeId: -1,
                        parent: -1,
                        name: "Error: Invalid node path",
                        dateCreated: -1,
                        property: {}
                    };
                }
            }
            catch (err) {
                console.error("Error occurred while finding node from path: ", err);
                throw err;
            }
        });
    }
    // Delete a node
    DeleteNode(nodeInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check for invalid chars
                if (this.NodeHasInvalidChars(nodeInfo)) {
                    return;
                }
                // https://mariadb.com/kb/en/recursive-common-table-expressions-overview/
                // This will recursively search for nodes that are parented to the node we want to delete from the tree
                // It starts from the node we want to delete and works downwards(nl = nodeList, cn = currentNode)
                const recursivePathSearch = `
            WITH RECURSIVE nodes AS(
                SELECT * FROM node_tree
                WHERE node_id = ?
                UNION ALL
                SELECT nl.*
                FROM node_tree AS nl, nodes AS cn
                WHERE nl.parent = cn.node_id
            )
            SELECT node_id FROM nodes;`;
                // This will delete all the found node ids from the recursive function due to MariaDB restrictions
                var returnValue = yield this.Query(recursivePathSearch, [nodeInfo.nodeId]);
                if (returnValue && returnValue.length > 0) {
                    var nodeIdArray = new Array(returnValue.length);
                    for (let i = 0; i < returnValue.length; i++) {
                        nodeIdArray[i] = returnValue[i].node_id;
                    }
                    // Delete all nodes that match
                    yield this.Query('DELETE FROM node_tree WHERE node_id IN (?)', [nodeIdArray]);
                }
            }
            catch (err) {
                console.error("Error occurred during node deletion: ", err);
                throw err;
            }
        });
    }
    // Create a pre-seeded database
    preseedDB() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ResetTable();
            const nodeInfo = { "nodeId": -1, "parent": -1, "name": "Rocket", "dateCreated": -1, "property": { "Height": 18.000, "Mass": 12000.000 } };
            const nodeInfo2 = { "nodeId": -1, "parent": 1, "name": "Stage 1", "dateCreated": -1, "property": {} };
            const nodeInfo3 = { "nodeId": -1, "parent": 1, "name": "Stage 2", "dateCreated": -1, "property": {} };
            const nodeInfo4 = { "nodeId": -1, "parent": 2, "name": "Engine1", "dateCreated": -1, "property": { "Thrust": 9.493, "ISP": 12.156 } };
            const nodeInfo5 = { "nodeId": -1, "parent": 2, "name": "Engine2", "dateCreated": -1, "property": { "Thrust": 9.413, "ISP": 11.632 } };
            const nodeInfo6 = { "nodeId": -1, "parent": 2, "name": "Engine3", "dateCreated": -1, "property": { "Thrust": 9.899, "ISP": 12.551 } };
            const nodeInfo7 = { "nodeId": -1, "parent": 3, "name": "Engine1", "dateCreated": -1, "property": { "Thrust": 1.622, "ISP": 15.110 } };
            yield this.CreateNewNode(nodeInfo);
            yield this.CreateNewNode(nodeInfo2);
            yield this.CreateNewNode(nodeInfo3);
            yield this.CreateNewNode(nodeInfo4);
            yield this.CreateNewNode(nodeInfo5);
            yield this.CreateNewNode(nodeInfo6);
            yield this.CreateNewNode(nodeInfo7);
            return;
        });
    }
    ResetTable() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.Query(`TRUNCATE TABLE node_tree;`, []);
            }
            catch (err) {
                console.error("Error occurred during node deletion: ", err);
                throw err;
            }
        });
    }
    UpdateNode(nodeInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check for invalid chars
                if (this.NodeHasInvalidChars(nodeInfo)) {
                    return;
                }
                // Change the properties of the node
                yield this.Query('UPDATE node_tree SET parent = ?, name = ?, property = ? WHERE node_id = (?)', [nodeInfo.parent, nodeInfo.name, nodeInfo.property, nodeInfo.nodeId]);
            }
            catch (err) {
                console.error("Error occurred while attempting to change node: ", err);
                throw err;
            }
        });
    }
    GetPossiblePaths(nodePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // We want root paths
                if (nodePath == '/') {
                    // Find all root nodes
                    const query = `SELECT * FROM node_tree WHERE parent = -1`;
                    return yield this.Query(query, []);
                }
                else {
                    // Get our node
                    let node = yield this.GetNodeFromPath(nodePath);
                    if (node.nodeId == -1) {
                        console.error("Error occurred while attempting to bet possible paths");
                        return [];
                    }
                    // Find children of our node
                    const query = `SELECT * FROM node_tree WHERE parent = ?`;
                    return yield this.Query(query, [node.nodeId]);
                }
            }
            catch (err) {
                console.error("Error occurred while attempting to change node: ", err);
                throw err;
            }
        });
    }
    GetNodeSubtree(nodeInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!nodeInfo) {
                    return [];
                }
                // Check for invalid chars
                if (this.NodeHasInvalidChars(nodeInfo)) {
                    return [];
                }
                // Read every the value of every node in the path
                // https://mariadb.com/kb/en/recursive-common-table-expressions-overview/
                // This will recursively search in the database for our node and then return it's and all it's parents data
                // (nl = nodeList, cn = currentNode)
                const recursiveTreeSearch = `
                WITH RECURSIVE nodes AS(
                    SELECT * FROM node_tree
                    WHERE node_id = ?
                    UNION ALL
                    SELECT nl.*
                    FROM node_tree AS nl, nodes as cn
                    WHERE (cn.parent = nl.node_id)
                )
                SELECT * FROM nodes;`;
                return yield this.Query(recursiveTreeSearch, [nodeInfo.nodeId]);
            }
            catch (err) {
                console.error("Error occurred while attempting to get node subtree: ", err);
                throw err;
            }
        });
    }
    Query(query, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.dbConnection) {
                    throw new Error("Database connection not initialized.");
                }
                return yield this.dbConnection.query(query, args);
            }
            catch (err) {
                console.error("Error occurred during database query: ", err);
                throw err;
            }
        });
    }
    StringHasInvalidChars(nodeString) {
        // Test each value in our string for possible injections
        if (this.sqlInjectionPattern.test(nodeString)) {
            return true;
        }
        return false;
    }
    NodeHasInvalidChars(nodeInfo) {
        // Test each value in our nodeInfo for possible injections
        if (this.sqlInjectionPattern.test(nodeInfo.name)) {
            return true;
        }
        for (const [key, value] of Object.entries(nodeInfo.property)) {
            if (typeof value === "string") {
                if (this.sqlInjectionPattern.test(value)) {
                    console.log("Error: found invalid sql query section: ", value);
                    return true;
                }
            }
        }
        return false;
    }
}
exports.DatabaseController = DatabaseController;
