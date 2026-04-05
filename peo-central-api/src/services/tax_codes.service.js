const { TaxCodes } = require("../models")

const findTaxCodeById = async(id)=>{
    try{
        const taxCode = await TaxCodes.findById(id);
        if(!taxCode) throw new Error(`Could not find tax code with the provided id: ${id}`);
        return taxCode;
    }catch(error){
        throw new Error(error);
    }
}
const listAllTaxCodes = async () => {
    try{
        const result = await TaxCodes.find({is_deleted: 0});
        return result
    }catch(error){
        throw new Error(error);
    }
}

const createTaxCode = async(reqBody)=>{
    try{
        const newTaxCode = await TaxCodes.create(reqBody);
        return newTaxCode;
    }catch(error){
        throw new Error(error);
    }
};

const deleteTaxCode = async(taxId)=>{
    try{
        const tax = await findTaxCodeById(taxId);
        tax.is_deleted = 1;
        await tax.save();
        return true;
    }catch(error){
        throw new Error(error);
    }
};

const updateTaxCode = async(reqBody, taxId)=>{
    try{
    const tax = await findTaxCodeById(taxId);
    const updates = Object.keys(reqBody);
    updates.forEach((update)=>{
        tax[update] = reqBody[update];
    });
    await tax.save();
    return tax;
    }catch(error){
        throw new Error(error);
    }
}

module.exports = {
    listAllTaxCodes,
    createTaxCode,
    updateTaxCode,
    deleteTaxCode,
    findTaxCodeById
}