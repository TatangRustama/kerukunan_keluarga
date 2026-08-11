const fs = require('fs');

const serverContent = fs.readFileSync('server.ts', 'utf8');

// Create src/app.ts
let appContent = serverContent.replace(
  /async function startServer\(\) \{\n  const app = express\(\);\n  const PORT = 3000;/,
  'export const app = express();'
);

// Remove Vite block and listen block from src/app.ts
appContent = appContent.replace(
  /  \/\/ Vite middleware for development[\s\S]*\}\n\nstartServer\(\);\n?/,
  ''
);

fs.writeFileSync('src/app.ts', appContent);

// Create new server.ts
const newServerContent = `import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { app } from "./src/app.ts";

const PORT = 3000;

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on port \${PORT}\`);
  });
}

startServer();
`;

fs.writeFileSync('server.ts', newServerContent);
