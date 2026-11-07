// Import Firebase functions using your version 13.2.0 links
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";

// Your exact Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHeBLiBI4hAIcQsz2SEgum5K4qiO2maZo",
  authDomain: "chatting-fd63f.firebaseapp.com",
  databaseURL: "https://chatting-fd63f-default-rtdb.firebaseio.com",
  projectId: "chatting-fd63f",
  storageBucket: "chatting-fd63f.firebasestorage.app",
  messagingSenderId: "1061709631257",
  appId: "1:1061709631257:web:713a3667285e56a301ff88"
};

// Initialize Firebase & Realtime Database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Auth Elements
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');
const usernameInput = document.getElementById('username-input');
const authInput = document.getElementById('auth-input');
const loginBtn = document.getElementById('login-btn');
const displayUsername = document.getElementById('display-username');

// Chat Elements
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages-container');
const mediaFileInput = document.getElementById('media-file-input');
const chatList = document.getElementById('chat-list');
const activeChatName = document.getElementById('active-chat-name');

// Modals
const groupModal = document.getElementById('group-modal');
const openGroupModalBtn = document.getElementById('open-group-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const createGroupBtn = document.getElementById('create-group-btn');
const groupNameInput = document.getElementById('group-name-input');

const memberModal = document.getElementById('member-modal');
const openAddMemberBtn = document.getElementById('open-add-member-modal');
const closeMemberModalBtn = document.getElementById('close-member-modal-btn');
const addMemberBtn = document.getElementById('add-member-btn');
const memberInput = document.getElementById('member-input');

let currentUser = null;

// Login & Save User to Firebase Realtime Database
loginBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    const contact = authInput.value.trim();

    if (name === "" || contact === "") {
        alert("Please enter both Name and Phone/Gmail!");
        return;
    }

    currentUser = { name, contact };
    displayUsername.textContent = name;

    // Sanitize key for Firebase path
    const userId = contact.replace(/[.#$\/\[\]]/g, "_");
    
    // Save user info to Firebase Realtime Database
    set(ref(database, 'users/' + userId), {
        name: name,
        contact: contact,
        joinedAt: new Date().toISOString()
    }).then(() => {
        authScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
    }).catch((error) => {
        alert("Error saving to Firebase: " + error.message);
    });
});

// Switch active chat when clicking items in sidebar
chatList.addEventListener('click', (e) => {
    const chatItem = e.target.closest('.chat-item');
    if (!chatItem) return;

    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    chatItem.classList.add('active');

    const chatName = chatItem.getAttribute('data-chatname');
    activeChatName.textContent = chatName;
    messagesContainer.innerHTML = `<div class="message received"><p>Switched to ${escapeHTML(chatName)}</p><span class="time">Just now</span></div>`;
});

// Send Text Message Function
function sendMessage() {
    const text = messageInput.value.trim();
    if (text === "") return;

    appendMessage(text, 'sent');
    messageInput.value = "";
    scrollToBottom();
}

// UI me message show karne ka function
function appendMessage(content, type, isMedia = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);

    let innerHTML = '';
    if (isMedia) {
        innerHTML = content;
    } else {
        innerHTML = `<p>${escapeHTML(content)}</p>`;
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    innerHTML += `<span class="time">${currentTime}</span>`;

    messageDiv.innerHTML = innerHTML;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Media (Photo/Video) handling
mediaFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        let mediaHTML = '';
        if (file.type.startsWith('image/')) {
            mediaHTML = `<img src="${event.target.result}" alt="Uploaded Image">`;
        } else if (file.type.startsWith('video/')) {
            mediaHTML = `<video controls src="${event.target.result}"></video>`;
        }
        appendMessage(mediaHTML, 'sent', true);
    };
    reader.readAsDataURL(file);
});

// Group Modal Open/Close Logic
openGroupModalBtn.addEventListener('click', () => {
    groupModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    groupModal.classList.add('hidden');
});

createGroupBtn.addEventListener('click', () => {
    const groupName = groupNameInput.value.trim();
    if (groupName !== "") {
        const newChatHTML = `
            <div class="chat-item" data-chatname="${escapeHTML(groupName)}">
                <img src="https://via.placeholder.com/45" alt="">
                <div class="chat-info">
                    <h4>${escapeHTML(groupName)} (Group)</h4>
                    <p>Group created</p>
                </div>
            </div>
        `;
        chatList.insertAdjacentHTML('afterbegin', newChatHTML);
        groupNameInput.value = "";
        groupModal.classList.add('hidden');
    }
});

// Add Member Modal Logic
openAddMemberBtn.addEventListener('click', () => {
    memberModal.classList.remove('hidden');
});

closeMemberModalBtn.addEventListener('click', () => {
    memberModal.classList.add('hidden');
});

addMemberBtn.addEventListener('click', () => {
    const memberInfo = memberInput.value.trim();
    if (memberInfo !== "") {
        alert(`Member "${memberInfo}" added successfully!`);
        memberInput.value = "";
        memberModal.classList.add('hidden');
    } else {
        alert("Please enter a phone number or gmail.");
    }
});

// Event Listeners for sending text
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Security helper to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[tag] || tag)
    );
}
