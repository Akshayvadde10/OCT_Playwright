// 17. Find the Second Largest Element in an Array

const arr = [12, 35, 1, 10, 34,34, 1];
/*let first = -Infinity;
let second = -Infinity;

console.log(`Array: [${arr}]`);

for (const num of arr) {
    if (num > first) {
        second = first;
        first = num;
    } else if (num > second && num !== first) {
        second = num;
    }
}

console.log(`Second Largest: ${second}`);*/



let temp
for(let i=0;i<arr.length;i++){
    for(let j=i+1;j<arr.length;j++){
        if(arr[i]<arr[j]){  
            temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
}
console.log(arr)
console.log(`Second Largest: ${arr[1]}`);
