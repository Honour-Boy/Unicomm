const admin = require("../config/firebaseAdmins");

const signIn = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or invalid" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log(`Verified ID token for user: ${uid}`);

    const customToken = await admin.auth().createCustomToken(uid);

    res.status(200).json({ token: customToken });
  } catch (error) {
    console.error("Error verifying ID token:", error.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { signIn };