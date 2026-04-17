// 3. Fibonacci Series
const n = 10;
let num1 = 0, num2 = 1;
process.stdout.write("Fibonacci Series: " + num1 + ", " + num2);
for (let i = 2; i < n; i++) {
  const num3 = num1 + num2;
  process.stdout.write(", " + num3);
  num1 = num2;
  num2 = num3;
}
console.log();
