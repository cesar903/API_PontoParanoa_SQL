const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Acesso negado! Token ausente ou mal formatado." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Aqui você pode acessar: req.user.id, req.user.role, etc.
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token inválido ou expirado!" });
  }
};

module.exports = authMiddleware;
