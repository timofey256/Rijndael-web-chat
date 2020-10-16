/**
 * Getting data from server by Socket IO
 * 
 * Available events:
 *  typing - On the interlocutor presses at any key in message field
 *  stoptyping - On the interlocutor stops to press at any key in message field
 *  message - On message
 *  partialKey - On interlocutor starts to creating new conversation with you 
 *               and, consequently, starts to form the secret key by the 
 *               Diffie-Hellman's protocol. This event is uses for that.
 *  partialResponse - Uses when you send your partial key to interlocutor and
 *                    wait for his partial key.
 *  newuser - On user joined to chat.
 *  publicKeys - When user joins he should take the public keys which are
 *               required to form the secret key in converstation.
 */

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
        
        data.msg = decrypt(data.msg, getCommonKeyByInterlocutor(data.from)).toString(CryptoJS.enc.Utf8);

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

    toSHA256(key)
        .then(result => {
            commonKeys.push({ from : data.from, key : result });
        });

    // Send my partial key to interlocutor:
    const partial = GetModularByMultiply(publicKeys.q, secretKey, publicKeys.p);
    const to = data.from;
    socket.emit('partialKeyResponse', { fromName : myname, toName : to, partialKey : partial });
});

socket.on('partialResponse', function (data) {
    // Create common key:
    const key = GetModularByMultiply(data.partialKey, secretKey, publicKeys.p);

    toSHA256(key)
        .then(result => {
            commonKeys.push({ from : data.from, key : result });
        });
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