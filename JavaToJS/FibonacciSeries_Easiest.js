// ================================
// Fibonacci Series - Easiest Version
// Each number = sum of previous two
// 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
// ================================

let first  = 0;   // 1st number
let second = 1;   // 2nd number
let next;         // will hold the next number

console.log("Start Fibonacci:");
console.log(first);    // print 1st number
console.log(second);   // print 2nd number

// Now calculate and print from 3rd number to 10th number
for (let i = 3; i <= 10; i++) {

  next = first + second;   // add previous two numbers
  console.log(next);       // print the result

  first  = second;         // shift: first moves forward
  second = next;           // shift: second becomes the new number

}
