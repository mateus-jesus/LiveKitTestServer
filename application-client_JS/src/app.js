var APPLICATION_SERVER_URL = "http://127.0.0.1:6080/";
var LIVEKIT_URL = "http://127.0.0.1:7880/";
configureUrls();

const LivekitClient = window.LivekitClient;
var room;

function configureUrls() {
    
    if (!APPLICATION_SERVER_URL) {
        if (window.location.hostname === "localhost") {
            APPLICATION_SERVER_URL = "http://localhost:6080/";
        } else {
            APPLICATION_SERVER_URL = "https://" + window.location.hostname + ":6443/";
        }
    }

    
    if (!LIVEKIT_URL) {
        if (window.location.hostname === "localhost") {
            LIVEKIT_URL = "ws://localhost:7880/";
        } else {
            LIVEKIT_URL = "wss://" + window.location.hostname + ":7443/";
        }
    }
}


async function joinRoom() {
    
    document.getElementById("join-button").disabled = true;
    document.getElementById("join-button").innerText = "Joining...";

    try {
        
        console.log("Pedindo permissão para o microfone...");
        const localTracks = await LivekitClient.createLocalTracks({
            audio: true,
            video: false,
        });
        console.log("Permissão concedida e trilha de áudio criada.");

       
        room = new LivekitClient.Room();

        
        room.on(LivekitClient.RoomEvent.TrackSubscribed, (track, _publication, participant) => {
            addTrack(track, participant.identity);
        });
        room.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
            track.detach();
            document.getElementById(track.sid)?.remove();
            if (track.kind === "video") {
                removeVideoContainer(participant.identity);
            }
        });

        const roomName = document.getElementById("room-name").value;
        const userName = document.getElementById("participant-name").value;
        const token = await getToken(roomName, userName);

        console.log("Conectando à sala...");
        await room.connect(LIVEKIT_URL, token);
        console.log("Conectado com sucesso!");


       

        console.log("Publicando a trilha de áudio...");

        for (const track of localTracks) {
            await room.localParticipant.publishTrack(track);
        }
        console.log("Trilha publicada!");


        document.getElementById("room-title").innerText = roomName;
        document.getElementById("join").hidden = true;
        document.getElementById("room").hidden = false;

    } catch (error) {
        console.error("Houve um erro no processo de entrada na sala:", error);
        alert("Não foi possível entrar na sala. Verifique a permissão do seu microfone e tente novamente.");
        
        if (room && room.state !== 'disconnected') {
            await leaveRoom();
        } else {
            document.getElementById("join-button").disabled = false;
            document.getElementById("join-button").innerText = "Join!";
        }
    }
}



function addTrack(track, participantIdentity, local = false) {
    const element = track.attach();
    element.id = track.sid;


    if (track.kind === "video") {
        const videoContainer = createVideoContainer(participantIdentity, local);
        videoContainer.append(element);
        appendParticipantData(videoContainer, participantIdentity + (local ? " (You)" : ""));
    } else {
        document.getElementById("layout-container").append(element);
    }
}

async function leaveRoom() {

    await room.disconnect();
    removeAllLayoutElements();
    document.getElementById("join").hidden = false;
    document.getElementById("room").hidden = true;
    document.getElementById("join-button").disabled = false;
	document.getElementById("join-button").innerText = "Join!";
}

window.onbeforeunload = () => {
    room?.disconnect();
};

window.onload = generateFormValues;

function generateFormValues() {
    document.getElementById("room-name").value = "Test Room";
    document.getElementById("participant-name").value = "Participant" + Math.floor(Math.random() * 100);
}

function createVideoContainer(participantIdentity, local = false) {
    const videoContainer = document.createElement("div");
    videoContainer.id = `camera-${participantIdentity}`;
    videoContainer.className = "video-container";
    const layoutContainer = document.getElementById("layout-container");

    if (local) {
        layoutContainer.prepend(videoContainer);
    } else {
        layoutContainer.append(videoContainer);
    }

    return videoContainer;
}

function appendParticipantData(videoContainer, participantIdentity) {
    const dataElement = document.createElement("div");
    dataElement.className = "participant-data";
    dataElement.innerHTML = `<p>${participantIdentity}</p>`;
    videoContainer.prepend(dataElement);
}

function removeVideoContainer(participantIdentity) {
    const videoContainer = document.getElementById(`camera-${participantIdentity}`);
    videoContainer?.remove();
}

function removeAllLayoutElements() {
    const layoutElements = document.getElementById("layout-container").children;
    Array.from(layoutElements).forEach((element) => {
        element.remove();
    });
}



async function getToken(roomName, participantName) {


    const tokenEndpoint = APPLICATION_SERVER_URL + "token";

    try {
        const response = await fetch(tokenEndpoint, {

            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                roomName: roomName,
                participantName: participantName,
            }),
        });


        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to get token: Server responded with status ${response.status}. Body: ${errorBody}`);
        }

        const data = await response.json();
        return data.token;

    } catch (error) {
        console.error("Error in getToken:", error);
        throw error;
    }
}