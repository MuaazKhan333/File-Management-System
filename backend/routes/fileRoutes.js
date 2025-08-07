const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const BASE_PATH = path.join(__dirname, "../../user-files");

router.post("/create-folder", (req, res) => {
  const { name, parentPath = "" } = req.body;
  const fullPath = path.join(BASE_PATH, parentPath, name);

  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      return res.status(201).send({ message: "Folder created" });
    } else {
      return res.status(400).send({ message: "Folder already exists" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Server error", error: err.message });
  }
});

router.post("/create-file", (req, res) => {
  const { name, parentPath = "", content = "" } = req.body;
  const fullPath = path.join(BASE_PATH, parentPath, name);

  try {
    fs.writeFileSync(fullPath, content || "// New file");
    return res.status(201).send({ message: "File created" });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Server error", error: err.message });
  }
});

module.exports = router;
