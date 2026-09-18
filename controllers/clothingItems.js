const ClothingItem = require("../models/clothingItems");
const BadRequestError = require("../errors/BadRequestError");
const ForbiddenError = require("../errors/ForbiddenError");
const NotFoundError = require("../errors/NotFoundError");

const handleItemRequestError = (err, next) => {
  if (err.statusCode) {
    return next(err);
  }

  if (err.name === "CastError") {
    return next(new BadRequestError("Invalid item ID."));
  }

  if (err.name === "DocumentNotFoundError") {
    return next(new NotFoundError("Item not found."));
  }

  return next(err);
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch(next);
};

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid item data."));
      }

      return next(err);
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  return ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (!item.owner.equals(req.user._id)) {
        throw new ForbiddenError(
          "You do not have permission to delete this item."
        );
      }

      return item.deleteOne().then(() => res.status(200).send(item));
    })
    .catch((err) => handleItemRequestError(err, next));
};

const likeItem = (req, res, next) => {
  const { itemId } = req.params;

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => res.status(200).send(item))
    .catch((err) => handleItemRequestError(err, next));
};

const dislikeItem = (req, res, next) => {
  const { itemId } = req.params;

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => res.status(200).send(item))
    .catch((err) => handleItemRequestError(err, next));
};

module.exports = {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
