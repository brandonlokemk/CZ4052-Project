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
db.on('error', console.error.bind(console, 'Mongo Atlas connection error:'));
db.once('open', () => {
  console.log('Connected to Mongo Atlas');
});

// Define a schema for your data (assuming a simple text model)
const textSchema = new mongoose.Schema({
  // user: String //To be implemented when MSAL is ready
  conversation: String,
});

// Define a model based on the schema
const ConversationModel = mongoose.model('Records', textSchema);

// Define a schema for your data (assuming a simple text model) 
const promptSchema = new mongoose.Schema({
  // user: String //To be implemented when MSAL is ready
  prompt: String,
});

// Define a model based on the schema
const PromptModel = mongoose.model('Prompts', promptSchema);

// Define a route to handle incoming text and save it to the database
app.post('/save-conversation', async (req, res) => {
  try {
    const { _id, content } = req.body;
    console.log('Received data:', { _id, content });

    if (!_id || _id =='') {
      // If _id is not provided, it's the initial call for a new conversation
      const newText = new ConversationModel({ conversation: content });
      const savedText = await newText.save();
      res.status(200).json({ message: 'Conversation saved successfully', _id: savedText._id });
    } else {
      // If _id is provided, find the existing conversation and update the messages
      await ConversationModel.findOneAndUpdate({ _id }, { conversation: content });
      res.status(200).json({ message: 'Conversation updated successfully', _id });
    }
  } catch (error) {
    console.error('Error saving/updating conversation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route to handle incoming text and save it to the database
app.post('/save-prompt', async (req, res) => {
  try {
    const { _id, content } = req.body;
    console.log('Received data:', { _id, content });

    if (!_id || _id =='') {
      // If _id is not provided, it's the initial call for a new conversation
      const newText = new PromptModel({ prompt: content });
      const savedText = await newText.save();
      res.status(200).json({ message: 'Prompt saved successfully', _id: savedText._id });
    } else {
      // If _id is provided, find the existing conversation and update the messages
      await PromptModel.findOneAndUpdate({ _id }, { prompt: content });
      res.status(200).json({ message: 'Prompt updated successfully', _id });
    }
  } catch (error) {
    console.error('Error saving/updating prompt:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express server
app.listen(process.env.PORT, 'localhost', () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
