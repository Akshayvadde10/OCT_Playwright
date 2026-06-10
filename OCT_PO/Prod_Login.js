class Prod_Login{
    constructor(page){
   this.page=page;     
   this.username=page.locator('input#text-field-1')
   this.password=page.locator('input#text-field-2')
   this.signInButton=page.locator('.sign-in-button')
   this.corporateTaxTile=page.locator('#HomeProduct-CorporateTax')
   this.subClientSearchBox=page.locator('#SubClient-Search-Box')
   
}

async loginToApplication(username,password,clientName){
    await this.username.fill(username);
    await this.password.fill(password);
    await this.signInButton.click();

    // Wait for Corporate Tax tile to be visible after login (page takes time to load)
    await this.corporateTaxTile.waitFor({ state: 'visible', timeout: 90000 });
    await this.corporateTaxTile.click();

    await this.subClientSearchBox.fill(clientName);
    await this.page.getByText(clientName).click();
}
}

export { Prod_Login };