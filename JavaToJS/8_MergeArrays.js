// 8. Merge Two Arrays
const arr1 = [1, 3, 5];
const arr2 = [2, 4, 6];

// Method 1: Using concat()
console.log("Method 1 (concat):", arr1.concat(arr2).toString());

// Method 2: Using spread operator directly
console.log("Method 2 (spread):", [...arr1, ...arr2].toString());

// Method 3: Using push with spread
const result1 = [];
result1.push(...arr1, ...arr2);
console.log("Method 3 (push):", result1.toString());

// Method 4: Using loop
const result2 = [];
for(let i=0; i<arr1.length; i++){
    result2.push(arr1[i]);
}
for(let i=0; i<arr2.length; i++){
    result2.push(arr2[i]);
}
console.log("Method 4 (loop):", result2.toString());

// Method 5: Using forEach
const result3 = [];
arr1.forEach(item => result3.push(item));
arr2.forEach(item => result3.push(item));
console.log("Method 5 (forEach):", result3.toString());
