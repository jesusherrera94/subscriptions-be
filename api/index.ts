// api/index.ts
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import userRoutes from '../src/routes/users.routes';


dotenv.config({ path: path.resolve(__dirname, '../.env') });


import '../src/config/firebase'; 

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('User Backend API is running on Vercel!');
});

app.use('/api', userRoutes);


export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}