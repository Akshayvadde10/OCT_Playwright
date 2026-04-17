// 19. Print Pascal's Triangle

const rows = 5;

for (let i = 0; i < rows; i++) {
    let num = 1;
    let row = "";

    // Leading spaces for triangle shape
    row += " ".repeat((rows - i) * 2);

    for (let j = 0; j <= i; j++) {
        row += String(num).padStart(4, " ");
        num = num * (i - j) / (j + 1);
    }

    console.log(row);
}
