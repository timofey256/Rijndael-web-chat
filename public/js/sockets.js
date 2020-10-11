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
    const key = GetModularByMultiply(data.partialKey, secretKey, publicKeys.p);
    console.log(`Created a new common key '${key}' with '${data.from}'`);

    commonKeys.push({ from : data.from, key });

    // Send my partial key to interlocutor:
    const partial = GetModularByMultiply(publicKeys.q, secretKey, publicKeys.p);
    const to = data.from;
    socket.emit('partialKeyResponse', { fromName : myname, toName : to, partialKey : partial });
});

socket.on('partialResponse', function (data) {
    // Create common key:
    const key = GetModularByMultiply(data.partialKey, secretKey, publicKeys.p);
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