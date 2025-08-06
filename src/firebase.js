import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, setDoc, doc, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"

// -------------------------------------------
// IMPORTANT: Create your own Firebase project, 
// then configure it in src/firebase-config.js.
// -------------------------------------------
import firebaseConfig from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to generate a unique ID for the call
// This ID will be used to identify the call in the database
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

// These are the STUN servers used for the WebRTC connection
// I'm going to use Google's public STUN servers, which are free to use
// You can use your own STUN servers if you want, but these should work fine for most cases
const servers = {
  iceServers: [
      {
          urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
      }
  ],
  iceCandidatePoolSize: 10,
}

// Create a new RTCPeerConnection
// This will be used to establish the WebRTC connection with the remote peer
let pc = new RTCPeerConnection(servers);

// Video and audio stream sent to WebRTC
// This will be used to send the screen and audio stream to the remote peer, which
// is the client computer.
const stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});


// Function to generate a unique ID for the call
// This ID will be used to identify the call in the database
const uniqueId = generateUniqueId();

// Display the unique ID in the HTML element with id "callId"
// This will allow the user to verify the offer ID, establishing the connection
// between the client and the server.
document.getElementById("callId").textContent = uniqueId;

// Reference to the Firestore document for the call
// This will be used to store the offer and answer descriptions, as well as the ICE candidates
const callDoc = await doc(db, "calls", uniqueId);

// Adding the video and audio tracks to the WebRTC tracks.
stream.getTracks().forEach(track => {
  pc.addTrack(track, stream);
})

// Getting the data stream for input events
// This will be used to send mouse and keyboard events from the client to the server
const dataStream = await pc.createDataChannel("input");

// Listen for messages on the data stream
// This will be used to handle mouse and keyboard events sent from the client
dataStream.onmessage = (e) => {
  const inputInfo = JSON.parse(e.data);
  if (inputInfo.type === "mousemove") {
    window.inputApi.moveMouse(parseFloat(inputInfo.x), parseFloat(inputInfo.y));
  }
  
  if (inputInfo.type === "mousedown") {
    window.inputApi.pressButton(inputInfo.button);
  }

  if (inputInfo.type === "mouseup") {
    window.inputApi.releaseButton(inputInfo.button)
  }

  
  if (inputInfo.type === "keydown") {
    window.inputApi.pressKey(inputInfo.key);
  }

  if (inputInfo.type === "keyup") {
    window.inputApi.releaseKey(inputInfo.key);
  }
}

// Create an offer and set it as the local description
// This will allow the local peer to send the offer to the remote peer, which will then
// set it as the remote description and establish the connection
// The offer will be stored in the Firestore database under the "calls" collection
// Remote peers can catch the offer to get the offer and answer the connection,
// which will then be sent back to us and set as the remote description
const offer = await pc.createOffer();
try {
  pc.setLocalDescription(offer).then( async () => {
    // Set the offer in the Firestore database
      await setDoc(callDoc, offer);
      console.log("Added offer description.")
  });
} catch(e) {
  console.log("Error adding document: ", e)
}

// Create references for offer and answer ICE candidates
const offerCandidateRef = await collection(callDoc, "offerCandidates");
const answerCandidateRef = await collection(callDoc, "answerCandidates");
const mouseRef = await collection(callDoc, "mouse");

// Creating an offer ICE candidate reference
// This will be used to send the ICE candidates to the remote peer, which the remote peer
// will catch and add to its peer connection
pc.onicecandidate = event => {
  if (event.candidate) {
    addDoc(offerCandidateRef, event.candidate.toJSON())
    .then(console.log("Added offer candidate."))
    .catch(e => {console.log("Something happended! Error: ", e)});
  }
}

// Catching the answer from the remote peer, then setting it as the remote description
// This will allow the local peer to receive the answer and establish the connection
const snapshotRef = onSnapshot(callDoc, (snapshot) => {
  const answer = snapshot.data();
  if (!pc.currentRemoteDescription && answer.type === "answer") {
    pc.setRemoteDescription(answer);
    console.log("Answer received");
  }
})

// Catching the offer ICE candidates from the remote peer, then adding them to the peer connection ICE candidates
// This will allow the local peer to establish the connection with the remote peer
const snapshotRemoteCandidate = onSnapshot(answerCandidateRef, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      pc.addIceCandidate(change.doc.data());
      console.log("Added answer ICE candidate: ", change.doc.data());
    }
  })
})