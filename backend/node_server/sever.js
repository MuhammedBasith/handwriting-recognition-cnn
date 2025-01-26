import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 4000;
app.use(cors());


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const genAI = new GoogleGenerativeAI("AIzaSyCaGWltoN8UutS1suo7zSjeZuEeuTsqah8");
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert the image to base64
    const base64Image = req.file.buffer.toString('base64');

    // Send the base64 image to Gemini API
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: req.file.mimetype,
        },
      },
      'extract the text from this image and give me only the text back nothing else',
    ]);

    res.json({ caption: result.response.text() });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
