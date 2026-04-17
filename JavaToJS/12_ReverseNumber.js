// 12. Reverse a Number

let num = 12345;
let reversed = 0;

console.log(`Original Number: ${num}`);

while (num !== 0) {
    reversed = reversed * 10 + num % 10;
    num = Math.floor(num / 10);
}

console.log(`Reversed Number: ${reversed}`);
