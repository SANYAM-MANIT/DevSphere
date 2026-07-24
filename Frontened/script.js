/* ==========================================================================
   DEVSPHERE - INTERACTIVE JAVASCRIPT LOGIC
   Typing Effect, Theme Toggle, Nav Scroll, AI Chat & Toast System
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initTypingEffect();
    initThemeEngine();
    initNavbarScroll();
    initSmoothScroll();
});

/* --------------------------------------------------------------------------
   1. HERO SECTION TYPING EFFECT
   -------------------------------------------------------------------------- */
const typingWords = [
    "Full Stack Developer 💻",
    "Competitive Programmer 🏆",
    "DSA Enthusiast 🧠",
    "AI Application Developer 🤖"
];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const deletingSpeed = 60;
const holdDelay = 1800;

function initTypingEffect() {
    const textElement = document.getElementById("text");
    if (!textElement) return;

    function type() {
        const currentWord = typingWords[wordIndex];

        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex--);
            if (charIndex < 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % typingWords.length;
                setTimeout(type, 300);
                return;
            }
        } else {
            textElement.textContent = currentWord.substring(0, charIndex++);
            if (charIndex > currentWord.length) {
                isDeleting = true;
                setTimeout(type, holdDelay);
                return;
            }
        }

        setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
    }

    type();
}

/* --------------------------------------------------------------------------
   2. LIGHT / DARK THEME ENGINE
   -------------------------------------------------------------------------- */
function initThemeEngine() {
    const themeBtn = document.getElementById("themeToggle");
    const htmlElement = document.documentElement;
    
    // Check saved theme or default to dark
    const savedTheme = localStorage.getItem("devsphere-theme") || "dark";
    htmlElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const currentTheme = htmlElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            htmlElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("devsphere-theme", newTheme);
            updateThemeIcon(newTheme);
            
            showToast(`Switched to ${newTheme === "dark" ? "Dark Mode 🌙" : "Light Mode ☀️"}`);
        });
    }
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById("themeToggle");
    if (!themeBtn) return;
    themeBtn.innerHTML = theme === "dark" ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
}

/* --------------------------------------------------------------------------
   3. NAVBAR SCROLL & ACTIVE LINK HIGHLIGHTING
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
    const navbar = id("mainNavbar");
    const sections = document.querySelectorAll("section[id], body[id='top']");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        // Sticky Navbar Effect
        if (window.scrollY > 40) {
            navbar.classList.add("navbar-scrolled");
        } else {
            navbar.classList.remove("navbar-scrolled");
        }

        // Active Section Link Highlight
        let currentSectionId = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (currentSectionId && link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });
    });
}

function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link, a[href^="#"]');
    const navCollapse = document.getElementById("navMenu");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (href && href.startsWith("#") && href.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    // Close Bootstrap Mobile Menu if open
                    if (navCollapse && navCollapse.classList.contains("show")) {
                        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                        if (bsCollapse) bsCollapse.hide();
                    }

                    targetElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
        });
    });
}

/* --------------------------------------------------------------------------
   4. DEVSPHERE AI CHAT ASSISTANT
   -------------------------------------------------------------------------- */
async function sendMessage() {
    const input = id("userInput");
    const chatBox = id("chatBox");
    const sendBtn = id("sendBtn");

    const userText = input.value.trim();
    if (!userText) return;

    // Append User Message
    const userMsgDiv = document.createElement("div");
    userMsgDiv.className = "user-msg";
    userMsgDiv.textContent = userText;
    chatBox.appendChild(userMsgDiv);

    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // Append Bot Loading Typing Dots
    const botMsgDiv = document.createElement("div");
    botMsgDiv.className = "bot-msg";
    botMsgDiv.innerHTML = `
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    chatBox.appendChild(botMsgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Disable button during call
    if (sendBtn) sendBtn.disabled = true;

    try {
        // Live Backend API call with 4 second timeout fallback
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const response = await fetch("https://devsphere-8dz9.onrender.com/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userText }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Server response error");

        const data = await response.json();
        const replyText = data.reply || "";

        // Check if reply contains server configuration or API key errors
        if (replyText && !replyText.includes("Backend error") && !replyText.includes("GEMINI_API_KEY") && !replyText.includes("connection error")) {
            botMsgDiv.textContent = replyText;
        } else {
            botMsgDiv.textContent = getLocalFallbackReply(userText);
        }
    } catch (error) {
        console.warn("Backend API cold start or unavailable. Using intelligent portfolio assistant logic.");
        botMsgDiv.textContent = getLocalFallbackReply(userText);
    } finally {
        if (sendBtn) sendBtn.disabled = false;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

function sendQuickPrompt(promptText) {
    const input = id("userInput");
    if (input) {
        input.value = promptText;
        sendMessage();
    }
}

/* Local Intelligent Knowledge Base Fallback */
function getLocalFallbackReply(query) {
    const q = query.toLowerCase();
    
    if (q.includes("skill") || q.includes("tech") || q.includes("stack") || q.includes("languages")) {
        return "⚡ Sanyam's Tech Stack includes C++, HTML5, CSS3, JavaScript, React.js, Node.js, Express.js, MongoDB, REST APIs, Git, and Google Gemini AI API integration!";
    }
    if (q.includes("dsa") || q.includes("leetcode") || q.includes("codeforces") || q.includes("problem")) {
        return "🏆 Sanyam Jain has solved over 600+ DSA problems across LeetCode, Codeforces, and CodeChef, specializing in Data Structures, Dynamic Programming, and Graph Algorithms!";
    }
    if (q.includes("railnova") || q.includes("railway") || q.includes("rail")) {
        return "🚆 RailNova is Sanyam's full-stack Railway Management System featuring automated train route scheduling, seat reservation, real-time status simulation, and interactive passenger portals built with React, Node.js, Express, and MongoDB!";
    }
    if (q.includes("calc") || q.includes("calculator") || q.includes("smart calcify")) {
        return "🧮 Smart Calcify is Sanyam's interactive web calculator supporting complex mathematical expressions, history tracking, keyboard navigation, and responsive UI! Live demo: https://sanyam-manit.github.io/Smart-Calcify/";
    }
    if (q.includes("weather") || q.includes("forecast") || q.includes("weather app")) {
        return "☀️ Weather App is Sanyam's real-time weather forecasting web application with location search, live atmospheric metrics, and REST API integration! Live demo: https://sanyam-manit.github.io/Weather-App/";
    }
    if (q.includes("project") || q.includes("portfolio") || q.includes("built")) {
        return "🚀 Sanyam's featured projects include DevSphere AI Portfolio, RailNova (Railway System), Weather App & REST API, and Smart Calcify!";
    }
    if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("hire") || q.includes("reach")) {
        return "📬 You can reach Sanyam via Email at jainsanyam29062006@gmail.com or call +91 6268716450. You can also connect on LinkedIn or GitHub!";
    }
    if (q.includes("resume") || q.includes("cv")) {
        return "📄 Sanyam's latest resume is available in the Resume section. You can download it directly as a PDF from the button above!";
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
        return "👋 Hello there! How can I assist you with Sanyam Jain's profile, skills, or projects today?";
    }

    return "🤖 Sanyam Jain is a Full Stack Developer & Competitive Programmer studying Computer Science at MANIT. Feel free to explore his projects, DSA profile, or download his resume!";
}

/* --------------------------------------------------------------------------
   5. UTILITY FUNCTIONS (TOAST & CLIPBOARD)
   -------------------------------------------------------------------------- */
function copyToClipboard(text, alertMsg) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(alertMsg || "Copied to clipboard!");
        }).catch(() => {
            fallbackCopy(text, alertMsg);
        });
    } else {
        fallbackCopy(text, alertMsg);
    }
}

function fallbackCopy(text, alertMsg) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showToast(alertMsg || "Copied to clipboard!");
    } catch (err) {
        showToast("Failed to copy text");
    }
    document.body.removeChild(textArea);
}

function handleFormSubmit(event) {
    event.preventDefault();
    const name = id("contactName") ? id("contactName").value : "Visitor";
    showToast(`Thank you, ${name}! Your message has been sent successfully.`);
    const form = id("contactForm");
    if (form) form.reset();
}

function showToast(message) {
    const toastElement = id("actionToast");
    const toastBody = id("toastMessage");
    if (toastElement && toastBody) {
        toastBody.textContent = message;
        const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
        toast.show();
    }
}

function id(elementId) {
    return document.getElementById(elementId);
}
