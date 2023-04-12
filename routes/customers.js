const yup = require('yup');
const express = require("express");

const router = express.Router();
const { Customer } = require('../models/index');
const ObjectId = require('mongodb').ObjectId;
// const { write } = require('../helpers/FileHelper');
// let data = require('../data/customers.json');

// const fileName = './data/customers.json';
// router.get("/", function (req, res, next) {
//   res.send(data);
// });
// router.get("/:id", function (req, res, next) {
//   const validationSchema = yup.object().shape({
//     params: yup.object({
//       id: yup.number(),
//     }),
//   });
//   validationSchema
//     .validate({ params: req.params }, { abortEarly: false })
//     .then(() => {
//       const id = req.params.id;
//       let found = data.find((x) => x.id == id);
//       if (found) {
//         return res.send({ ok: true, result: found });
//       }

//       return res.send({ ok: false, message: "Object not found" });
//     })
//     .catch((err) => {
//       return res
//         .status(400)
//         .json({
//           type: err.name,
//           errors: err.errors,
//           message: err.message,
//           provider: "yup",
//         });
//     });
// });


// 
router.get('/', async (req, res, next) => {
  try {
    let results = await Customer.find();
    res.send(results);
  } catch (err) {
    res.sendStatus(500);
  }
});
router.get('/:id', async function (req, res, next) {
  // Validate
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup.string().test('Validate ObjectID', '${path} is not valid ObjectID', (value) => {
        return ObjectId.isValid(value);
      }),
    }),
  });

  validationSchema
    .validate({ params: req.params }, { abortEarly: false })
    .then(async () => {
      const id = req.params.id;

      let found = await Customer.findById(id);

      if (found) {
        return res.send({ ok: true, result: found });
      }

      return res.send({ ok: false, message: 'Object not found' });
    })
    .catch((err) => {
      return res.status(400).json({ type: err.name, errors: err.errors, message: err.message, provider: 'yup' });
    });
});
router.post('/', async function (req, res, next) {
  // Validate
  const validationSchema = yup.object({
    body: yup.object({
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      phoneNumber: yup.string().max(50).required(),
      address: yup.string().max(500),
      email: yup.string().max(100),
      birthday: yup.date(),


    }),
  });

  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const data = req.body;
        const newItem = new Customer(data);
        let result = await newItem.save();

        return res.send({ ok: true, message: 'Created', result });
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    })
    .catch((err) => {
      return res.status(400).json({ type: err.name, errors: err.errors, provider: 'yup' });
    });
});

// Delete data
router.delete("/:id", function (req, res, next) {
  const id = req.params.id;
  data = data.filter((x) => x.id != id);
  write(fileName, data);
  res.send({ ok: true, message: "Deleted" });
});

router.patch("/:id", function (req, res, next) {
  const id = req.params.id;
  const patchData = req.body;

  let found = data.find((x) => x.id == id);

  if (found) {
    for (let propertyName in patchData) {
      found[propertyName] = patchData[propertyName];
    }
  }
  write(fileName, data);
  res.send({ ok: true, message: "Updated" });
});

module.exports = router;
