import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import { getUiStrings } from "../../config/uiStrings.js";
import { AUTH_TOKEN_KEY, USER_ID_KEY } from "../../config/storageKeys.js";
import { useDirection } from "../../context/useDirection.js";
import { getResult, loginUser } from "../../utils/api.js";
import styles from "./AuthForm.module.css";

function pickErrors(data, unexpectedLabel) {
  if (!data) return [unexpectedLabel];
  if (Array.isArray(data.errors)) return data.errors;
  if (typeof data.error === "string") return [data.error];
  if (typeof data.message === "string") return [data.message];
  return [unexpectedLabel];
}

async function resolveRedirectTarget() {
  const userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) return { path: "/" };

  const { res, data } = await getResult(userId);
  if (res.ok && data?.completed && data?.score != null) {
    return { path: "/results", state: { score: Number(data.score) } };
  }
  return { path: "/" };
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useDirection();
  const s = getUiStrings(locale);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const successText = useMemo(() => {
    if (typeof location.state?.success === "string")
      return location.state.success;
    return "";
  }, [location.state]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    try {
      const { res, data } = await loginUser(email.trim(), password);
      if (!res.ok) {
        setErrors(pickErrors(data, s.authUnexpectedError));
        return;
      }
      if (typeof data?.token !== "string" || !data.token) {
        setErrors([s.authTokenMissing]);
        return;
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      const target = await resolveRedirectTarget();
      navigate(target.path, { replace: true, state: target.state });
    } catch {
      setErrors([s.authNetworkError]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main} lang={locale}>
        <section className={styles.card}>
          <h1 className={styles.title}>{s.authLoginTitle}</h1>

          {successText && (
            <div className={styles.successBox}>{successText}</div>
          )}

          {errors.length > 0 && (
            <div className={styles.errorBox} role="alert">
              <ul className={styles.errorList}>
                {errors.map((err, idx) => (
                  <li key={`${err}-${idx}`}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.label} htmlFor="login-email">
              {s.authEmail}
            </label>
            <input
              id="login-email"
              className={styles.input}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className={styles.label} htmlFor="login-password">
              {s.authPassword}
            </label>
            <input
              id="login-password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className={styles.button}
              type="submit"
              disabled={submitting}
            >
              {submitting ? s.authSubmittingLogin : s.authSubmitLogin}
            </button>
          </form>

          <p className={styles.row}>
            {s.authNoAccount}{" "}
            <Link className={styles.link} to="/auth/register">
              {s.navSignUp}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
