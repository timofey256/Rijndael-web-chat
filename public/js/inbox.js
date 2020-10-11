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
    document.addEventListener('keydown', e => {
        if (e.key == 'p') {
            console.log(`Requested for all commonKeys. \n All Common Keys: `, commonKeys);
        }
      });

    contact.addEventListener('click', e => {
        e.preventDefault();
        const interlocutorName = contact.children[0].children[1].innerText.trim();

        if (!(interlocutorName === currInterlocutorName)) {
            currInterlocutorName = interlocutorName;

            var status = false;
            console.log(`Requested for all commonKeys. \n All Common Keys: `, commonKeys);
            commonKeys.forEach(key => {
                status = (key.interlocutorName) ? true : false;
            })

            if (!status) {
                partialKey = ModularExponentiation(publicKeys.q, secretKey, publicKeys.p);
                socket.emit('partialKey', { fromName : myname, toName : interlocutorName, partialKey });    
            }
            
            changeMessageHistory(contact);
        }
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

function fromArrayToInt(arr) {
    var result = '';

    arr.forEach(item => {
        result += item;
    });

    return parseInt(result);
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
        else {
            showNewMessageOnConv(data.from.trim());
        }
    }

    hideTypingBar();
});

socket.on('partialKey', function (data) {    
    // Create common key:
    const key = ModularExponentiation(data.partialKey, secretKey, publicKeys.p);
    console.log(`Created a new common key '${key}' with '${data.from}'`);

    commonKeys.push({ from : data.from, key });

    // Send my partial key to interlocutor:
    const partial = ModularExponentiation(publicKeys.q, secretKey, publicKeys.p);
    const to = data.from;
    socket.emit('partialKeyResponse', { fromName : myname, toName : to, partialKey : partial });
});

socket.on('partialResponse', function (data) {
    // Create common key:
    const key = ModularExponentiation(data.partialKey, secretKey, publicKeys.p);
    console.log(`Created a new common key '${key}' with '${data.from}'`);

    commonKeys.push({ from : data.from, key });
});

socket.on('newuser', function (data) {
    const isContactExist = isNewUserExist(data.name);

    if ((data.name !== myname) && (!isContactExist)) {
        const contact = addContactToList(data);

        addListenerToContact(contact);
    };
});

socket.on('publicKeys', function (data) {
    publicKeys = data.publicKeys;
});