import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import enDefault from "keycloakify/login/i18n/messages_defaultSet/en";

/** `msgStr` is typed with a large union of keys; dynamic keys from the English reverse map use `any` here. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MsgStrFn = (key: any, ...args: any[]) => string;

let exactEnglishToKey: Map<string, string> | undefined;

function getExactEnglishToKeyMap(): Map<string, string> {
    if (exactEnglishToKey !== undefined) {
        return exactEnglishToKey;
    }
    exactEnglishToKey = new Map();
    for (const [key, value] of Object.entries(enDefault)) {
        if (typeof value !== "string") {
            continue;
        }
        if (/\{[0-9]+\}/.test(value)) {
            continue;
        }
        if (!exactEnglishToKey.has(value)) {
            exactEnglishToKey.set(value, key);
        }
    }
    return exactEnglishToKey;
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function htmlToPlainText(html: string): string {
    if (typeof document !== "undefined") {
        const d = document.createElement("div");
        d.innerHTML = html;
        return d.textContent ?? "";
    }
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

/**
 * Match Keycloak server English that was produced from a message template with `{0}`, `{1}`, …
 * placeholders (substituted on the server).
 */
function matchTemplatePlaceholders(
    plain: string,
    template: string
): (string | undefined)[] | null {
    const placeholders: { index: number; start: number; end: number }[] = [];
    const tokenRe = /\{([0-9]+)\}/g;
    let m: RegExpExecArray | null;
    while ((m = tokenRe.exec(template)) !== null) {
        placeholders.push({
            index: parseInt(m[1], 10),
            start: m.index,
            end: m.index + m[0].length
        });
    }
    if (placeholders.length === 0) {
        return null;
    }

    let regex = "^";
    let last = 0;
    const placeholderNumbers: number[] = [];
    for (const ph of placeholders) {
        regex += escapeRegExp(template.slice(last, ph.start));
        regex += "(.+?)";
        placeholderNumbers.push(ph.index);
        last = ph.end;
    }
    regex += escapeRegExp(template.slice(last));
    regex += "$";

    const match = plain.match(new RegExp(regex, "s"));
    if (!match) {
        return null;
    }

    const captures = match.slice(1);
    const maxIdx = Math.max(...placeholderNumbers, 0);
    const argsOrdered: (string | undefined)[] = new Array(maxIdx + 1).fill(undefined);
    captures.forEach((cap, i) => {
        const idx = placeholderNumbers[i];
        argsOrdered[idx] = cap;
    });

    return argsOrdered;
}

function tryResolveWithTemplates(plain: string, msgStr: MsgStrFn): string | null {
    const entries = Object.entries(enDefault).filter(
        ([, v]) => typeof v === "string" && /\{[0-9]+\}/.test(v)
    ) as [string, string][];
    entries.sort((a, b) => b[1].length - a[1].length);

    for (const [key, template] of entries) {
        const args = matchTemplatePlaceholders(plain, template);
        if (args === null) {
            continue;
        }
        try {
            return msgStr(key, ...args);
        } catch {
            continue;
        }
    }
    return null;
}

/**
 * When Keycloak sends the **English** default message text (e.g. wrong locale on the auth session),
 * map it back to the theme i18n key and render **Persian** via `msgStr`.
 */
export function resolveKeycloakServerText(raw: string, msgStr: MsgStrFn): string {
    const plain = htmlToPlainText(raw).replace(/\u00a0/g, " ").trim();
    if (!plain) {
        return raw;
    }

    const key = getExactEnglishToKeyMap().get(plain);
    if (key !== undefined) {
        try {
            return msgStr(key);
        } catch {
            /* fall through */
        }
    }

    const templated = tryResolveWithTemplates(plain, msgStr);
    if (templated !== null) {
        return templated;
    }

    return raw;
}

/** For `dangerouslySetInnerHTML`: translate server English → current locale, then sanitize. */
export function resolveKeycloakServerHtml(raw: string, msgStr: MsgStrFn): string {
    return kcSanitize(resolveKeycloakServerText(raw, msgStr));
}
