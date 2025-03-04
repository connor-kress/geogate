# Geogate Server
## Host for Development
To host the FastAPI backend for development, multiple steps have to be taken. First, install the required python dependencies with the below command.
```bash
$ cd server
$ pip install -r requirements.txt
```
**Note:** You may have to use `pip3` instead of `pip` depending on your system.

Next, set up the database following the instructions in the [PostgreSQL section](#setting-up-postgresql).

Then run the server with `uvicorn`, which was previously installed, from the command line in the `server` directory.
```bash
$ uvicorn main:app --reload
```

## Setting up PostgreSQL
### Installing PostgreSQL and Extensions
To set up the database, you must first install the PostgreSQL and PostGIS packages on your system:
```bash
$ sudo apt install postgresql
$ sudo apt install postgis
```
**Note:** `apt` is the Debian package manager used as example, you must use your system's appropriate package manager (e.g. `brew` for MacOS, also omit the `sudo` for MacOS).

### Creating Geogate Database
You then must start the `postgresql` service. For systemd users, run the command:
```bash
$ sudo systemctl start postgresql
```
At this point, create a PostgreSQL user (preferably matching your Unix username) to be the owner of the database.

Next, open `psql` as the `postgres` superuser.
```bash
$ psql -U postgres
```
You can then add the `postgis` extension (might be unnecessary) and create a database for Geogate owned by your PostgreSQL user.
```sql
CREATE EXTENSION postgis;
CREATE DATABASE geogate OWNER <your-user>;
```

### Bootstrapping Database Schema
You can then bootstrap the database schema still as the `postgres` superuser. You can enter the database if you are still in the `psql` shell by running
```sql
\c geogate
```
or, by creating a new `psql` shell in the database with
```bash
$ psql -U <your-user> -d geogate
```
Next, bootstrap the database by executing the `schema.sql` file.
```sql
\ir ./server/db/schema.sql
```
**Note:** This will not work unless you are running `psql` as the `postgres` superuser.

### Granting User Permissions
Then, still as the superuser, grant the appropriate permissions to your user (as well as set the default permissions for any future schema alterations).
```sql
GRANT USAGE ON SCHEMA public TO <your-user>;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO <your-user>;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO <your-user>;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO <your-user>;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO <your-user>;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO <your-user>;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO <your-user>;
```
**Note:** This must be done WITHIN the `geogate` database; otherwise, it will not grant the correct permissions.

## Configuring Server
### PostgreSQL server config
In the server directory, you will have to create a `.env` file in the following format to configure the server for your machine's environment.
```dotenv
DB_HOST=localhost # running on local machine
DB_PORT=5432 # default Postgres port
DB_NAME=geogate
DB_USER=<your-user>
DB_PASSWORD=<your-password>
```
**Note:** This file contains secrets and should NEVER be shared. Ensure that it is in the `.gitignore` file before pushing to any public repositories (like Github).
