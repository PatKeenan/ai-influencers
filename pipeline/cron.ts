/**
 * Cron scheduler — runs the feed check pipeline at 3 AM ET daily.
 *
 * Usage:  bun pipeline/cron.ts
 */

import { CronJob } from "cron";
import { execFileSync } from "child_process";

const job = new CronJob(
  "0 3 * * *", // 3 AM daily
  async () => {
    console.log(`[${new Date().toISOString()}] Running nightly feed check...`);
    try {
      execFileSync("bun", ["pipeline/check-feeds.ts"], {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (err) {
      console.error("Feed check failed:", err);
    }
  },
  null,
  false,
  "America/New_York"
);

job.start();
console.log("Cron scheduler started. Next run:", job.nextDate().toISO());

// Keep process alive
process.on("SIGINT", () => {
  job.stop();
  process.exit(0);
});
