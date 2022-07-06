CREATE TABLE users (
	id serial primary key,
	name varchar (255) not null,
	username varchar (255) not null unique,
	password varchar (255) not null
);

CREATE TABLE trips (
	id serial primary key,
	destination varchar (255) not null,
	start_date date not null,
	end_date date not null
	
);

CREATE TABLE users_trips (
	id_user integer references users(id),
	id_trip integer references trips(id)
);