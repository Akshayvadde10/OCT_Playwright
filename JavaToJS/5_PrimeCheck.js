// 5. Prime Number Check
/*
let num = 11;
let isPrime = true;
for (let i = 2; i <= Math.sqrt(num); i++) {
  if (num % i === 0) {
    isPrime = false;
    break;
  }
}
console.log(isPrime);
*/
const num = 18;
let output=num%2;
if(output===1){
    console.log("Prime Number");
}else{
    console.log("Not a Prime Number");
}




