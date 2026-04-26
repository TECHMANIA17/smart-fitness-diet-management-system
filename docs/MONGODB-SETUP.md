# MongoDB Atlas Connection Setup

1. Create a MongoDB Atlas account and log in.
2. Create a new project.
3. Create a free shared cluster.
4. Go to `Database Access` and create a database user with a username and password.
5. Go to `Network Access` and add your IP address, or allow access from anywhere for testing with `0.0.0.0/0`.
6. Open the cluster and click `Connect`.
7. Choose `Drivers`.
8. Copy the MongoDB connection string.
9. Replace `<username>` and `<password>` with your database username and password.
10. Paste the final string in `.env` as `MONGODB_URI`.
11. Set `MONGODB_DB_NAME=smart_fitness_diet_management`.
12. Save the file and restart the Node.js server.
