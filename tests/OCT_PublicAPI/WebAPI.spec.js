import { test, expect } from '@playwright/test';

const entpayload =  {
      name: `PWEnt_${Date.now()}`,
      shortName: `entShortName_${Date.now()}`,
      businessSegment: "",
      geography: "",
      legalEntityType: "Company",
      managerLogin: "",
      partnerLogin: "",
      directorLogin: "",
      type: "",
      identifier: `entIdentifier_${Date.now()}`,
      taxId: "",
      team: "",
      city: "",
      service: "",
      jurisdictionId: "uk"
    } 

test('API Test', async ({ request }) => {

    const loginResponse = await request.post('https://api-emea.onesourcetax.com/oauth2/v1/token', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
            grant_type: 'client_credentials',
            client_id: 'wR09RrvapyXl4XfGmBUgwnuIijbA2G5n',
            client_secret: 'uW3tNCZdMYrq6FoK',
            scope: 'urn:tr:onesource:auth:api:corporatetax,urn:tr:onesource:auth:client:SYS_FIRM'
        }
    });

    console.log("Response status:", loginResponse.status());
    expect(loginResponse.ok()).toBeTruthy();

    const loginjsonData = await loginResponse.json();
    console.log("Login API response: ", loginjsonData);

    const accessToken = loginjsonData.access_token;
    console.log("Access Token: ", accessToken);


// Entity Creation API call
    const entCreation=await request.post('https://api-emea.onesourcetax.com/corporate-tax/v1/master-data/entities',
        {
            data: { entities: [entpayload] },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

    console.log("Response status for Entity Creation API:", entCreation.status());
    expect(entCreation.ok()).toBeTruthy();

    const entCreationjsonData = await entCreation.json();
    console.log("Entity Creation API response: ", JSON.stringify(entCreationjsonData, null, 2));
       
    const EntityId = entCreationjsonData.items[0].id;
    console.log("Entity ID: ", EntityId);


     //Dataset Creation API call

    const datasetpayload = {
        name: `PWDS_${Date.now()}`,
        year: 2023,
        period: {
            startDate: "2022-07-01",
            endDate: "2024-09-30",
            type: "Annual"
        },
        purpose: "Tax return",
        type: "Company",
        returnDetails: [
            {
                entityId: EntityId,
                templateId: "69bb1d95-b362-48c1-ab8e-196459916076",
                templateFamilyName: "United Kingdom Corporate Tax",
                returnName: "entShortName_Tax return"
            }
        ]
    };

   

    const datasetCreation = await request.post('https://api-emea.onesourcetax.com/corporate-tax/v1/datasets',
        {
            data: datasetpayload,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
        }
    });

    console.log("Response status for Dataset Creation API:", datasetCreation.status());
    //expect(datasetCreation.ok()).toBeTruthy();

    const datasetCreationjsonData = await datasetCreation.json();
    console.log("Dataset Creation API response: ", JSON.stringify(datasetCreationjsonData, null, 2));

    console.log("Dataset ID: ", datasetCreationjsonData.id);


       //Dataset Status API call
       for(let i=0;i<10;i++){
       let DatasetStatus=await request.get(`https://api-emea.onesourcetax.com/corporate-tax/v1/datasets/operations/${datasetCreationjsonData.id}`,

        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,           
        }
    });

      const DatasetStatusjsonData = await DatasetStatus.json();
    JSON.stringify(DatasetStatusjsonData, null, 2);

    console.log("Dataset Status: ", DatasetStatusjsonData.status);
    if(DatasetStatusjsonData.status==="Successful"){
        break;
    }
    console.log(`Dataset is still processing ${i+1}, Retrying in 3 seconds...`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // wait for 3 seconds before retrying
}   

console.log("Dataset processing completed.");

    
  

});