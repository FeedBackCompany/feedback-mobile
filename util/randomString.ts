/**
 * Example usage:
 * 
 * const randomString = generateRandomString(16); // e.g., "aB9kP2mX5nY8vZ3q"
 * 
 * With custom charset
 * 
 * const numbersOnly = generateRandomString(6, '0123456789'); // e.g., "847591"
 * 
 * @param length number
 * @param charset string of characters to use (has a default of all uppercase/lowercase letters, and numbers)
 * @returns random string of <length> characters long
 */
export const generateRandomString = (length: number, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
}