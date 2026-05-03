/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/account";
import type { ThemeName } from "../kc.gen";
import accountMessagesFa from "./messagesFa";

/**
 * زبان «fa» در مجموعهٔ پیش‌فرض تم Account نیست؛ با extraLanguages بارگذاری می‌شود.
 * @see https://docs.keycloakify.dev/features/i18n
 */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withExtraLanguages({
        fa: {
            label: "فارسی",
            getMessages: () => Promise.resolve({ default: accountMessagesFa })
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
