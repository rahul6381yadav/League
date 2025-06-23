
/**
* Generate a random alphanumeric code of specified length
* @param {number} length - Length of the code
* @returns {string} Random alphanumeric code
*/
exports.generateRandomCode = (length = 6) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid ambiguous characters like I, O, 0, 1
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};