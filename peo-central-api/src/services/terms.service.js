const { Terms } = require("../models")

const listAllTerms = async () => {
    const result = await Terms.find();
    return result
}

const termOnName = async () => {
    const result = await Terms.find({ name: { $regex: /^custom$/i } });
    return result;
  };

const createNewTerm = async (data) => {
    try{
        const result = await Terms.create(data);
    return result
    }catch(error){
        throw error
    }
}



module.exports = {
    listAllTerms,
    termOnName,
    createNewTerm
}