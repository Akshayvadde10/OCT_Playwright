class LowEnvLogin{
    constructor(page){
   this.page=page;     
   this.ciamUI=page.getByText('Thomson Reuters sign-in')
   this.username=page.locator('#username')
   this.signInButton=page.getByRole('button', { name: 'Sign in' })
   this.password=page.locator('#password')
   this.controlSearch=page.locator('.control-search');
   this.search=page.locator('.search-button');
   this.userNameCheckbox=page.locator('.OneSourcePersonaCard-checkbox').first();
   this.continueButton=page.getByRole('button', { name: 'Continue' });
   this.corporateTaxTile=page.locator('#HomeProduct-CorporateTax')
   this.subClientSearchBox=page.locator('#SubClient-Search-Box')
   
}
async loginToLApp(mailid,password,username,clientName){ 
  await this.ciamUI.click();
  await this.username.fill(mailid);
  await this.signInButton.click();
  await this.password.fill(password);
  await this.signInButton.click();
  await this.controlSearch.pressSequentially(username);
  await this.page.waitForTimeout(3000);
  await this.search.click();
  await this.page.waitForTimeout(3000);
  await this.userNameCheckbox.click();
  await this.continueButton.click();
  await this.corporateTaxTile.click();
  await this.subClientSearchBox.fill(clientName);
  await this.page.getByText(clientName).click();
}
}

export { LowEnvLogin };