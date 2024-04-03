require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

app.use(cors());

const connectionString = process.env.MONGO_URI
// Connect to MongoDB Atlas
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check if the connection is successful
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Azure CosmosDB connection error:'));
db.once('open', () => {
  console.log('Connected to Azure CosmosDB (MongoDB)');
});

// Define a schema for your data (assuming a simple text model)
const textSchema = new mongoose.Schema({
    // user: String //To be implemented when MSAL is ready
    conversation: String,
});

// Define a model based on the schema
const TextModel = mongoose.model('Records', textSchema);

// Define a route to handle incoming text and save it to the database
app.post('/save-text', async (req, res) => {
  try {
    const { _id, content } = req.body;

    if (!_id || _id =='') {
      // If _id is not provided, it's the initial call for a new conversation
      const newText = new TextModel({ conversation: content });
      const savedText = await newText.save();
      res.status(200).json({ message: 'Text saved successfully', _id: savedText._id });
    } else {
      // If _id is provided, find the existing conversation and update the messages
      await TextModel.findOneAndUpdate({ _id }, { conversation: content });
      res.status(200).json({ message: 'Text updated successfully', _id });
    }
  } catch (error) {
    console.error('Error saving/updating text:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// // Define a route to handle querying and displaying existing content
// app.get('/get-texts', async (req, res) => {
//   try {
//       // Fetch all documents from the TextModel collection
//       const existingTexts = await TextModel.find({}, 'conversation');

//       // Send the existing texts as a response
//       res.status(200).json(existingTexts);
//   } catch (error) {
//       console.error('Error getting texts:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Define a route to handle wiping the contents of the database
// app.delete('/wipe-database', async (req, res) => {
//   try {
//       // Delete all documents from the TextModel collection
//       await TextModel.deleteMany({});

//       // Send a success message as a response
//       res.status(200).json({ message: 'Database wiped successfully' });
//   } catch (error) {
//       console.error('Error wiping database:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// Start the Express server
app.listen(process.env.PORT, 'localhost', () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});