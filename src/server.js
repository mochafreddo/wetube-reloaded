import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import flash from 'express-flash';
import MongoStore from 'connect-mongo';
import rootRouter from './routers/rootRouter';
import videoRouter from './routers/videoRouter';
import userRouter from './routers/userRouter';
import apiRouter from './routers/apiRouter';
import { localsMiddleware } from './middlewares';

const app = express();
const logger = morgan('dev');

app.set('view engine', 'pug');
app.set('views', `${process.cwd()}/src/views`);
app.use(logger);

// express.urlencoded() is a method inbuilt in express to recognize the incoming Request Object as
// strings or arrays.
app.use(express.urlencoded({ extended: true }));

// express.json() is a method inbuilt in express to recognize the incoming Request Object as a JSON
//  Object.
app.use(express.json());

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
      dbName: process.env.DB_NAME,
    }),
  }),
);
app.use(flash());
app.use(localsMiddleware);

// 크로스 오리진 정책: 코드가 크로스 오리진 환경에서 실행되는 경우, SharedArrayBuffer의 사용이 제한될 수 있습니다.
// 크로스 오리진 요청에 대한 액세스를 허용하는 CORS (Cross-Origin Resource Sharing) 정책을 설정해야 할 수도 있습니다.
app.use((req, res, next) => {
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use('/uploads', express.static('uploads'));
app.use('/static', express.static('assets'));
app.use('/', rootRouter);
app.use('/videos', videoRouter);
app.use('/users', userRouter);
app.use('/api', apiRouter);

export default app;
