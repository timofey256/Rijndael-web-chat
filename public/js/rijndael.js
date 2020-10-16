/** 
 * Implemented AES encryption by CryptoJS lib
 * and some functions about cryptography which will be useful
*/

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

async function toSHA256(data) {
  const msgUint8 = new TextEncoder().encode(data);                              // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}

function encrypt(data, key) {
  if (data !== '' || key !== '') {
    return CryptoJS.AES.encrypt(data, key);
  } 
  else {
    return null
  }
}

function decrypt(data, key) {
  if (data !== '' || key !== '') {
    return CryptoJS.AES.decrypt(data, key);
  } 
  else {
    return null
  }
}