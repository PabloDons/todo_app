import express from 'express';
import dbapp from './dbapp/index.js'


const PORT = 8052

const app = express();
const router = express.Router()

app.use((req,res,next) => {
      res.append('Access-Control-Allow-Origin', ['*']);
      res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.append('Access-Control-Allow-Headers', 'Content-Type');
      next();
})

app.use(express.json())
app.use("/db", dbapp)
app.use("/", express.static('../client/build'))

app.listen(PORT, () => {
      console.log('server listening on port ' + PORT)
});

