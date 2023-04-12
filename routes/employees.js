const yup = require('yup');
const express = require("express");
const passport = require('passport');
const router = express.Router();
// const { write } = require('../helpers/FileHelper');
// let data = require('../data/employees.json');
// const Employee = require('../models/Employee');
const { Employee } = require('../models/index');
const ObjectId = require('mongodb').ObjectId;
const encodeToken = require('../helpers/jwtHelper');
const { validateSchema, loginSchema, categorySchema } = require('../validation/employee');



// const fileName = './data/employees.json';
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


// router.post("/", function (req, res, next) {
//   // Validate
//   const validationSchema = yup.object({
//     body: yup.object({
//       FirstName: yup.string().required(),
//       LastName: yup.string().required(),
//       PhoneNumber: yup.string().max(50).required(),
//       address: yup.string().max(500),
//       email: yup.string().max(100),
//       Birthday: yup.string(),
      
//     }),
//   });

//   validationSchema
//     .validate({ body: req.body }, { abortEarly: false })
//     .then(() => {
//       const newItem = req.body;

//       // Get max id
//       let max = 0;
//       data.forEach((item) => {
//         if (max < item.id) {
//           max = item.id;
//         }
//       });

//       newItem.id = max + 1;

//       data.push(newItem);

//       // Write data to file
//       write(fileName, data);

//       res.send({ ok: true, message: "Created" });
//     })
//     .catch((err) => {
//       return res
//         .status(400)
//         .json({ type: err.name, errors: err.errors, provider: "yup" });
//     });
// });

router.post('/login', validateSchema(loginSchema), passport.authenticate('local', {session: false}), async (req, res, next) => {
  try {
    const { _id, email, firstName, lastName} = req.user;

    const token = encodeToken(_id, email, firstName, lastName);

    res.status(200).json({
      token,
      payload: req.user,
    });
  } catch (err) {
    res.status(401).json({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }
});

router.get('/profile',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      console.log('req.user', req.user)

      const employee = await Employee.findById(req.user._id);

      if (!employee) return res.status(404).send({ message: 'Not found' });

      res.status(200).json(employee);
    } catch (err) {
      res.sendStatus(500);
    }
  },
);



router.get('/', async (req, res, next) => {
  try {
    let results = await Employee.find();
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

      let found = await Employee.findById(id);

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
        const newItem = new Employee(data);
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

router.delete("/:id", function (req, res, next) {
  const id = req.params.id;
  data = data.filter((x) => x.id != id);
  write(fileName, data);
  res.send({ ok: true, massage: "DELETE" });
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
