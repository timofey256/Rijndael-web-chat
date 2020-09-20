function showTypingBar() {
    const typingBar = document.getElementById('typingBar');
    typingBar.style.display = 'block';
}

function hideTypingBar() {
    const typingBar = document.getElementById('typingBar');
    typingBar.style.display = 'none';
};

function formOutMessage(text) {
    const msg = document.createElement('div');

    msg.classList.add('outgoing_msg');
    msg.classList.add('msg');
    msg.innerHTML = `
                    <div class="sent_msg">
                        <p>${text}</p>
                        <span class="time_date"> ${moment().fromNow()}</span>
                    </div>
            `;

    return msg;
};

function formInMessage(from, text) {
    const msg = document.createElement('div');

    msg.classList.add('incoming_msg');
    msg.classList.add('msg');
    msg.innerHTML = `
                <div class="incoming_msg_img"><img src="https://ptetutorials.com/images/user-profile.png" alt="${from}">
                    <span class="username">${from}</span>
                </div>
                <div class="received_msg">
                    <div class="received_withd_msg">
                        <p>${text}</p>
                        <span class="time_date"> ${moment().fromNow()}</span>
                    </div>
                </div>
            `;

    return msg;
};

function createOutgoingMessage(message) {
    const parent = document.getElementById('msg_history');
    const newMsg = formOutMessage(message);
    parent.appendChild(newMsg);
};

function createIngoingMessage(from, message) {
    const parent = document.getElementById('msg_history');
    const newMsg = formInMessage(from, message);
    parent.appendChild(newMsg);
};

function clearMessagesBlock() {
    const messages = Array.from(document.getElementsByClassName('msg'));

    messages.forEach(msg => {
        msg.remove();
    });
};

function showNewMessageOnConv(from) {
    const contactsHTML = Array.from(document.querySelectorAll('.chat_list'));
    
    contactsHTML.forEach(contact => {
        const name = contact.children[0].children[1].children[0].innerHTML.trim();
        
        if (name === from) {
            contact.classList.add('new_message');
        }
    });
}

function createMessage(type, name, text) {
    if (type === 'out') {
        createOutgoingMessage(text);
    }
    else if (type === 'in') {
        createIngoingMessage(name, text)
    }
};

function removeClassFromElements(elements, className) {
    elements.forEach(div => {
        div.classList.remove(className);
    });
};