// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, setDoc, doc, onSnapshot, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGGgiJUYXy-LIW6YdQRhDXJYc5CWsq_OE",
  authDomain: "desktop-control-46b64.firebaseapp.com",
  projectId: "desktop-control-46b64",
  storageBucket: "desktop-control-46b64.firebasestorage.app",
  messagingSenderId: "95801441442",
  appId: "1:95801441442:web:2ed1fca0974d50115aabfb",
  measurementId: "G-KTD4WK0YLZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function generateUniqueId() {
  const a = "1234567890".split("");
  let b = "";
  let f = "";
  let g = "";
  let d = 0;
  let e = 0;
  let l = 0;
  for (let c = 0; c <= 4; c++) {
    d = Math.floor(Math.random() * (a.length - 1));
    e = Math.floor(Math.random() * (a.length - 1));
    l = Math.floor(Math.random() * (a.length - 1));
    b += a[d];
    f += a[e];
    g += a[l];
  }
  return b + "-" + f + "-" + g;
}


const servers = {
  iceServers: [
      {
          urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
      }
  ],
  iceCandidatePoolSize: 10,
}

// Global states

let pc = new RTCPeerConnection(servers);

const stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});

const uniqueId = generateUniqueId();

console.log(uniqueId);
document.getElementById("callId").textContent = uniqueId;

const callDoc = await doc(db, "calls", uniqueId);
// const answerDoc = await doc(db, "calls", "answer");

stream.getTracks().forEach(track => {
  pc.addTrack(track, stream);
})

const dataStream = await pc.createDataChannel("input");

// dataStream.onopen = () => {
//   console.log("✅ DataChannel open on client");
//   dataStream.send("Hello from client!");
// };

dataStream.onmessage = (e) => {
  const mousePosition = JSON.parse(e.data);
  window.mouseApi.moveMouse(parseFloat(mousePosition.x), parseFloat(mousePosition.y));
}


const offer = await pc.createOffer();
try {
  pc.setLocalDescription(offer).then( async () => {
      const docRef = await setDoc(callDoc, offer);
      console.log("Added offer description.")
  });
} catch(e) {
  console.log("Error adding document: ", e)
}

const offerCandidateRef = await collection(callDoc, "offerCandidates");
const answerCandidateRef = await collection(callDoc, "answerCandidates");
const mouseRef = await collection(callDoc, "mouse");

pc.onicecandidate = event => {
  if (event.candidate) {
    addDoc(offerCandidateRef, event.candidate.toJSON())
    .then(console.log("Added offer candidate."))
    .catch(e => {console.log("Something happended! Error: ", e)});
  }
}

const snapshotRef = onSnapshot(callDoc, (snapshot) => {
  const answer = snapshot.data();
  if (!pc.currentRemoteDescription && answer.type === "answer") {
    pc.setRemoteDescription(answer);
    console.log("Answer received");
  }
})

const snapshotRemoteCandidate = onSnapshot(answerCandidateRef, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      pc.addIceCandidate(change.doc.data());
      console.log("Added answer ICE candidate: ", change.doc.data());
    }
  })
})

// const snapshotMouse = onSnapshot(mouseRef, (snapshot) => {
//   snapshot.docChanges().forEach((change) => {
//     const mousePositionX = change.doc.data().x;
//     const mousePositionY = change.doc.data().y;
//     window.mouseApi.moveMouse(parseFloat(mousePositionX), parseFloat(mousePositionY));
//     console.log("Moved mouse to position ", mousePositionX, mousePositionY);
//   })
// })
