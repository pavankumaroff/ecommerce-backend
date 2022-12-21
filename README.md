# Setup

Make sure to follow all these steps exactly as explained below. Do not miss any steps or you won't be able to run this application.

To run this project, you need to install the latest version of MongoDB Community Edition first.

https://docs.mongodb.com/manual/installation/

Once you install MongoDB, make sure it's running.

### Environment Variables

In your root directory create .env file, and set all environment variables as i mention in .env.sample file.

### Install the Dependencies

Next, from the project folder, install the dependencies:

    npm install

### Start the server

    npm start

This will launch the Node server on port 9000. If that port is busy, you can set a different port in .env file.

Open up your browser and head over to:

http://localhost:9000/api/products

You should see the empty array. That confirms that you have set up everything successfully.
