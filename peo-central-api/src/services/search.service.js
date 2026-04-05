const { Users, Role, Companies, Documents, Leads, Onboardings, Offboardings } = require('../models');

exports.searchAllCollections = async (searchValue, module) => {
    const regex = new RegExp(searchValue, 'i');
    const collectionSchemas = [
        { schemaName: Users.schema, modelName: Users, concatKeys: ["first_name", "last_name"] },
        { schemaName: Companies.schema, modelName: Companies },
        { schemaName: Role.schema, modelName: Role },
        { schemaName: Documents.schema, modelName: Documents },
        { schemaName: Leads.schema, modelName: Leads },
        { schemaName: Onboardings.schema, modelName: Onboardings },
        { schemaName: Offboardings.schema, modelName: Offboardings },
    ];
    let selectedSchema;
    collectionSchemas.map(schema => {
        if (module === schema.modelName.modelName) {
            selectedSchema = schema;
        }
    });
    const matchPipeline = [
        {
            $match: {
                $or: Object.keys(selectedSchema.schemaName.paths)
                    .map(key => ({ [key]: regex }))
            }
        }
    ];
    const searchResults = await selectedSchema.modelName.aggregate(matchPipeline).exec();
    return searchResults;
};