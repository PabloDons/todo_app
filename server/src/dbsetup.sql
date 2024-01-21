CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) PRIMARY KEY,
  `key` CHAR(32)
);

CREATE TABLE IF NOT EXISTS `todo_item` (
  `user` CHAR(36),
  `list_order` INT,
  `value` TEXT,
  PRIMARY KEY (`user`, `list_order`)
);

CREATE TABLE IF NOT EXISTS `session` (
  `token` CHAR(32) PRIMARY KEY,
  `user` CHAR(36),
  `expiry` TIMESTAMP
);
