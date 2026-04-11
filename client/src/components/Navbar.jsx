import { useState, useEffect, useRef } from "react";
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
  const [graphsOpen, setGraphsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setGraphsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <Link to="/map" className={styles.link}>
            {s.navMap}
          </Link>
          <div className={styles.dropdown} ref={dropdownRef}>
            <button
              type="button"
              className={`${styles.link} ${styles.dropdownToggle}`}
              onClick={() => setGraphsOpen((o) => !o)}
              aria-expanded={graphsOpen}
            >
              {s.navGraphs ?? "Graphs"} ▾
            </button>
            {graphsOpen && (
              <div className={styles.dropdownMenu}>
                <Link
                  to="/graphs/addictions"
                  className={styles.dropdownItem}
                  onClick={() => setGraphsOpen(false)}
                >
                  {s.navGraphAddictions}
                </Link>
                <Link
                  to="/graphs/israel"
                  className={styles.dropdownItem}
                  onClick={() => setGraphsOpen(false)}
                >
                  {s.navGraphIsrael}
                </Link>
                <Link
                  to="/graphs/health"
                  className={styles.dropdownItem}
                  onClick={() => setGraphsOpen(false)}
                >
                  {s.navGraphHealth}
                </Link>
                <Link
                  to="/graphs/sleep"
                  className={styles.dropdownItem}
                  onClick={() => setGraphsOpen(false)}
                >
                  {s.navGraphSleep}
                </Link>
              </div>
            )}
          </div>
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
        </nav>
      </div>
    </header>
  );
}
