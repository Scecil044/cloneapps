const express = require('express');
const router = express.Router();
const SocialsModel = require('../../models/socials');
const fcm = require('../../helpers/push_notification');
const NotificationHelper = require('../../helpers/notification_helper');

/**
 * * GET ALL socials
 */
// Get socials for Today - All Users

router.get('/all', async (req, res) => {
  const id = req.params._id;

  try {
    const socials = await SocialsModel.find({}).sort({ date: -1 });
    res.json(socials);
  } catch (err) {
    res.json({ message: err.message });
  }
});

// get active socials only
router.get('/active-all', async (req, res) => {
  const id = req.params._id;

  try {
    const socials = await SocialsModel.find({ status: 'Active' }).sort({ date: -1 });
    res.json(socials);
  } catch (err) {
    res.json({ message: err.message });
  }
});

/**
 * * GET 15 socials
 */
// Get socials for Today - All Users

router.get('/getsocials', async (req, res) => {
  const id = req.params._id;

  try {
    const socials = await SocialsModel.find({}).limit(15).sort({ dateCreated: -1 });
    res.json(socials);
  } catch (err) {
    res.json({ message: err.message });
  }
});
/**
 * * CREATE NEW socials
 */
router.post('/new', async (req, res) => {
  console.log('*******');

  delete req.body.feed['first_name'];
  delete req.body.feed['last_name'];
  delete req.body.feed['imageUrl'];
  delete req.body._id;

  console.log(req.body);
  const socials = SocialsModel({ ...req.body });
  try {
    const newsocials = await socials.save();
    var companyId = req.headers.company_id;
    var user_name = req.headers.user_name;
    var user_id = req.headers.user_id;

    // user_name
    // console.log(companyId)
    var notification_type = 'New Social Post!';
    var notification_text = 'New post from ' + user_name + '!';
    var type2 = 'New Social Post!';

    console.log('*************');

    fcm.push(companyId, notification_type, notification_text, {
      type: notification_type,
      data: type2,
    });
    // var rest = await NotificationHelper.saveNotification(

    //     user_id,

    //     user_id,

    //     notification_text,

    //     notification_type,

    //     "",
    //     type2,
    //     ""

    // );
    // console.log(rest);
    res.json(newsocials);
  } catch (err) {
    res.send({ message: err.message });
  }
});

/**
 * * UPDATE socials
 * @param _id - socials db id
 */
router.put('/update/:_id', async (req, res) => {
  const id = req.params._id;
  const filter = { _id: id };
  var type2 = 'Social notification';
  var not_text;
  if (req.body.type == 'like') {
    not_text = `${req.body.name} liked your post.`;
  } else if (req.body.type == 'comment') {
    not_text = `${req.body.name} commented on your post.`;
  } else {
    not_text = `${req.body.name} liked your comment.`;
  }
  try {
    const socials = await SocialsModel.findOneAndUpdate(filter, { ...req.body.body }, { new: true });
    if (req.body.body.feed.created_by != req.body.userId) {
      if (req.body.type == 'like' || req.body.type == 'comment' || req.body.type == 'comm-like') {
        var rest = await NotificationHelper.saveNotification(
          req.body.userId,

          [req.body.body.feed.created_by],

          not_text,

          '',

          '',
          type2,
          req.body.body._id
        );
        console.log(rest);
      }
    }
    res.json(socials);
  } catch (error) {
    res.json({ message: error.message });
  }
});

/**
 * * DELETE socials
 * @param _id - socials db id
 */
router.delete('/delete/:_id', async (req, res) => {
  const id = req.params._id;
  try {
    const socials = await SocialsModel.findOneAndDelete({ _id: id });
    const response = {
      message: 'Successfully deleted',
    };
    return res.status(200).send(response);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.post('/get_paginated_socials', async (req, res) => {
  try {
    let skipCount = parseInt(req.body.skip);
    let pageLimit = parseInt(req.body.limit);

    let match = { $match: { status: 'Active' } };
    let lookUpUser = {
      $lookup: {
        from: 'users',
        let: {
          user_id: '$user_objectId',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$user_id'] }],
              },
            },
          },
          {
            $project: {
              _id: 0,
              first_name: 1,
              last_name: 1,
              image_url: 1,
            },
          },
        ],
        as: 'array_user',
      },
    };
    let addFields = { $addFields: { user_objectId: { $toObjectId: '$feed.created_by' } } };
    let unwind = { $unwind: '$array_user' };
    const requests = await SocialsModel.aggregate([
      match,
      { $sort: { dateCreated: -1 } },
      { $skip: skipCount },
      { $limit: pageLimit },
      addFields,
      lookUpUser,
      unwind,
      {
        $project: {
          status: 1,
          dateCreated: 1,
          _v: 1,
          feed: {
            text: 1,
            url: 1,
            created_by: 1,
            attachments: 1,
            likes: 1,
            dislikes: 1,
            liked_by: 1,
            disliked_by: 1,
            created_date: 1,
            comments: 1,
            tagged_People: 1,
            first_name: '$array_user.first_name',
            last_name: '$array_user.last_name',
            image_url: '$array_user.image_url',
          },
        },
      },
    ]);
    res.status(200).json(requests);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error);
  }
});

module.exports = router;
