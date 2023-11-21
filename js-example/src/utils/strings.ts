const toHex = (asciiStr: string) => {
    var arr1: string[] = [];
    for (var n = 0, l = asciiStr.length; n < l; n++) {
        var hex = Number(asciiStr.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join("");
};

export default {
    toHex: toHex,
}