// 14. Check for Anagram

const str1 = "listen";
const str2 = "silent";

const arr1 = str1.split("").sort();
const arr2 = str2.split("").sort();

const isAnagram = arr1.join("") === arr2.join("");

console.log(`String 1: ${str1}`);
console.log(`String 2: ${str2}`);
console.log(`Is Anagram: ${isAnagram}`);
