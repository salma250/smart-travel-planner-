exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '')
    return res.status(400).json({ error: 'Name is required' });

  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!email || !emailRegex.test(email))
    return res.status(400).json({ error: 'Valid email is required' });

  if (!password || typeof password !== 'string' || password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  next();
};

exports.validateTrip = (req, res, next) => {
  const { destination, budget, days } = req.body;
  if (!destination || typeof destination !== 'string' || destination.trim() === '')
    return res.status(400).json({ error: 'Destination is required' });

  const b = Number(budget);
  if (Number.isNaN(b) || b <= 0)
    return res.status(400).json({ error: 'Budget must be a number greater than 0' });

  const d = Number(days);
  if (!Number.isInteger(d) || d <= 0)
    return res.status(400).json({ error: 'Days must be an integer greater than 0' });

  next();
};
