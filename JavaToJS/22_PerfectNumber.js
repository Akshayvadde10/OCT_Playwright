// 22. Check for Perfect Number

const num = 28;
let sum = 0;

for (let i = 1; i <= Math.floor(num / 2); i++) {
    if (num % i === 0) {
        sum += i;
    }
}

console.log(`Number: ${num}`);
console.log(`Is Perfect Number: ${num === sum}`);
