// Dummy data (sementara, nanti ganti DB)
let users = [
  {
    id: 1,
    name: "Farrel",
    email: "farrel@mail.com",
  },
];

// GET /api/users
export const getUsers = async (req, res) => {
  res.status(200).json({
    success: true,
    data: users,
  });
};

// POST /api/users
export const createUser = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name & email required",
    });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    data: newUser,
  });
};
