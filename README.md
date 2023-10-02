### Developer Notes
Please modify `config-example.json` to your needs (located in /src)

The database used was MariaDB with the following table in node_tree
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

#### Features

Notes:
- node_id to identify nodes due to possible duplicate names
- parent to be able to easily identify who owns what node
- date_created to be able to get the time this node was made

