// 13. Calculate GCD of Two Numbers

let a = 60, b = 48;

console.log(`Finding GCD of ${a} and ${b}`);

while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
}

console.log(`GCD: ${a}`);
