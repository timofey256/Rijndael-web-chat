addListenersToContacts();
addListenerToSendMessageBtn();
addListenerToTypingBar();

function loadMessageHistory(name) {
    messageHistory.forEach(msg => {
        if (msg.interlocutorName === name) {
            createMessage(msg.type, name, msg.text);
        }
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
        const text = document.getElementById('msgInput').value;
        createOutgoingMessage(text);

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

// Send message data to server:
function emitMessage() {
    const touser = document.querySelector('.active_chat').children[0].children[1].innerText;
    const text = document.getElementById('msgInput').value;

    const data = {
        from: myname,
        to: touser,
        msg: text
    };

    socket.emit('message', data);

    return data
};

function sendMessage() {
    const messageData = emitMessage();

    // Add message to message's history:
    const message = formMessageObjectByType(messageData, 'out');
    messageHistory.push(message);

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
    if (myname.trim() == data.to.trim()) {
        const message = formMessageObjectByType(data, 'in');

        messageHistory.push(message);

        if (data.from.trim() === currInterlocutorName) {
            createIngoingMessage(data.from, data.msg);
        }
    }

    hideTypingBar();
});

socket.on('newuser', function (data) {
    //
});