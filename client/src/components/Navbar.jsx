import { Link } from "react-router-dom";
import { getUiStrings } from "../config/uiStrings.js";
import { AUTH_TOKEN_KEY } from "../config/storageKeys.js";
import { useDirection } from "../context/useDirection.js";
import styles from "./Navbar.module.css";

function hasAuthToken() {
  try {
    const t = localStorage.getItem(AUTH_TOKEN_KEY);
    return Boolean(t && t.length > 0);
  } catch {
    return false;
  }
}

export default function Navbar() {
  const { locale, setLocale } = useDirection();
  const s = getUiStrings(locale);
  const loggedIn = hasAuthToken();

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          {s.navBrand}
        </Link>
        <nav className={styles.links} aria-label={s.navMain}>
          <div
            className={styles.langGroup}
            role="group"
            aria-label={s.navLanguageGroup}
          >
            <button
              type="button"
              className={`${styles.langBtn} ${
                locale === "he" ? styles.langBtnActive : ""
              }`}
              aria-pressed={locale === "he"}
              onClick={() => setLocale("he")}
            >
              {s.navLangHe}
            </button>
            <button
              type="button"
              className={`${styles.langBtn} ${
                locale === "en" ? styles.langBtnActive : ""
              }`}
              aria-pressed={locale === "en"}
              onClick={() => setLocale("en")}
            >
              {s.navLangEn}
            </button>
          </div>
          <Link to="/" className={styles.link}>
            {s.navQuiz}
          </Link>
          <Link to="/results" className={styles.link}>
            {s.navContent}
          </Link>
          {!loggedIn ? (
            <>
              <Link to="/auth/login" className={styles.authLink}>
                {s.navLogin}
              </Link>
              <Link to="/auth/register" className={styles.authLink}>
                {s.navSignUp}
              </Link>
            </>
          ) : null}
          <a
            href="#"
            className={styles.donate}
            onClick={(e) => e.preventDefault()}
          >
            {s.navDonate}
          </a>
        </nav>
      </div>
    </header>
  );
}
