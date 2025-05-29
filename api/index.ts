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

// Remove the app.listen() call. Vercel handles starting the server.
// The PORT constant is also no longer strictly necessary for Vercel deployment,
// but can remain for local testing with `vercel dev`.
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });