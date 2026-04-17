// 18. Swap Two Numbers (without temp variable)

let a = 5, b = 10;

console.log(`Before swap: a = ${a}, b = ${b}`);

a = a + b;
b = a - b;
a = a - b;

console.log(`After swap:  a = ${a}, b = ${b}`);
