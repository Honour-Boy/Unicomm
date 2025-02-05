const axios = require("axios");

const translate = async (req, res) => {
  const { source_language, target_language, text } = req.body;

  if (!source_language || !target_language || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await axios.post(
      "https://libretranslate.com/translate",
      {
        q: text,
        source: source_language,
        target: target_language,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error during translation:", error.message);
    res.status(500).json({ error: "Translation failed" });
  }
};

module.exports = { translate };