import * as dotenv from 'dotenv';
dotenv.config();
export const cluster = process.env.DB_CLUSTER;
export const user = process.env.DB_USER;
export const passwd = process.env.DB_PASSWORD;
export const db = process.env.DB_NAME;
export const secret = process.env.JWT_SECRET;
export const firebaseConfig = {
    apiKey: "AIzaSyBKhgGnNHeMlWisVCZOS8TDPPNO-jszEYY",
    authDomain: "backend-moduleimmune.firebaseapp.com",
    projectId: "backend-moduleimmune",
    storageBucket: "backend-moduleimmune.appspot.com",
    messagingSenderId: "107443281283",
    appId: "1:107443281283:web:05a3bb304e8b3333ebaab6",
    measurementId: "G-X85CXZYSQV"
  };
