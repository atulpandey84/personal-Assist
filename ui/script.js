const chatDisplay = document.getElementById('chat');
const statusIndicator = document.getElementById('status');
const inputBox = document.getElementById('input-box');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');

// --- Text to Speech with Phoneme-Mapped 3D Viseme Lip-Syncing ---
function speak(text) {
    if (!('speechSynthesis' in window)) return;

    // Cancel existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.25; // Warm, natural feminine pitch
    utterance.rate = 1.0;

    // Advanced phoneme to viseme mapping table
    const phonemeMap = {
        'a': 'aa', 'e': 'ee', 'i': 'ih', 'o': 'oh', 'u': 'ou',
        'y': 'ee', 'w': 'ou', 'm': 'ou', 'b': 'ou', 'p': 'ou',
        'f': 'ih', 'v': 'ih', 's': 'ih', 'z': 'ih', 'r': 'oh'
    };

    let words = text.toLowerCase().split(/\s+/);
    let wordIndex = 0;
    let charIndex = 0;
    let visemeInterval = null;

    utterance.onstart = () => {
        if (window.persona3D) {
            window.persona3D.setState('speaking');

            visemeInterval = setInterval(() => {
                if (wordIndex < words.length) {
                    const currentWord = words[wordIndex];
                    const char = currentWord[charIndex] || 'a';
                    const targetViseme = phonemeMap[char] || 'aa';
                    const intensity = 0.4 + Math.random() * 0.5;

                    window.persona3D.setViseme(targetViseme, intensity);

                    charIndex++;
                    if (charIndex >= currentWord.length) {
                        charIndex = 0;
                        wordIndex++;
                    }
                } else {
                    window.persona3D.setViseme('aa', 0.1);
                }
            }, 90);
        }
    };

    utterance.onend = () => {
        if (visemeInterval) clearInterval(visemeInterval);
        if (window.persona3D) {
            window.persona3D.setViseme('aa', 0);
            window.persona3D.setState('ready');
        }
    };

    utterance.onerror = () => {
        if (visemeInterval) clearInterval(visemeInterval);
        if (window.persona3D) {
            window.persona3D.setViseme('aa', 0);
            window.persona3D.setState('ready');
        }
    };

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
        if (window.persona3D) {
            window.persona3D.setState('listening');
        }
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

// --- Interaction Logic & Multi-Agent State Mapping ---
async function handleResponse(message) {
    if (!message) return;

    const userMsg = document.createElement('p');
    userMsg.innerHTML = `<strong>You:</strong> ${message}`;
    chatDisplay.appendChild(userMsg);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;

    statusIndicator.innerText = "Thinking...";
    if (window.persona3D) {
        window.persona3D.setState('thinking');
    }

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        let responseText = data.final_report || "Task completed successfully.";

        // Display Multi-Agent Discussion/Debate
        const debateBox = document.createElement('div');
        debateBox.className = 'debate-log';
        debateBox.innerHTML = "<strong>Multi-Agent Discussion:</strong><br>";

        if (data.plan) {
            debateBox.innerHTML += `<small><i>Planner: Decomposed goal into ${data.plan.length} agent tasks.</i></small><br>`;
        }

        data.results.forEach(res => {
            let detail = "";
            if (res.agent === 'ops' && res.security_audit) {
                detail = ` | Security: ${res.security_audit[0]}`;
            }
            debateBox.innerHTML += `<small><i>${res.agent.toUpperCase()}: Processed execution task.${detail}</i></small><br>`;
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
        if (window.persona3D) {
            window.persona3D.setState('ready');
        }
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
