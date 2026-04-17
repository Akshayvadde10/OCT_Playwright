// Simple Fibonacci Series Program
// Prints first 10 Fibonacci numbers

const count = 10;
let first = 0;
let second = 1;

let output = first + ", " + second;

for (let i = 3; i <= count; i++) {
  const next = first + second;
  output += ", " + next;
  first = second;
  second = next;
}

console.log("Fibonacci Series:", output);
