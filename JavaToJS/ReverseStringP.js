const str = "MADAM";
let reverse = "";

let charArray = str.split("");

for(let i=0;i<charArray.length;i++){
    reverse = charArray[i] + reverse;
}
console.log(reverse);

if(str === reverse){
    console.log("String is palindrome");
}else{
    console.log("String is not palindrome");
}