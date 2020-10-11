function ModularExponentiation(a, b, n) {
    const multiply = a*b;
    return multiply % n 
};  

function computeCommon(module, partial, secret) {
    console.log(`partial: ${partial}, secret: ${secret}`);
    console.log('common key: ', Math.pow(partial, secret) % module);
    return Math.pow(partial, secret) % module;
}