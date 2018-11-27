const express = require('express');

const router = express.Router();

router.get('/current_user', (req, res) => {
  res.send(req.user);
});

module.exports = router;
