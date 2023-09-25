import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import FormData from 'form-data';
import multer from 'multer';
import crypto from 'crypto';
import { check, validationResult } from 'express-validator';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

const DOC_SMITH_EMAIL = process.env.DOC_SMITH_EMAIL || "";
const DOC_SMITH_PASSWORD = process.env.DOC_SMITH_PASSWORD || "";
const DOC_SMITH_SOFTWARE_ID = process.env.DOC_SMITH_SOFTWARE_ID || "";
const DOC_SMITH_URL = process.env.DOC_SMITH_URL;


async function getToken(email: string, password: string, softwareID: string): Promise < string > {
  const hashedPW = crypto.createHash('sha512').update(password).digest('hex');
  const uri = `${DOC_SMITH_URL}/token`; 
  const postData = {
    email: email,
    password: hashedPW,
    softwareID: softwareID,
  };

  try {
    const response = await axios.post(uri, postData);
    const data = response.data;

    if (data.response && data.response.status === 'ERROR') {
      throw new Error('Error occurred: ' + data.response.errormessage);
    } else {
      return data.token;
    }
  } catch (error: any) {
    throw new Error('Error occurred during request: ' + error.message);
  }
};

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE, Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("cache-control", "no-store");
  res.header("pragma", "no-cache");
  res.header("X-Content-Type-Options", "no-sniff");
  next();
});

app.post('/upload', [upload.single('pdf'),check('recipientAddress').notEmpty()],
  async (req: any, res: any) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { buffer } = req.file;
      const recipientAddress = req.body.recipientAddress;
      const token = await getToken(DOC_SMITH_EMAIL, DOC_SMITH_PASSWORD, DOC_SMITH_SOFTWARE_ID) + ':';
      const messageData = {
        title: req.body.title,
        rtnOrganization: req.body.rtnOrganization || undefined,        
        rtnAddress1: req.body.rtnAddress1 || undefined,
        rtnAddress2: req.body.rtnAddress2 || undefined,
        rtnCity: req.body.rtnCity || undefined,
        rtnState: req.body.rtnState || undefined,
        rtnZip: req.body.rtnZip || undefined
      };
      const messageResponse = await axios.post(`${DOC_SMITH_URL}/messages/new`, messageData, {
        headers: {
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
        },
      });
      const messageID = messageResponse.data.messageID;
      const form = new FormData();
      form.append('file', buffer, 'uploaded.pdf' );
      const uploadResponse = await axios.post(`${DOC_SMITH_URL}/messages/${messageID}/upload`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
        },
      });
      const messageStatus = await axios.post(`${DOC_SMITH_URL}/messages/${messageID}/send`, null, {
        headers: {
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
        },
      });
      if (messageStatus.status === 200) {
        return res.status(200).json({ message: 'Letter sent successfully' });
      }

      return res.status(500).json({ message: 'Failed to send letter' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

app.get('/sent-letters', async (req, res) => {
  const token = await getToken(DOC_SMITH_EMAIL, DOC_SMITH_PASSWORD, DOC_SMITH_SOFTWARE_ID) + ':';
  
  const sentLetters = await axios.get(`${DOC_SMITH_URL}/messages/sent`, {
    headers: {
      Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
    },
  });
  res.status(200).send(sentLetters.data);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
