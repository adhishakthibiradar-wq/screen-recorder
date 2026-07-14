// ===============================
// Get Elements
// ===============================
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");

const preview = document.getElementById("preview");
const downloadLink = document.getElementById("downloadLink");
const status = document.getElementById("status");
const timer = document.getElementById("timer");

// ===============================
// Variables
// ===============================
let screenStream;
let micStream;
let combinedStream;

let mediaRecorder;
let recordedChunks = [];

let seconds = 0;
let timerInterval;

// ===============================
// Start Recording
// ===============================
function startTimer() {

    timerInterval = setInterval(() => {

        seconds++;

        const mins = String(Math.floor(seconds / 60)).padStart(2,"0");
        const secs = String(seconds % 60).padStart(2,"0");

        timer.textContent = `${mins}:${secs}`;

    },1000);

}

function stopTimer(){

    clearInterval(timerInterval);

}
function stopRecording() {

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }

    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
    }

    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
    }

    stopTimer();
    seconds = 0;

    status.textContent = "⚫ Ready";
    timer.textContent = "00:00";

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    stopBtn.disabled = true;

}

startBtn.addEventListener("click", async () => {
    try {

        // Capture Screen
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });

        // Capture Microphone
        micStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        // Combine Screen + Microphone
        combinedStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...micStream.getAudioTracks()
        ]);

        // Auto Stop When Screen Sharing Ends
        screenStream.getVideoTracks()[0].addEventListener("ended", () => {
            stopRecording();
        });

        // Live Preview
        preview.srcObject = combinedStream;
        preview.muted = true;
        preview.play();

        // Create MediaRecorder
        mediaRecorder = new MediaRecorder(combinedStream);

        // Clear previous recording
        recordedChunks = [];

        // Save recorded chunks
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        // When recording stops
        mediaRecorder.onstop = () => {

            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            });

            const videoURL = URL.createObjectURL(blob);

            // Show Recorded Video
            preview.srcObject = null;
            preview.src = videoURL;
            preview.controls = true;
            preview.muted = false;

            // Download Link
            downloadLink.href = videoURL;
            downloadLink.download = "screen-recording.webm";
            downloadLink.style.display = "block";
            downloadLink.textContent = "Download Recording";
        };

        // Start Recording
        mediaRecorder.start();
        startTimer();
        status.textContent = "🔴 Recording";

        // Button States
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resumeBtn.disabled = true;
        stopBtn.disabled = false;

        console.log("Recording Started");

    } catch (error) {
        console.error("Error:", error);
    }
});

// ===============================
// Pause Recording
// ===============================
pauseBtn.addEventListener("click", () => {

    if (mediaRecorder && mediaRecorder.state === "recording") {

        mediaRecorder.pause();

        stopTimer();
    status.textContent = "🟡 Paused";

        pauseBtn.disabled = true;
        resumeBtn.disabled = false;

        console.log("Recording Paused");
    }

});

// ===============================
// Resume Recording
// ===============================
resumeBtn.addEventListener("click", () => {

    if (mediaRecorder && mediaRecorder.state === "paused") {

        mediaRecorder.resume();
        startTimer();
status.textContent = "🔴 Recording";

        pauseBtn.disabled = false;
        resumeBtn.disabled = true;

        console.log("Recording Resumed");
    }

});

// ===============================
// Stop Recording
// ===============================
// ===============================
// Stop Recording
// ===============================
stopBtn.addEventListener("click", () => {

    stopRecording();

    console.log("Recording Stopped");

});