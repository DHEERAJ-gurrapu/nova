// ==========================================
// NOVA OS
// face.js
// Part 1
// ==========================================

// ----------------------------
// Elements
// ----------------------------

const body = document.body;

const statusText = document.getElementById("status");
const timeText = document.getElementById("time");
const dateText = document.getElementById("date");

// ----------------------------
// UI
// ----------------------------

function setFaceState(state){

    body.className = state;

    if(statusText){

        statusText.textContent = state.toUpperCase();

    }

}

// ----------------------------
// Clock
// ----------------------------

function updateClock(){

    const now = new Date();

    if(timeText){

        timeText.textContent = now.toLocaleTimeString([],{

            hour:"2-digit",
            minute:"2-digit",
            second:"2-digit"

        });

    }

    if(dateText){

        dateText.textContent = now.toLocaleDateString([],{

            weekday:"long",
            month:"long",
            day:"numeric",
            year:"numeric"

        });

    }

}

updateClock();

setInterval(updateClock,1000);

// ----------------------------
// Jarvis Beep
// ----------------------------

const beep = new Audio("sounds/beep.mp3");

function playBeep(){

    beep.currentTime = 0;

    beep.play().catch(()=>{});

}

// ----------------------------
// Speech Recognition
// ----------------------------

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(!SpeechRecognition){

    alert("Please use Google Chrome.");

}

const recognition = new SpeechRecognition();

recognition.lang = "en-US";

recognition.continuous = true;

recognition.interimResults = false;

recognition.maxAlternatives = 1;

// ----------------------------
// Flags
// ----------------------------

let speaking = false;

let listening = false;

// ----------------------------
// Wake Words
// ----------------------------

const wakeWords = [

    "hey nova",

    "nova",

    "hey noah",

    "hey nora"

];

// ----------------------------
// Start Recognition
// ----------------------------

function startListening(){

    if(listening) return;

    try{

        recognition.start();

        listening = true;

    }

    catch{}

}

// ----------------------------
// Stop Recognition
// ----------------------------

function stopListening(){

    if(!listening) return;

    try{

        recognition.stop();

    }

    catch{}

}

// ----------------------------
// Startup
// ----------------------------

window.onload = ()=>{

    updateClock();

    setFaceState("idle");

    const intro =
        new SpeechSynthesisUtterance("Nova online.");

    intro.rate = 0.75;

    intro.pitch = 1;

    intro.onstart = ()=>{

        speaking = true;

        setFaceState("speaking");

    };

    intro.onend = ()=>{

        speaking = false;

        setFaceState("listening");

        startListening();

    };

    speechSynthesis.cancel();

    speechSynthesis.speak(intro);

};

// ----------------------------
// Recognition Started
// ----------------------------

recognition.onstart = ()=>{

    listening = true;

    if(!speaking){

        setFaceState("listening");

    }

};

// ----------------------------
// Recognition Stopped
// ----------------------------

recognition.onend = ()=>{

    listening = false;

    if(speaking) return;

    setTimeout(startListening,250);

};// ==========================================
// NOVA OS
// face.js
// Part 2
// ==========================================

// ----------------------------
// User Spoke
// ----------------------------

recognition.onresult = async (event)=>{

    if(speaking) return;

    const transcript =
        event.results[event.results.length-1][0].transcript
        .trim()
        .toLowerCase();

    console.log("Heard:",transcript);

    // ----------------------------
    // Wake Word Detection
    // ----------------------------

    let question = "";

    let activated = false;

    for(const wake of wakeWords){

        if(transcript.includes(wake)){

            activated = true;

            question = transcript.replace(wake,"").trim();

            break;

        }

    }

    if(!activated){

        return;

    }

    playBeep();

    if(question.length===0){

        return;

    }

    console.log("Question:",question);

    setFaceState("thinking");

    speaking = true;

    stopListening();

    try{

        const response = await fetch("/ask",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                question

            })

        });

        if(!response.ok){

            throw new Error("Server Error");

        }

        const data = await response.json();

        console.log("Nova:",data.answer);

        const utterance =
            new SpeechSynthesisUtterance(data.answer);

        // Voice Settings

        utterance.rate = 0.75;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Keep default browser voice
        // (No forced voice)

        utterance.onstart = ()=>{

            setFaceState("speaking");

        };

        utterance.onend = ()=>{

            speaking = false;

            setFaceState("listening");

            startListening();

        };

        utterance.onerror = ()=>{

            speaking = false;

            setFaceState("idle");

            startListening();

        };

        speechSynthesis.cancel();

        speechSynthesis.speak(utterance);

    }

    catch(err){

        console.error(err);

        speaking = false;

        setFaceState("idle");

        startListening();

    }

};

// ----------------------------
// Errors
// ----------------------------

recognition.onerror = (event)=>{

    console.log("Speech Error:",event.error);

    listening = false;

    if(speaking) return;

    setTimeout(()=>{

        startListening();

    },500);

};

// ----------------------------
// Load Voices
// ----------------------------

speechSynthesis.onvoiceschanged = ()=>{

    speechSynthesis.getVoices();

};