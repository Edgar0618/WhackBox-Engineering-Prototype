const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer();
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

// Function to initialize stream handling
function initStreamHandling(stream) {
    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    // Handle new peer connections
    socket.on('user-connected', userId => {
        // Avoid connecting to self
        if (peers[userId]) return;
        const call = connectToNewUser(userId, stream);
        peers[userId] = call;
    });

    // Handle peer disconnections
    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            peers[userId].close();
            delete peers[userId];
        }
    });
}

// Get user media
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);

  myPeer.on('open', id => {
    const ROOM_ID = getRoomId();
    socket.emit('join-room', ROOM_ID, id);
    initStreamHandling(stream);
  });
});

// Function to connect to a new user
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');

  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });

  call.on('close', () => {
    video.remove();
  });

  return call;
}

// Function to add video stream to the grid
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

// Function to get room ID from URL
function getRoomId() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('roomId');
  if (roomId) {
      return roomId;
  } else {
      // Fallback to extracting from pathname or another method
      return window.location.pathname.split('/')[1];
  }
}


// Function to start the game and navigate to the games page
function startGame() {
  const ROOM_ID = getRoomId();
  if (ROOM_ID) {
      socket.emit('start-game', ROOM_ID);
  } else {
      console.error('Room ID is null');
  }
}


// Listener for navigation to the games page
socket.on('navigate-to-games', (roomId) => {
  if (roomId) {
      window.location.href = `/games?roomId=${roomId}`;
  } else {
      console.error('Received null Room ID for navigation');
  }
});