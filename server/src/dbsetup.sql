CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) PRIMARY KEY,
  `key` CHAR(32)
);

CREATE TABLE IF NOT EXISTS `project` (
  `id` CHAR(36) PRIMARY KEY,
  `name` TEXT
);

CREATE TABLE IF NOT EXISTS `user_project` (
  `user` CHAR(36),
  `project` CHAR(36),
  PRIMARY KEY (`user`, `project`)
);

CREATE TABLE IF NOT EXISTS `todo_list` (
  `id` CHAR(36) PRIMARY KEY,
  `name` TEXT,
  `project` CHAR(36)
);

CREATE TABLE IF NOT EXISTS `todo_item` (
  `todo_list` CHAR(36),
  `list_order` INT,
  `value` TEXT,
  `checked` BOOLEAN,
  PRIMARY KEY (`todo_list`, `list_order`)
);

CREATE TABLE IF NOT EXISTS `session` (
  `token` CHAR(32) PRIMARY KEY,
  `user` CHAR(36),
  `expiry` TIMESTAMP
);
