import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateRoot = path.join(
    root,
    "node_modules",
    "@keycloakify",
    "login-ui-storybook",
    "keycloak-theme",
    "login",
    "pages"
);
const destRoot = path.join(root, "src", "login", "pages");

async function exists(p) {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

async function restore() {
    if (!(await exists(templateRoot))) {
        console.warn(
            "[restore-login-stories] Template not found (skipped):",
            templateRoot
        );
        return;
    }

    let count = 0;

    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) {
                await walk(full);
            } else if (ent.name === "Page.stories.tsx") {
                const rel = path.relative(templateRoot, full);
                const dest = path.join(destRoot, rel);
                await fs.mkdir(path.dirname(dest), { recursive: true });
                await fs.copyFile(full, dest);
                count++;
            }
        }
    }

    await walk(templateRoot);
    console.log(
        `[restore-login-stories] Restored ${count} Page.stories.tsx file(s) from @keycloakify/login-ui-storybook.`
    );
}

await restore();
