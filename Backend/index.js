require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Cho phép Express đọc dữ liệu JSON từ request

// Route cơ bản để test
app.get('/', (req, res) => {
  res.json({ message: 'Server Express đang chạy ngon lành!' });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});