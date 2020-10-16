var publicKeys = [];
var secretKey = createKey(32);

var commonKeys = [];

addListenersToContacts();
addListenerToSendMessageBtn();
addListenerToTypingBar();

function createKey(bitsAmount) {
    const bytesAmount = bitsAmount / 16;
    var key = '';
    
    for (let i = 0; i < bytesAmount; i++) {
        const number = Math.random() * (10 - 0) + 0;
        const flooredNumber = Math.floor(number);  
        
        key += flooredNumber;
    }

    key = parseInt(key);
    return key;
};

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
    div.classList.remove('new_message')
    clearMessagesBlock();
    loadMessageHistory(currInterlocutorName);

    document.getElementById('username').innerHTML = `Talking to <strong>${currInterlocutorName}</strong>`;
    document.getElementById('messages').style.display = 'block';
};

// Switch conversation:
function addListenersToContacts() {
    const chat_listDivs = Array.from(document.getElementsByClassName('chat_list'));

    chat_listDivs.forEach(div => {
        addListenerToContact(div);
    });
};

function addListenerToContact(contact) {
    contact.addEventListener('click', e => {
        e.preventDefault();
        const interlocutorName = contact.children[0].children[1].innerText.trim();

        // If user didn't click on the same contact: 
        if (!(interlocutorName === currInterlocutorName)) {
            connectWithContact(interlocutorName);
            changeMessageHistory(contact);
        }
    });
};

function connectWithContact(contactName) {
    currInterlocutorName = contactName;

    var isKeyExist = isCommonKeyExist(contactName);

    if (!isKeyExist) {
        partialKey = GetModularByMultiply(publicKeys.q, secretKey, publicKeys.p);
        socket.emit('partialKey', { fromName : myname, toName : contactName, partialKey });    
    }
}

function isCommonKeyExist(name) {
    var status = false;

    commonKeys.forEach(key => {
        status = (key.interlocutorName === name) ? true : false;
    })

    return status;
}

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

// On new user connect:
function addContactToList(data) {
    const inbox = document.querySelector('.inbox_chat');

    const contact = document.createElement('div');
    contact.classList.add('chat_list');
    contact.innerHTML = `
        <div class="chat_people">
            <div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil">
            </div>
            <div class="chat_ib">
                <h5 id="chat_ib">
                    ${data.name}
                </h5>
            </div>
            <input type="hidden" class="u" value="${data.id}" />
        </div>
    `;

    inbox.appendChild(contact);

    return contact;
};

// Send message data to server:
function emitMessage() {
    var touser = document.querySelector('.active_chat').children[0].children[1].innerText;
    var text = document.getElementById('msgInput').value;

    const keyToEncrypt = getCommonKeyByInterlocutor(touser);
    const encrypted = encrypt(text, keyToEncrypt).toString();

    const data = {
        from: myname,
        to: touser,
        msg: encrypted
    };

    socket.emit('message', data);

    return data
};

function getCommonKeyByInterlocutor(name) {
    var commonKey;
    
    commonKeys.forEach(key => {
        if (key.from === name) {
            commonKey = key.key;
        }
    });
    
    return commonKey;
}

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

function isNewUserExist(newUserName) {
    const contacts = Array.from(document.getElementsByClassName('chat_list'));
    var isContactExist = false;
    
    contacts.forEach(contact => {
        const name = contact.children[0].children[1].innerText.trim();

        if (name === newUserName) {
            isContactExist = true;
        }
    })

    return isContactExist;
};