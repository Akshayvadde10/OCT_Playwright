// 10. Remove Duplicates from an Array

// SIMPLE VERSION - Easy to understand!
const arr = [1, 2, 2, 3, 4, 4];
const unique = [];

console.log("Original array:", arr);
console.log("Empty basket (unique):", unique);
console.log("---");

for (const num of arr) {
    console.log(`Pick number: ${num}`);

    if (unique.includes(num)) {
        console.log(`  Already have ${num}. Skip it!`);
    } else {
        unique.push(num);
        console.log(`  New number! Put ${num} in basket → [${unique}]`);
    }
    console.log("");
}

console.log("Final basket:", unique);
