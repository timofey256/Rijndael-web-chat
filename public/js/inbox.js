addListenersToContacts();
addListenerToSendMessageBtn();
addListenerToTypingBar();

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
}

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

function createMessage(type, name, text) {
    if (type === 'out') {
        createOutgoingMessage(text);
    }
    else if (type === 'in') {
        createIngoingMessage(name, text)
    }
};

function loadMessageHistory(name) {
    console.log('message history: ', messageHistory);
    messageHistory.forEach(msg => {
        if (msg.interlocutorName === name) {
            createMessage(msg.type, name, msg.text);
        }
    });
};

function removeClassFromElements(elements, className) {
    elements.forEach(div => {
        div.classList.remove(className);
    });
};

// Reload message history from one to other interlocutor:
function changeMessageHistory(div) {
    // Deleting .active_chat from each people in list except the one clicked.
    const chat_listDivs = Array.from(document.querySelectorAll('.chat_list'));

    removeClassFromElements(chat_listDivs, 'active_chat');

    div.classList.add('active_chat');
    clearMessagesBlock();
    loadMessageHistory(currInterlocutorName);

    document.getElementById('username').innerHTML = `Talking to <strong>${currInterlocutorName}</strong>`;
    document.getElementById('messages').style.display = 'block';
};

// Switch conversation:
function addListenersToContacts() {
    const chat_listDivs = Array.from(document.getElementsByClassName('chat_list'));

    chat_listDivs.forEach(div => {
        div.addEventListener('click', (e) => {
            e.preventDefault();
            const interlocutorName = div.children[0].children[1].innerText.trim();

            if (!(interlocutorName === currInterlocutorName)) {
                currInterlocutorName = interlocutorName;

                changeMessageHistory(div);
            }
        });
    });
};

// Send message on button click: 
function addListenerToSendMessageBtn() {
    document.getElementById('msg_send_btn').addEventListener('click', (e) => {
        sendMessage();
    });
};

// Send Typing/StopTyping on message field focus:
function addListenerToTypingBar() {
    document.getElementById('msgInput').addEventListener('focus', (e) => {
        var data = document.getElementById('msgInput').value;
        if (data == null || data == "") {
            socket.emit('stoptyping', {
                from: myname
            });
        }

        socket.emit('typing', {
            from: myname
        });
    });
};

function sendMessage() {
    const touser = document.querySelector('.active_chat').children[0].children[1].innerText;
    const data = document.getElementById('msgInput').value;

    socket.emit('message', {
        from: myname,
        to: touser,
        msg: data
    });

    document.getElementById('msgInput').value = '';
};

function formMessageObjectByType(data, type) {
    const date = new Date();
    const time = `${date.getHours()}/${date.getMinutes()}/${date.getSeconds()}`;

    const interlocutorName = (type === 'in') ? data.from.trim() : data.to.trim();

    const message = {
        interlocutorName: interlocutorName,
        type: type,
        text: data.msg,
        time: time
    };

    return message;
};

socket.on('typing', function (data) {
    if (myname != data.from) {
        showTypingBar();
    }
});

socket.on('stoptyping', function (data) {
    if (myname != data.from) {
        hideTypingBar()
    }
});

socket.on('message', function (data) {
    if (myname.trim() == data.from.trim()) {
        const message = formMessageObjectByType(data, 'out');

        messageHistory.push(message);

        createOutgoingMessage(data.msg);
    }
    else if (myname.trim() == data.to.trim()) {
        const message = formMessageObjectByType(data, 'in');

        messageHistory.push(message);

        createIngoingMessage(data.from, data.msg);
    }

    hideTypingBar();
});

socket.on('newuser', function (data) {
    //
});