const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); // 添加跨域中间件
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/ask', async (req, res) => {
  const question = req.body.question;
  const answer = await askOpenAI(question);
  res.json({ answer: answer });
});

async function askOpenAI(question) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: question}],
  });
  return completion.data.choices[0].message.content;
  
  // const response = await openai.createImage({
  //   prompt: "A cute baby sea otter",
  //   n: 2,
  //   size: "1024x1024",
  // });
  // console.log('response.data', response.data)
  // return response.data
}

app.listen(5500, () => {
  console.log('Server is running on port 5500');
});