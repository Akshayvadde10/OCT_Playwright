// 6. Count Vowels and Consonants
/*const str = "Automation";
let vowels = 0, consonants = 0;
for (const c of str) {
  if ("aeiouAEIOU".includes(c)) {
    vowels++;
  } else if (/[a-zA-Z]/.test(c)) {
    consonants++;
  }
}
console.log("Vowels: " + vowels + ", Consonants: " + consonants); */


const str = "Automation";
let vowels = 0, consonants = 0;
for (let i=0;i<str.length;i++){
    if("aeiouAEIOU".includes(str[i])){
        vowels++;
    }

}
