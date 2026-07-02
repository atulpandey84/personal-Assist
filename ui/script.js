const chatDisplay = document.getElementById('chat');
const statusIndicator = document.getElementById('status');
const inputBox = document.getElementById('input-box');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');

// --- Text to Speech (Talking) ---
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.2; // Slightly higher pitch for feminine tone
    utterance.rate = 1.0;

    // Animate mouth while speaking
    const mouth = document.getElementById('mouth');
    utterance.onstart = () => mouth.setAttribute('d', 'M80 110 Q100 130 120 110');
    utterance.onend = () => mouth.setAttribute('d', 'M85 105 Q100 115 115 105');

    window.speechSynthesis.speak(utterance);
}

// --- Speech to Text (Hearing) ---
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        statusIndicator.innerText = "I'm listening...";
        micBtn.classList.add('mic-active');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        inputBox.value = transcript;
        handleResponse(transcript);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        statusIndicator.innerText = "Sorry, I didn't catch that.";
        micBtn.classList.remove('mic-active');
    };

    recognition.onend = () => {
        micBtn.classList.remove('mic-active');
        if (statusIndicator.innerText === "I'm listening...") {
            statusIndicator.innerText = "Ready to help";
        }
    };
}

// --- Interaction Logic ---
async function handleResponse(message) {
    if (!message) return;

    const userMsg = document.createElement('p');
    userMsg.innerHTML = `<strong>You:</strong> ${message}`;
    chatDisplay.appendChild(userMsg);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;

    statusIndicator.innerText = "Thinking...";

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        let responseText = data.final_report || "Task completed.";

        // Display Multi-Agent Discussion/Debate
        const debateBox = document.createElement('div');
        debateBox.className = 'debate-log';
        debateBox.innerHTML = "<strong>Multi-Agent Discussion:</strong><br>";

        if (data.plan) {
            debateBox.innerHTML += `<small><i>Planner: Decomposed into ${data.plan.length} steps.</i></small><br>`;
        }

        data.results.forEach(res => {
            let detail = "";
            if (res.agent === 'ops' && res.security_audit) {
                detail = ` | Security: ${res.security_audit[0]}`;
            }
            debateBox.innerHTML += `<small><i>${res.agent}: Processed successfully.${detail}</i></small><br>`;
        });

        chatDisplay.appendChild(debateBox);

        const assistantMsg = document.createElement('p');
        assistantMsg.innerHTML = `<strong>Assistant:</strong> ${responseText}`;
        chatDisplay.appendChild(assistantMsg);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;

        statusIndicator.innerText = "Ready to help";
        speak(responseText);
    } catch (error) {
        console.error("Error communicating with backend:", error);
        statusIndicator.innerText = "Error connecting to server.";
    }
}

sendBtn.addEventListener('click', () => {
    const msg = inputBox.value;
    inputBox.value = "";
    handleResponse(msg);
});

inputBox.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const msg = inputBox.value;
        inputBox.value = "";
        handleResponse(msg);
    }
});

micBtn.addEventListener('click', () => {
    if (recognition) {
        recognition.start();
    } else {
        alert("Speech recognition is not supported in this browser.");
    }
});
