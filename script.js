// ===============================
// Get Elements
// ===============================
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");

const preview = document.getElementById("preview");
const downloadLink = document.getElementById("downloadLink");

// ===============================
// Variables
// ===============================
let screenStream;
let micStream;
let combinedStream;

let mediaRecorder;
let recordedChunks = [];

// ===============================
// Start Recording
// ===============================
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

        pauseBtn.disabled = false;
        resumeBtn.disabled = true;

        console.log("Recording Resumed");
    }

});

// ===============================
// Stop Recording
// ===============================
stopBtn.addEventListener("click", () => {

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }

    // Stop Screen Sharing
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
    }

    // Stop Microphone
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
    }

    // Reset Buttons
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    stopBtn.disabled = true;

    console.log("Recording Stopped");

});