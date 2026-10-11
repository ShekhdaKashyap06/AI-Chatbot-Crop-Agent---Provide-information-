/* =====================================================
   CONFIGURATION
===================================================== */

const API_URL = "http://127.0.0.1:8000/chat";


/* =====================================================
   ELEMENTS
===================================================== */

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");

const newChatBtn = document.getElementById("newChatBtn");
const clearBtn = document.getElementById("clearBtn");

const themeBtn = document.getElementById("themeBtn");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const voiceBtn = document.getElementById("voiceBtn");


/* =====================================================
   CHAT HISTORY
===================================================== */

let chatHistory = [];
let sessionId = null;


/* =====================================================
   SEND MESSAGE
===================================================== */

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) {
        return;
    }


    // Hide welcome screen

    welcome.style.display = "none";


    // Add user message

    addMessage(
        message,
        "user"
    );


    // Clear input

    messageInput.value = "";

    autoResize();


    // Disable send button

    sendBtn.disabled = true;


    // Show typing

    const typingElement = showTyping();


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },


            body: JSON.stringify({
                message: message,
                session_id: sessionId
            })

        });


        // Remove typing

        typingElement.remove();


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const data = await response.json();
        sessionId = data.session_id;


        if (!data.success) {

            throw new Error(
                data.answer || "Something went wrong."
            );

        }


        // Add AI response

        addMessage(
            data.answer,
            "bot"
        );


        // Save history

        chatHistory.push({
            user: message,
            assistant: data.answer
        });


    } catch (error) {

        typingElement.remove();


        addMessage(
            "Sorry, I could not connect to the Agriculture AI server. Please make sure your FastAPI backend is running.",
            "bot",
            true
        );

        console.error("Chat Error:", error);

    }


    sendBtn.disabled = false;

    messageInput.focus();
}


/* =====================================================
   ADD MESSAGE
===================================================== */

function addMessage(text, sender, isError = false) {

    const message = document.createElement("div");

    message.className =
        `message ${sender}-message`;


    const avatar = document.createElement("div");

    avatar.className =
        `message-avatar ${
            sender === "bot"
                ? "bot-avatar"
                : "user-avatar"
        }`;

    avatar.textContent =
        sender === "bot"
            ? "🌱"
            : "👨‍🌾";


    const content = document.createElement("div");

    content.className = "message-content";


    const name = document.createElement("div");

    name.className = "message-name";

    name.textContent =
        sender === "bot"
            ? "AgriAssist"
            : "You";


    const bubble = document.createElement("div");

    bubble.className = "message-bubble";

    if (isError) {

        bubble.style.color = "#dc2626";
    }


    // Bot answers: show **bold**, *italic*, `code`, headings and bullets properly.
    // User messages and errors stay plain text.

    if (sender === "bot" && !isError) {

        bubble.innerHTML = formatText(text);

    } else {

        bubble.textContent = text;

    }


    content.appendChild(name);

    content.appendChild(bubble);


    // Copy button for AI responses

    if (sender === "bot") {

        const copyButton = document.createElement("button");

        copyButton.className = "copy-btn";

        copyButton.textContent = "📋 Copy";

        copyButton.addEventListener(
            "click",
            () => copyText(text, copyButton)
        );

        content.appendChild(copyButton);
    }


    message.appendChild(avatar);

    message.appendChild(content);

    messages.appendChild(message);


    scrollToBottom();
}


/* =====================================================
   FORMAT BOT TEXT  (markdown -> HTML)
===================================================== */

function formatText(text) {

    // Escape HTML first so the answer can never inject code

    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    return html
        .replace(/^#{1,6}[ \t]+(.+)$/gm, "<strong>$1</strong>")      // # Heading
        .replace(/^([ \t]*)[-*][ \t]+/gm, "$1• ")                    // - item / * item
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")              // **bold**
        .replace(/__(.+?)__/g, "<strong>$1</strong>")                  // __bold__
        .replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, "$1<em>$2</em>") // *italic*
        .replace(/`([^`\n]+)`/g, "<code>$1</code>");                  // `code`
}


/* =====================================================
   TYPING INDICATOR
===================================================== */

function showTyping() {

    const message = document.createElement("div");

    message.className = "message bot-message";


    const avatar = document.createElement("div");

    avatar.className =
        "message-avatar bot-avatar";

    avatar.textContent = "🌱";


    const content = document.createElement("div");

    content.className = "message-content";


    const name = document.createElement("div");

    name.className = "message-name";

    name.textContent = "AgriAssist";


    const typing = document.createElement("div");

    typing.className = "typing";


    typing.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;


    content.appendChild(name);

    content.appendChild(typing);

    message.appendChild(avatar);

    message.appendChild(content);

    messages.appendChild(message);


    scrollToBottom();


    return message;
}


/* =====================================================
   COPY TEXT
===================================================== */

async function copyText(text, button) {

    try {

        await navigator.clipboard.writeText(text);

        const original =
            button.textContent;

        button.textContent = "✓ Copied";

        setTimeout(() => {

            button.textContent = original;

        }, 1500);

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );

    }
}


/* =====================================================
   SCROLL
===================================================== */

function scrollToBottom() {

    const container =
        document.getElementById("chatContainer");

    setTimeout(() => {

        container.scrollTop =
            container.scrollHeight;

    }, 50);
}


/* =====================================================
   ENTER KEY
===================================================== */

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }

    }
);


/* =====================================================
   SEND BUTTON
===================================================== */

sendBtn.addEventListener(
    "click",
    sendMessage
);


/* =====================================================
   AUTO RESIZE TEXTAREA
===================================================== */

messageInput.addEventListener(
    "input",
    autoResize
);


function autoResize() {

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            130
        ) + "px";
}


/* =====================================================
   SUGGESTION BUTTONS
===================================================== */

document
    .querySelectorAll(
        ".suggestion, .topic-btn"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const question =
                    button.dataset.question;

                messageInput.value =
                    question;

                autoResize();

                messageInput.focus();

            }
        );

    });


/* =====================================================
   NEW CHAT
===================================================== */

newChatBtn.addEventListener(
    "click",
    newChat
);

clearBtn.addEventListener(
    "click",
    newChat
);


function newChat() {

    messages.innerHTML = "";

    chatHistory = [];
    sessionId = null;

    welcome.style.display = "block";

    messageInput.value = "";

    autoResize();

    messageInput.focus();

    closeSidebar();
}


/* =====================================================
   DARK / LIGHT MODE
===================================================== */

themeBtn.addEventListener(
    "click",
    toggleTheme
);


function toggleTheme() {

    document.body.classList.toggle("dark");

    const dark =
        document.body.classList.contains("dark");


    themeBtn.textContent =
        dark ? "☀️" : "🌙";


    localStorage.setItem(
        "agri-theme",
        dark ? "dark" : "light"
    );
}


/* Load saved theme */

const savedTheme =
    localStorage.getItem("agri-theme");


if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";
}


/* =====================================================
   MOBILE SIDEBAR
===================================================== */

menuBtn.addEventListener(
    "click",
    openSidebar
);


overlay.addEventListener(
    "click",
    closeSidebar
);


function openSidebar() {

    sidebar.classList.add("open");

    overlay.classList.add("active");
}


function closeSidebar() {

    sidebar.classList.remove("open");

    overlay.classList.remove("active");
}


/* =====================================================
   VOICE INPUT
===================================================== */

let recognition = null;

let isRecording = false;


if (
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    recognition =
        new SpeechRecognition();


    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "en-IN";


    recognition.onstart = function() {

        isRecording = true;

        voiceBtn.classList.add("recording");

        voiceBtn.textContent = "⏹️";
    };


    recognition.onresult = function(event) {

        const transcript =
            event.results[0][0].transcript;

        messageInput.value =
            transcript;

        autoResize();

        messageInput.focus();
    };


    recognition.onerror = function(event) {

        console.error(
            "Voice error:",
            event.error
        );

        stopRecording();
    };


    recognition.onend = function() {

        stopRecording();
    };


    voiceBtn.addEventListener(
        "click",
        function() {

            if (isRecording) {

                recognition.stop();

            } else {

                recognition.start();

            }

        }
    );

} else {

    voiceBtn.style.display = "none";
}


/* =====================================================
   STOP RECORDING
===================================================== */

function stopRecording() {

    isRecording = false;

    voiceBtn.classList.remove(
        "recording"
    );

    voiceBtn.textContent = "🎤";
}


/* =====================================================
   INITIAL FOCUS
===================================================== */

messageInput.focus();