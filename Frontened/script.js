const words = [
    "Web Developer",
    "Competitive Programmer",
    "Problem Solver",
    "AI Enthusiast"
];

let i = 0;
let j = 0;
let currentWord = "";
let isDeleting = false;

function type() {
    currentWord = words[i];

    if (!isDeleting) {
        document.getElementById("text").innerHTML =
            currentWord.substring(0, j++);

        if (j > currentWord.length) {
            isDeleting = true;
            setTimeout(type, 1000);
            return;
        }
    } else {
        document.getElementById("text").innerHTML =
            currentWord.substring(0, j--);

        if (j < 0) {
            isDeleting = false;
            i++;
            if (i === words.length) i = 0;
        }
    }

    setTimeout(type, isDeleting ? 70 : 120);
}

type();


async function sendMessage() {
    let input = document.getElementById("userInput");
    let chatBox = document.getElementById("chatBox");

    let userText = input.value;
    if (userText === "") return;

    // user message
    let userMsg = document.createElement("div");
    userMsg.classList.add("user-msg");
    userMsg.innerText = userText;
    chatBox.appendChild(userMsg);

    input.value = "";

    // bot typing animation
    let botMsg = document.createElement("div");
    botMsg.classList.add("bot-msg");
    botMsg.innerHTML = `
        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatBox.appendChild(botMsg);

    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // ✅ LIVE BACKEND URL (IMPORTANT FIX)
        let response = await fetch("https://devsphere-8dz9.onrender.com/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: userText })
        });

        let data = await response.json();

        // show reply
        botMsg.innerText = data.reply;

    } catch (error) {
        botMsg.innerText = "Error connecting to server ❌";
        console.log(error);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}


// theme toggle
const btn = document.getElementById("themeToggle");

btn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        btn.innerHTML = "☀️";
    } else {
        btn.innerHTML = "🌙";
    }
});
