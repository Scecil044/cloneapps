const { DocumentFolder, Documents } = require('../models');
const { ObjectId } = require('mongodb');

const findFolderById = async (folderId) => {
  try {
    const response = await DocumentFolder.findOne({ is_deleted: false, _id: ObjectId(folderId) });

    if (!response) {
      throw new Error("Folder not found");
    }
    response.files = response.files.filter(file => !file.is_deleted);

    return response;
  } catch (error) {
    throw new Error(error?.message);
  }
};



const createDocumentsFolder = async (reqBody, userId) => {
  try {
    reqBody = { ...reqBody, createdBy: new ObjectId(userId) };
    if(reqBody.company_id){
      reqBody = {...reqBody, isClientFolder: true}
    }
    const newDocumentsFolder = await DocumentFolder.create(reqBody);
    if (Array.isArray(reqBody.files) && reqBody.files.length > 0) {
      reqBody.files = reqBody.files.map((file) => ({
        _id: new ObjectId(),
        folder_id: newDocumentsFolder._id,
        link: file,
        is_deleted: false,
        created_at: new Date(),
        created_by: new ObjectId(userId),
      }));
    }
    newDocumentsFolder.files = reqBody.files;
    newDocumentsFolder.totalFiles = reqBody.files.length; 
    if(reqBody.company_id){
      newDocumentsFolder.client_id = new ObjectId(reqBody.company_id);
    }
    await newDocumentsFolder.save();

    return newDocumentsFolder;
  } catch (error) {
    console.error("Error creating document folder:", error);
    throw new Error(error?.message);
  }
};


const getDocumentsFolders = async (reqQuery) => {
  try {
    const filter = {
      is_deleted: false
    }
    const options = {
      limit: reqQuery.limit ? parseInt(reqQuery.limit) : 10,
      page: reqQuery.page ? parseInt(reqQuery.page) : 1,
      sortBy: reqQuery.sortBy || 'createdAt:-1',
    }
    const body = [
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'clientDetails'
        }
      },
      {
        $unwind:{
            path:"$clientDetails",
            preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
            folder_name:1,
            company_name: {$ifNull: ["$clientDetails.company_name", ""]},
            _id:1,
            files:1,
            totalFiles:1,
            createdAt:1,
            updatedAt:1,
            isClientFolder:1,
            client_id:1
        }
      }
    ];
   // Support for both company_id and client_id in the query
   if(reqQuery.company_id){
    filter.client_id = ObjectId(reqQuery.company_id)
   }
   if(reqQuery.client_id){
    filter.client_id = ObjectId(reqQuery.client_id)
   }
   
   // Filter by isClientFolder if provided
   if(reqQuery.isClientFolder !== undefined) {
    filter.isClientFolder = reqQuery.isClientFolder === 'true'
   }

   if (reqQuery.search) {
    body.push({
      $match: {
        $or: [
          { folder_name: { $regex: reqQuery.search, $options: 'i' } },
          { "clientDetails.company_name": { $regex: reqQuery.search, $options: 'i' } }
        ]
      }
    });
  }
    const response = await DocumentFolder.paginateLookup(filter, options, body);
    if (response.results && response.results.length) {
      response.results = response.results.map(folder => ({
        ...folder,
        files: folder.files.filter(file => !file.is_deleted)
      }));
    }
    return response;
  } catch (error) {
    console.log(error);
    throw new Error(error?.message);
  }
};

const updateDocumentsFolder = async (folderId, reqBody, userId) => {
  try {
    const isFolder = await findFolderById(folderId);
    if (!isFolder) {
      throw new Error("Folder not found");
    }

    const updates = Object.keys(reqBody);
    updates.forEach((update) => {
      if (update !== "files") {
        isFolder[update] = reqBody[update];
      }
    });

    if (Array.isArray(reqBody.files) && reqBody.files.length > 0) {
      const existingLinks = new Set(isFolder.files.map((file) => file.link));

      const newFiles = reqBody.files.filter((file) => !existingLinks.has(file))
        .map((file) => ({
          _id: new ObjectId(),
          folder_id: isFolder._id,
          link: file,
          is_deleted: false,
          created_at: new Date(),
          created_by: new ObjectId(userId),
        }));

      if (newFiles.length > 0) {
        isFolder.files.push(...newFiles);
      }
    }
    isFolder.totalFiles = isFolder.files.length;
    isFolder.updatedBy = new ObjectId(userId);

    await isFolder.save();
    isFolder.files = isFolder.files.filter((item) => !item.is_deleted);
    return isFolder;
  } catch (error) {
    console.error("Error updating document folder:", error);
    throw new Error(error?.message);
  }
};


const fetchFolderDocuments = async (folderId, userId) => {
  try {
    const filter = {
      _id: new ObjectId(folderId),
      is_deleted: false,
    };

    const options = {
      sortBy: "created_at:desc",
    };

    const isFolder = await DocumentFolder.paginate(filter, options);

    if (!isFolder || !isFolder.results.length) {
      throw new Error(`No such folder with the provided id was found`);
    }

    const modifiedResults = isFolder.results.map((folder) => ({
      _id: folder._id,
      folder_name: folder.folder_name,
      createdBy: folder.createdBy,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      __v: folder.__v,
      files: folder.files,
    }));

    return {
      results: modifiedResults,
      page: isFolder.page,
      limit: isFolder.limit,
      totalPages: isFolder.totalPages,
      totalResults: isFolder.totalResults,
    };
  } catch (error) {
    throw new Error(error?.message);
  }
};


const deleteDocumentsFolder = async (folderId, userId) => {
  try {
    const isFolder =await DocumentFolder.findById(folderId);
    if(!isFolder) throw new Error(`No folder found with matching id`)
    isFolder.is_deleted = true;
    isFolder.updatedBy = userId;
    isFolder.deletedBy = userId;
    await isFolder.save();
    return isFolder;
  } catch (error) {
    throw new Error(error?.message);
  }
};

const markFileAsDeleted = async (folderId, fileId, userId) => {
  try {
    const folder = await DocumentFolder.findOne({ _id: folderId, is_deleted: false });

    if (!folder) {
      throw new Error("Folder not found or has been deleted.");
    }

    const file = folder.files.find((file) => file._id.toString() === fileId);

    if (!file) {
      throw new Error("File not found in the folder.");
    }

    file.is_deleted = true;
    file.deletedBy = userId; 
    folder.updatedAt = new Date();

    folder.markModified("files");
    await folder.save();

    return {
      ...folder.toObject(),
      files: folder.files.filter((file) => !file.is_deleted), 
    };
  } catch (error) {
    throw new Error(error.message || "An error occurred while deleting the file.");
  }
};


module.exports = {
  deleteDocumentsFolder,
  updateDocumentsFolder,
  getDocumentsFolders,
  createDocumentsFolder,
  fetchFolderDocuments,
  findFolderById,
  markFileAsDeleted
};
