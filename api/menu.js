const express = require('express');
const menusRouter = express.Router();

const bodyParser = require('body-parser');
menusRouter.use(bodyParser.json());

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menuItems.js');

menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menuRow) => {
    if (error) {
      next(error);
    } else if (menuRow) {
      req.menu = menuRow;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu',
    (error, menu) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({menus: menu});
      }
    });
});

menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const values = {
    $title: title
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          res.status(201).json({menu: menu});
        });
    }
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
  const values = {
    $title: title,
    $menuId: req.params.menuId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        (error, menu) => {
          res.status(200).json({menu: menu});
        });
    }
  });
});

menusRouter.delete('/:menuId', (req, res, next) => {
  const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const menuItemsSql = 'SELECT * FROM MenuItem WHERE menu_id = $menuId';
  const values = {$menuId: req.params.menuId};

  db.get(menuSql, values, (error, menu) => {
    if (!menu) {
      return res.sendStatus(404);
    } else {
      db.get(menuItemsSql, values, (error, menuItems) => {
        if (menuItems) {
          return res.sendStatus(400);
        } else {
          const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
          db.run(deleteSql, values, (error) => {
            if (error) {
              next(error);
            } else {
              return res.sendStatus(204);
            }
          });
        }
      });
    }
  });
});

module.exports = menusRouter;
