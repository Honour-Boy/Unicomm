import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Ensure the correct path to firebase.js
import { create } from "zustand";
import i18n, { UI_LANGUAGES } from "@/lib/i18n";

// Language-first: align the UI language with the user's stored preference on
// load — but only if they haven't explicitly chosen a UI language already
// (the switcher persists that to localStorage as `uiLang`). Falls through
// silently for languages without a catalog (i18n falls back to English).
const syncUiLanguage = (language) => {
  try {
    const explicit =
      typeof localStorage !== "undefined" && localStorage.getItem("uiLang");
    if (!explicit && language && UI_LANGUAGES.includes(language)) {
      i18n.changeLanguage(language);
    }
  } catch {
    /* localStorage/i18n unavailable — ignore */
  }
};

const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,

  fetchUserInfo: async (uid) => {
    if (!uid) {
      set({ currentUser: null, isLoading: false });
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        set({ currentUser: data, isLoading: false });
        syncUiLanguage(data.language);
      } else {
        console.error("No such document!");
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
      set({ currentUser: null, isLoading: false });
    }
  },

  clearUserInfo: () => {
    set({ currentUser: null, isLoading: false });
  },
}));

export default useUserStore;
