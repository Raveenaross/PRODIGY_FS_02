const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;
const mongoURI = 'mongodb://127.0.0.1:27017'; // Adjusted to use IPv4 address

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files like CSS, images, etc.

MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db('employee_db'); // Replace with your database name

    // Handle login form submission
    app.post('/login', (req, res) => {
      const name = req.body.name;
      const password = req.body.psw;

      // For simplicity, assuming hardcoded admin credentials
      if (name === 'Raveena' && password === 'nosecrets123') {
        res.redirect('/admin.html'); // Redirect to admin home page after successful login
      } else {
        res.send('Invalid credentials');
      }
    });

    // Handle employee addition form submission
    app.post('/adduser', (req, res) => {
      const name = req.body.nm;
      const id = req.body.id;
      const phoneNo = req.body.ph;
      const addr = req.body.addr;
      const pro = req.body.pro;
      const wk = req.body.wk === 'on'; // Convert checkbox value to boolean

      const data = {
        Name: name,
        ID: id,
        "Phone No": phoneNo,
        "Email ID": addr,
        Profession: pro,
        Working: wk
      };

      // Insert new employee record into MongoDB
      db.collection('employee_records').insertOne(data, (err, result) => {
        if (err) {
          console.error('Error inserting record:', err);
          res.send('Error inserting record');
        }
        else {
          res.redirect('/viewusers');;
          console.log('Record inserted successfully:', result.insertedId);
          // Redirect to view users page after adding employee
        }
      });
    });

    app.get('/api/viewusers', (req, res) => {
      db.collection('employee_records').find().toArray()
        .then(users => {
          res.json(users);
        })
        .catch(err => {
          console.error('Error fetching users:', err);
          res.status(500).send('Error fetching users');
        });
    });

    app.put('/api/edituser/:id', (req, res) => {
      const userId = req.params.id;
      const updatedUser = req.body;

      // Ensure that the updatedUser object has the necessary fields
      if (!updatedUser || !updatedUser.Name || !updatedUser.ID || !updatedUser['Phone No'] || !updatedUser['Email ID'] || !updatedUser.Profession || !updatedUser.Working) {
        return res.status(400).send('Incomplete user data');
      }

      db.collection('employee_records').updateOne({ ID: userId }, { $set: updatedUser })
        .then(() => {
          res.sendStatus(200); // Assuming the update was successful
        })
        .catch(err => {
          console.error('Error updating user:', err);
          res.status(500).send('Error updating user');
        });
    });

    // Handle delete user route
    app.delete('/api/deleteuser/:id', (req, res) => {
      const userId = req.params.id;
      db.collection('employee_records').deleteOne({ ID: userId })
        .then(() => {
          res.sendStatus(200); // Assuming the deletion was successful
        })
        .catch(err => {
          console.error('Error deleting user:', err);
          res.status(500).send('Error deleting user');
        });
    });

    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/public/login.html');
    });

    app.get('/viewusers', (req, res) => {
      res.sendFile(__dirname + '/public/viewusers.html');
    })

    app.get('/logout', (req, res) => {

      res.redirect('/'); // Redirect to login page or any other page after logout
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });



