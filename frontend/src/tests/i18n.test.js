// Exercises the i18n config in lib/i18n.js: catalog lookup, French translation,
// fallback to English for languages without a catalog, and RTL direction.
import i18n from "@/lib/i18n";

test("resolves an English string", async () => {
  await i18n.changeLanguage("en");
  expect(i18n.t("login.signIn")).toBe("Sign in");
  expect(document.documentElement.dir).toBe("ltr");
});

test("translates into French", async () => {
  await i18n.changeLanguage("fr");
  expect(i18n.t("login.signIn")).toBe("Se connecter");
});

test("flips <html dir> to rtl for Arabic", async () => {
  await i18n.changeLanguage("ar");
  expect(i18n.t("login.signIn")).toBe("تسجيل الدخول");
  expect(document.documentElement.dir).toBe("rtl");
});

test("falls back to English for a language without a catalog", async () => {
  await i18n.changeLanguage("de");
  expect(i18n.t("login.signIn")).toBe("Sign in");
});

test("localizes the chat/settings surfaces (PR2 namespaces)", async () => {
  await i18n.changeLanguage("fr");
  expect(i18n.t("settings.editProfile")).toBe("Modifier le profil");
  expect(i18n.t("chat.send")).toBe("Envoyer");
  // Interpolation still works in a translated string.
  expect(i18n.t("chat.translatedTo", { lang: "anglais" })).toBe(
    "Traduit en anglais"
  );
});
