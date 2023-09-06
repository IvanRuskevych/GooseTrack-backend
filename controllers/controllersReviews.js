const { ctrlWrapper } = require('../utils');
const { Review } = require('../models/review');

// 1) Get all reviews in the database without authentication.
const getAllReviews = async (req, res) => {
  const { page = 1, limit = 100 } = req.query;
  if (page <= 0) {
    return res.status(400).json({ message: 'Invalid page number' });
  }

  const skip = (page - 1) * limit;

  const reviews = await Review.find({}, '-createdAt -updatedAt', {
    skip,
    limit,
  }).populate('owner', 'name avatarURL');

  res.json(reviews);
};

// 2) Get a user's review by owner ID.
const getUserReview = async (req, res) => {
  const { _id: owner } = req.user;
  const requestedUserId = req.user._id;

  if (!owner.equals(requestedUserId)) {
    return res.status(403).json({ message: "You don't have permission to access this resource" });
  }

  const reviews = await Review.find({ owner: owner }, '-createdAt -updatedAt');

  if (!reviews.length) {
    return res.json(reviews); // Return an empty array with status(200) if no reviews are found.
  }

  res.json(reviews);
};

// 3) Add a review by a user.
const addReview = async (req, res) => {
  const { _id: owner } = req.user;

  const existingReview = await Review.findOne({ owner });

  if (existingReview) {
    return res.status(400).json({ message: 'You can only add one review.' });
  }

  const result = await Review.create({ ...req.body, owner });

  res.status(201).json(result);
};

// 4) Update a user's review by review ID.
const updateReviewById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  const review = await Review.findById(id, '-createdAt -updatedAt');

  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  if (review.owner.equals(owner)) {
    if (review._id.equals(id)) {
      const updatedReview = await Review.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!updatedReview) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      res.json(updatedReview);
    } else {
      res.status(400).json({ error: 'Provided ID does not match the ID in the database' });
    }
  } else {
    res.status(403).json({ error: "You don't have permission to update this review" });
  }
};

// 5) Delete a user's review by review ID.
const deleteReviewById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  const review = await Review.findById(id);

  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  if (review.owner.equals(owner)) {
    if (review._id.equals(id)) {
      const result = await Review.findByIdAndRemove(id);

      if (!result) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      res.json({ message: 'Delete success' });
    } else {
      res.status(400).json({ error: 'Provided ID does not match the ID in the database' });
    }
  } else {
    res.status(403).json({ error: "You don't have permission to delete this review" });
  }
};

module.exports = {
  getAllReviews: ctrlWrapper(getAllReviews),
  getUserReview: ctrlWrapper(getUserReview),
  addReview: ctrlWrapper(addReview),
  deleteReviewById: ctrlWrapper(deleteReviewById),
  updateReviewById: ctrlWrapper(updateReviewById),
};
