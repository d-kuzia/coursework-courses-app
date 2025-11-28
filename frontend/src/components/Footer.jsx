import { useI18n } from "../hooks/useI18n";

export default function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-brand">
          <span className="footer-title">Coursecraft</span>
          <span className="footer-divider">·</span>
          <span className="footer-subtitle">{t("footer.tagline")}</span>
        </p>
        <a 
          href="https://github.com/d-kuzia/coursework-courses-app" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="footer-link"
          title={t("footer.github")}
        >
          GitHub
        </a>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}

