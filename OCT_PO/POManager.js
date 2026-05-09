
import { LowEnvLogin } from "./LowEnvLogin.js";
import { Prod_Login } from "./Prod_Login.js";
import{ EntCreation } from "./EntCreation.js";
import { EntFilter } from "./EntFilter.js";
import{EntityGrouping} from "./EntityGrouping.js";
import { EntToGroup } from "./EntToGroup.js";
import { CreateDS } from "./CreateDS.js";
import { InsertSheet } from "./InsertSheet.js";
import { COACreation } from "./COACreation.js";
import { CreateMap } from "./CreateMap.js";
import {CreateMap1} from "./CreateMap1.js";
import { CreateImport } from "./CreateImport.js";
import { CreateImport1 } from "./CreateImport1.js";
import { InHeaderImport } from "./InHeaderImport.js";
import { AppendexistingImport } from "./AppendexistingImport.js";
import { ValidateImportedValues } from "./ValidateImportedValues.js";
import { ValidateGrpImportedValues } from "./VaidateGrpImportedValues.js";
import {Printcalc} from "./Printcalc.js";
import {CompareFiles} from "./CompareFiles.js";
import { DrillDown } from "./DrillDown.js";




class POManager{
    constructor(page){
        this.page=page;
        this.lowEnvLogin = new LowEnvLogin(this.page);
        this.prodLogin = new Prod_Login(this.page);
        this.entCreation = new EntCreation(this.page);
        this.entFilter = new EntFilter(this.page);
        this.entityGrouping = new EntityGrouping(this.page);
        this.entToGroup= new EntToGroup(this.page);
        this.createDS = new CreateDS(this.page);
        this.insertsheet = new InsertSheet(this.page);
        this.coaCreation = new COACreation(this.page);
        this.createMap = new CreateMap(this.page);
        this.createMap1 = new CreateMap1(this.page);
        this.createImport = new CreateImport(this.page);
        this.createImport1 = new CreateImport1(this.page);
        this.inHeaderImportPO = new InHeaderImport(this.page);
        this.appendExistingImportPO = new AppendexistingImport(this.page);
        this.validateImportedValues = new ValidateImportedValues(this.page);
        this.validateGrpImportedvalues = new ValidateGrpImportedValues(this.page);
        this.printcalc = new Printcalc(this.page);
        this.comparePrintfile = new CompareFiles(this.page);
        this.drillDownPO = new DrillDown(this.page);
    }
    loginToLApp(username,password,clientName){
        return this.lowEnvLogin.loginToLApp(username,password,clientName);
    }
    loginToApplication(username,password,clientName){
        return this.prodLogin.loginToApplication(username,password,clientName);
    }   
    createEntity(uniqueEntityName, uniqueShortName, Jurisdiction){
        return this.entCreation.createEntity(uniqueEntityName, uniqueShortName, Jurisdiction);
    }
    filterEntity(Tsid){
        return this.entFilter.filterEntity(Tsid);
    }
    groupEntity(GrpEntityName, Tsid){
        return this.entityGrouping.entityGrouping(GrpEntityName, Tsid);
    }
    addEntityToGroup(GrpEntityName, entityName){
        return this.entToGroup.addEntityToGroup(GrpEntityName, entityName);
    }
    createDataset(DatasetName, GrpEntityName = null, Entities = null){
        return this.createDS.createDataset(DatasetName, GrpEntityName, Entities);
    } 
    
    insertSheet(calculationName, sheetName){
        return this.insertsheet.insertSheet(calculationName, sheetName);
    }
    createCOA(COAName,taxYear){
        return this.coaCreation.createCOA(COAName, taxYear);
    }
    createNewMap(MapName, DatasetName, COAName, ReportingStandard, MapType){
        return this.createMap.createNewMap(MapName, DatasetName, COAName, ReportingStandard, MapType);
    }

    createNewMap1(MapName, DatasetName, COAName, template, ImportType){
        return this.createMap1.createNewMap(MapName, DatasetName, COAName, template, ImportType);
    }

    createNewImport(ImportName, DatasetName, ImportType, uniqueEntityName){
        return this.createImport.createNewImport(ImportName, DatasetName, ImportType, uniqueEntityName);
    }
    createNewImport1(ImportName, DatasetName, ImportType, EntityName){
        return this.createImport1.createNewImport(ImportName, DatasetName, ImportType, EntityName);
    }  
    
    inHeaderImport(ImportName, DatasetName, ImportType,Importpath){
        return this.inHeaderImportPO.inHeaderImport1(ImportName, DatasetName, ImportType,Importpath);
    }

    appendExistingImport(ImportName, DatasetName, ImportType,Importpath){
        return this.appendExistingImportPO.appendExistingImport(ImportName, DatasetName, ImportType,Importpath);
    }

    validateImport(calculationName, expTurnoverValue, expCostOfSalesValue){
        return this.validateImportedValues.validateImportedValues(calculationName, expTurnoverValue, expCostOfSalesValue);
    }

    validateMultipleImports(entityCalculations){
        return this.validateImportedValues.validateMultipleEntitiesImport(entityCalculations);
    }
    validateGrpImport(calculationName, expTurnoverValue, expCostOfSalesValue){
        return this.validateGrpImportedValues.validateGrpImportedValues(calculationName, expTurnoverValue, expCostOfSalesValue);
    }

    printcalculation(CalculationName){
        return this.printcalc.printcalculation(CalculationName);
    }

    compareFiles(calculationName, buffer, expectedPdfPath){
        return this.comparePrintfile.compareFiles(calculationName, buffer, expectedPdfPath);
    }
    validateGrpImportedValues(GroupCalculation, EntityName, expEntityValue, expTotalValue){
        return this.validateGrpImportedvalues.validateGrpImportedValues(GroupCalculation, EntityName, expEntityValue, expTotalValue);
    }
    drillDown(LineItemAmount, LineitemName, DrillDownAmount){
        return this.drillDownPO.verifyDrilldown(LineItemAmount, LineitemName, DrillDownAmount);
    }


}

// At the end of POManager.js
export { POManager };