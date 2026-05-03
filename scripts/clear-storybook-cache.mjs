import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.join(__dirname, "..");

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function rmPath(dir) {
    for (let attempt = 0; attempt < 10; attempt++) {
        try {
            await fs.promises.rm(dir, { recursive: true, force: true });
            return true;
        } catch (err) {
            const code = /** @type {NodeJS.ErrnoException} */ (err).code;
            if (code === "ENOENT") {
                return true;
            }
            if (attempt === 9) {
                console.warn(
                    `[clear-storybook-cache] Could not remove ${dir}: ${err.message}\n` +
                        "If Storybook still fails, close other Node/Storybook processes or exclude the cache folder from real-time antivirus scan."
                );
                return false;
            }
            await sleep(100 + attempt * 75);
        }
    }
    return false;
}

/**
 * @param {string} [projectRoot] – ریشهٔ پروژه (پیش‌فرض: یک سطح بالاتر از scripts)
 */
export async function clearStorybookCache(projectRoot = defaultRoot) {
    const root = path.resolve(projectRoot);
    const cacheDirNodeModules = path.join(root, "node_modules", ".cache", "storybook");
    const cacheDirProject = path.join(root, ".storybook-cache", "storybook");
    await rmPath(cacheDirProject);
    await rmPath(cacheDirNodeModules);
}

const entry = process.argv[1] && path.resolve(process.argv[1]);
const isMain = Boolean(entry && import.meta.url === pathToFileURL(entry).href);
if (isMain) {
    await clearStorybookCache();
}
