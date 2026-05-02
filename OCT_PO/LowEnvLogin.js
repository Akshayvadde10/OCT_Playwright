class LowEnvLogin{
    constructor(page){
   this.page=page;     
   this.ciamUI=page.getByText('Thomson Reuters sign-in')
   this.username=page.locator('#username')
   this.signInButton=page.getByRole('button', { name: 'Sign in' })
   this.password=page.locator('#password')
   this.corporateTaxTile=page.locator('#HomeProduct-CorporateTax')
   this.subClientSearchBox=page.locator('#SubClient-Search-Box')
   
}
async loginToLApp(username,password,clientName){ 
  await this.ciamUI.click();
  await this.username.fill(username);
  await this.signInButton.click();
  await this.password.fill(password);
  await this.signInButton.click();
  await this.corporateTaxTile.click();
  await this.subClientSearchBox.fill(clientName);
  await this.page.getByText(clientName).click();
}
}

export { LowEnvLogin };