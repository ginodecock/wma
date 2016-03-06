CREATE TABLE IF NOT EXISTS wma.user (
	chipId VARCHAR(50) NOT NULL PRIMARY KEY,
	email VARCHAR(50),
	firstName VARCHAR (50),
	lastName VARCHAR (50)
);


CREATE TABLE IF NOT EXISTS wma.values (
	chipId VARCHAR(50) NOT NULL,
	value1 DOUBLE NOT NULL,
	value2 DOUBLE NOT NULL,
	value3 DOUBLE NOT NULL,
	created TIMESTAMP NOT NULL,
	id int PRIMARY KEY AUTO_INCREMENT,
	FOREIGN KEY (chipId) REFERENCES wma.user(chipId) ON UPDATE CASCADE ON DELETE RESTRICT
);