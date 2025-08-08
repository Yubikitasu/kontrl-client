// -------------------------------------------
// IMPORTANT: Create your own Firebase project, 
// set your environment variable values with command
// npx dotenvx set <KEY> <VALUE>
// -------------------------------------------
const firebaseConfig = {
  apiKey: window.env.APIKEY,
  authDomain: window.env.AUTHDOMAIN,
  projectId: window.env.PROJECTID,
  storageBucket: window.env.STORAGEBUCKET,
  messagingSenderId: window.env.MESSAGINGSENDERID,
  appId: window.env.APPID,
  measurementId: window.env.MEASUREMENTID,
};

export default firebaseConfig;
