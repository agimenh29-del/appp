module.exports = (req, res) => {
  const config = {
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    SUPABASE_ADMIN_EMAIL: process.env.SUPABASE_ADMIN_EMAIL || "",
    SUPABASE_MEDIA_BUCKET: process.env.SUPABASE_MEDIA_BUCKET || "site-media",
  };

  const payload = [
    `window.SUPABASE_URL = ${JSON.stringify(config.SUPABASE_URL)};`,
    `window.SUPABASE_ANON_KEY = ${JSON.stringify(config.SUPABASE_ANON_KEY)};`,
    `window.SUPABASE_ADMIN_EMAIL = ${JSON.stringify(config.SUPABASE_ADMIN_EMAIL)};`,
    `window.SUPABASE_MEDIA_BUCKET = ${JSON.stringify(config.SUPABASE_MEDIA_BUCKET)};`,
    "",
  ].join("\n");

  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = 200;
  res.end(payload);
};
