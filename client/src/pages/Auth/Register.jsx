import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import { getUiStrings } from "../../config/uiStrings.js";
import { useDirection } from "../../context/useDirection.js";
import { registerUser } from "../../utils/api.js";
import styles from "./AuthForm.module.css";

function pickErrors(data, unexpectedLabel) {
  if (!data) return [unexpectedLabel];
  if (Array.isArray(data.errors)) return data.errors;
  if (typeof data.error === "string") return [data.error];
  if (typeof data.message === "string") return [data.message];
  return [unexpectedLabel];
}

export default function Register() {
  const navigate = useNavigate();
  const { locale } = useDirection();
  const s = getUiStrings(locale);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    try {
      const { res, data } = await registerUser(email.trim(), password);
      if (!res.ok) {
        setErrors(pickErrors(data, s.authUnexpectedError));
        return;
      }
      navigate("/auth/login", {
        replace: true,
        state: {
          success:
            typeof data?.message === "string"
              ? data.message
              : s.authRegisterSuccessDefault,
        },
      });
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
          <h1 className={styles.title}>{s.authRegisterTitle}</h1>
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
            <label className={styles.label} htmlFor="register-email">
              {s.authEmail}
            </label>
            <input
              id="register-email"
              className={styles.input}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className={styles.label} htmlFor="register-password">
              {s.authPassword}
            </label>
            <input
              id="register-password"
              className={styles.input}
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className={styles.button}
              type="submit"
              disabled={submitting}
            >
              {submitting ? s.authSubmittingRegister : s.authSubmitRegister}
            </button>
          </form>

          <p className={styles.row}>
            {s.authHasAccount}{" "}
            <Link className={styles.link} to="/auth/login">
              {s.navLogin}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
