// 11. Check if a Number is Armstrong

const num = 153;
let sum = 0;
let temp = num;

while (temp !== 0) {
    const digit = temp % 10;
    sum += Math.pow(digit, 3);
    temp = Math.floor(temp / 10);
}

console.log(`Number: ${num}`);
console.log(`Is Armstrong: ${num === sum}`);


