// 20. Find the Missing Number in an Array

const arr = [1, 2, 4, 5, 6];
const n = arr.length + 1;
const total = n * (n + 1) / 2;

let sumOfArr = 0;
for (const num of arr) {
    sumOfArr += num;
}

const missing = total - sumOfArr;

console.log(`Array: [${arr}]`);
console.log(`Missing Number: ${missing}`);
