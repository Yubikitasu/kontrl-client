const video = document.querySelector('video')

// Initialize Firebase

// navigator.mediaDevices.getDisplayMedia({
//     audio: false,
//     video: {
//         frameRate: 30
//     }
// }).then(stream => {
//     video.srcObject = stream
//     video.onloadedmetadata = (e) => video.play()
// }).catch(e => console.log(e))

// stopButton.addEventListener('click', () => {
//   video.pause()
// })