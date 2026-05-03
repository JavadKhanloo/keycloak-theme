import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clearStorybookCache } from "./clear-storybook-cache.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await clearStorybookCache(root);

const cacheDir = path.join(root, ".storybook-cache");

const cli = path.join(root, "node_modules", "storybook", "dist", "bin", "dispatcher.js");
const rawArgs = process.argv.slice(2);
const passthrough = [];
const sub = rawArgs[0];
if (sub === "dev" || sub === "build") {
    passthrough.push(sub);
    const rest = rawArgs.slice(1);
    if (!rest.includes("--disable-telemetry")) {
        passthrough.push("--disable-telemetry");
    }
    passthrough.push(...rest);
} else {
    passthrough.push(...rawArgs);
}

const child = spawn(process.execPath, [cli, ...passthrough], {
    stdio: "inherit",
    cwd: root,
    env: {
        ...process.env,
        CACHE_DIR: cacheDir
    }
});

child.on("exit", (code, signal) => {
    process.exit(code ?? (signal ? 1 : 0));
});
