const { ChartOfAccounts } = require('../models');
const { ObjectId } = require('mongodb');

const getChartOfAccountByCode = async (filter, reqBody, customerId) => {
    const pipeline = [
        {
            $match: filter,
        },
        {
            $project: {
                _id: 1,
                name: 1,
                // account_id: 1,
                code: 1,
                account_name: "$name",
                type: "Invoice",
                account: "$_id",
                city: "Dubai",
                company: 1,
                customer: customerId,
                amount: {
                    $cond: {
                        if: {
                            $eq: ["$code", "SL"]
                        },
                        then: {$ifNull: [reqBody.sub_total, 0]},
                        else: {
                            $cond: {
                                if: {
                                    $eq: ["$code", "VP"]
                                },
                                then: {$ifNull: [reqBody.vat_total, 0]},
                                else: {
                                    $cond: {
                                        if: {
                                            $eq: ["$code", "DC"]
                                        },
                                        then: {$ifNull: [reqBody.discount_total, 0]},
                                        else: {$ifNull: [reqBody.total, 0]}
                                    }
                                }
                            }
                        }
                    }
                },
                debit: {
                    $cond: {
                        if: {
                            $eq: ["$code", "SL"]
                        },
                        then: 0,
                        else: {
                            $cond: {
                                if: {
                                    $eq: ["$code", "VP"]
                                },
                                then: 0,
                                else: {
                                    $cond: {
                                        if: {
                                            $eq: ["$code", "DC"]
                                        },
                                        then: {$ifNull: [reqBody.discount_total, 0]},
                                        else: {$ifNull: [reqBody.total, 0]}
                                    }
                                }
                            }
                        }
                    }
                },
                isDebit: {
                    $cond: {
                        if: {
                            $eq: ["$code", "SL"]
                        },
                        then: false,
                        else: {
                            $cond: {
                                if: {
                                    $eq: ["$code", "VP"]
                                },
                                then: false,
                                else: {
                                    $cond: {
                                        if: {
                                            $eq: ["$code", "DC"]
                                        },
                                        then: true,
                                        else: true
                                    }
                                }
                            }
                        }
                    }
                },
                credit: {
                    $cond: {
                        if: {
                            $eq: ["$code", "SL"]
                        },
                        then: reqBody.sub_total,
                        else: {
                            $cond: {
                                if: {
                                    $eq: ["$code", "VP"]
                                },
                                then: reqBody.vat_total,
                                else: {
                                    $cond: {
                                        if: {
                                            $eq: ["$code", "DC"]
                                        },
                                        then: 0,
                                        else: 0
                                    }
                                }
                            }
                        }
                    }
                },
                isCredit: {
                    $cond: {
                        if: {
                            $eq: ["$code", "SL"]
                        },
                        then: true,
                        else: {
                            $cond: {
                                if: {
                                    $eq: ["$code", "VP"]
                                },
                                then: true,
                                else: {
                                    $cond: {
                                        if: {
                                            $eq: ["$code", "DC"]
                                        },
                                        then: false,
                                        else: false
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    ];
    const result = await ChartOfAccounts.aggregate(pipeline);
    if (result.length > 0) {
        result[0].code = result[0].code || "";
        return result[0];
    } else {
        return null;
    }
};

const getAccountById = async (id) => {
    const account = await ChartOfAccounts.findById(id);
    return account;
  };

  const getChartOfAccountByCustID = async (reqBody) => {
    const result = await ChartOfAccounts.find({"customer": ObjectId(reqBody.customer)});
    if (result.length > 0) {
        result[0].code = result[0].code || "";
        return result[0];
    } else {
        return null;
    }
};

// function to create Chart of Accounts
const createChartOfAccountsWorking = async(accountObj) => {
    try {
        const account = await ChartOfAccounts.create(accountObj);
        if (!account) throw new Error(`Could not create chart of accounts!`);
        return account;
    } catch(error){
        console.log(error);
        throw new Error(error);
    }
}
// Modified createChartOfAccounts function with session support
const createChartOfAccounts = async (accountObj, session = null) => {
    try {
      let account;
      
      if (session) {
        // Use session for transactional operation
        account = new ChartOfAccounts(accountObj);
        account = await account.save({ session });
      } else {
        // Use standard create method when no session is provided
        account = await ChartOfAccounts.create(accountObj);
      }
      
      if (!account) throw new Error(`Could not create chart of accounts!`);
      return account;
    } catch(error) {
      console.log(error);
      throw new Error(error.message || 'Failed to create chart of accounts');
    }
  };

module.exports = {
    getChartOfAccountByCode,
    getAccountById,
    getChartOfAccountByCustID,
    createChartOfAccounts
}  