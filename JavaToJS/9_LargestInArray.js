// 9. Find the Largest Element in an Array
/*const arr = [1, 3, 5, 7, 9];
let largest = arr[0];
for (const num of arr) {
  if (num > largest) {
    largest = num;
  }
}
console.log(largest);*/

const arr = [1, 3, 5, 7, 9];
let largest = arr[0];
for(let i=0;i<arr.length;i++){
    if(arr[i]>largest){
        largest = arr[i];
    }

}
console.log(largest);

