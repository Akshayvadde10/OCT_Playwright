// 16. Print the Prime Numbers in a Range

const start = 10;
const end = 50;

console.log(`Prime numbers between ${start} and ${end}:`);

for (let num = start; num <= end; num++) {
    let isPrime = true;

    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
            isPrime = false;
            break;
        }
    }

    if (isPrime && num > 1) {
        process.stdout.write(num + " ");
    }
}

console.log();




