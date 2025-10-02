const { requireAdmin } = require("../_lib/auth.js");
const { json, error } = require("../_lib/respond.js");
const path = require("path");
const { execFile } = require("child_process");

module.exports = async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const admin = await requireAdmin(req, res);
  if (!admin) return; // response already sent
  try {
    const script = path.join(process.cwd(), "scripts", "migrate.js");
    execFile(
      process.execPath,
      [script],
      { env: process.env },
      (err, stdout, stderr) => {
        if (err) {
          return error(res, "Migration failed", 500, {
            detail: stderr || err.message,
          });
        }
        return json(res, {
          status: "ok",
          output: stdout.split("\n").slice(-10),
        });
      },
    );
  } catch (e) {
    return error(res, "Migration trigger error", 500, { detail: e.message });
  }
};
