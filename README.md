### Developer Notes
Please modify `config-example.json` to your needs (located in /src)

Database used was MariaDB with the following table in node_tree
```
node_id INTEGER PRIMARY KEY AUTO_INCREMENT,
parent INTEGER DEFAULT -1,
name TINYTEXT NOT NULL,
date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
property JSON DEFAULT "{}"
```

#### Build and Test

Build
```
$npm install
$npm run build
```

Test
```
$cd text
$npx mocha test.js
```

#### Deviations

Nodes:
- Added node_id to identify nodes due to possible duplicate names
- Added parent to be able to easily identify who owns what node
- Added date_created to be able to get the time this node was made

API endpoints:
- Delete Node
- Path Prediction

#### Backend Development
#### Overview

This challenge will test the following skills:
- NodeJS environment

- Typescript proficiency

- Relational databases

- REST APIs

Allow at least 3 hours to complete

Do not be discouraged if you are unable to complete aspects of the challenge, it is designed to test all levels of ability

#### Rules

- Complete the challenge(s) on your own

- Referencing of online resources is expected

- All code, markup, and assets should be pushed to the provided repository

- You are encouraged to ask us questions at any point

- Note any deviations from the specification

- You may use any supporting library you deem appropriate

#### Instructions

1.  Set up a NodeJS Typescript project

2.  Create a relational database with a schema for the following data structure:

- A rocket (root node) is built from a tree of nodes. Each node has a name. The path of a node can be inferred from the name hierarchy (e.g. _'/root/parent/child'_).

- Each node can have any number of properties. A property is a key value pair, where the key is a string and the value is a decimal number.

3.  Develop a way of interacting with this database in the NodeJS project. You may use an ORM of your own choice

4.  Seed the database with the following structure (entries with values are properties, others are nodes):

- Rocket
  - Height: 18.000
  - Mass: 12000.000
  - Stage1
    - Engine1
      - Thrust: 9.493
      - ISP: 12.156
    - Engine2
      - Thrust: 9.413
      - ISP: 11.632
    - Engine3
      - Thrust: 9.899
      - ISP: 12.551
  - Stage2
    - Engine1
      - Thrust: 1.622
      - ISP: 15.110
 
5.  Expose HTTP endpoints for the following operations:
    1.  Create a node with a specified parent

    2.  Add a property on a specific node

    3.  Return the subtree of nodes with their properties for a provided node path


6.  Create unit tests for endpoint **3** above.
