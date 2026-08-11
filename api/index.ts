import * as dotenv from "dotenv";
dotenv.config();

export default async function (req, res) {
  try {
    // Dynamically import the app to catch initialization errors
    const { app } = await import("../src/app.js");
    return app(req, res);
  } catch (error) {
    console.error("Vercel Serverless Initialization Error:", error);
    res.status(500).json({ 
      error: "Server Initialization Error", 
      details: error.message,
      stack: error.stack 
    });
  }
}
