function ModularExponentiation(a, b, n) {
    console.log(`g: ${a}, p: ${b}, s: ${n}`);

    a = a % n;
    var result = 1;
    var x = a;
  
    while (b > 0) {
        var leastSignificantBit = b % 2;
        b = Math.floor(b / 2);
  
        if (leastSignificantBit == 1) {
            result = result * x;
            result = result % n;
        }
  
        x *= x;
        x = x % n;
    }

    console.log(`Partial equals '${result}'`);

    return result;
};  

function computeCommon(module, partial, secret) {
    console.log(`partial: ${partial}, secret: ${secret}`);
    console.log('common key: ', Math.pow(partial, secret) % module);
    return Math.pow(partial, secret) % module;
}