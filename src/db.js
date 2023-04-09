import mongoose from 'mongoose';

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,

  // From mongoose 6.x, it is no longer necessary.
  // useFindAndModify: false,
  // useCreateIndex: true,
});

const db = mongoose.connection;

const handleOpen = () => console.log('✅ Connected to DB');
const handelError = (error) => console.log('❌ DB Error', error);
db.on('error', handelError);
db.once('open', handleOpen);
