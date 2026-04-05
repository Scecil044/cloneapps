const ApiError = require('../utils/ApiError');

function pagination(items, page = 1, pageSize = 10, sortBy = [], sortOrder = 'asc') {
    const sortedItems = sortBy.length ? items.sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      let comparison = 0;
      for (let i = 0; i < sortBy.length; i++) {
        const field = sortBy[i];
        if (a[field] < b[field]) {
          comparison = -1;
          break;
        } else if (a[field] > b[field]) {
          comparison = 1;
          break;
        }
      }
      return comparison * order;
    }) : items;
  
    const totalItems = sortedItems.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const currentPageItems = sortedItems.slice(startIndex, endIndex);
  
    return sortedItems.slice(startIndex, endIndex)
    // return {
    //   currentPageItems,
    //   totalPages: Math.ceil(totalItems / pageSize),
    //   currentPage: page,
    //   totalItems,
    //   pageSize,
    //   sortBy,
    //   sortOrder
    // };
  }
    
  module.exports = pagination;
