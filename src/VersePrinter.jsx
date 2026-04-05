/* eslint-disable react/prop-types */
import "./VersePrinter.css";

const VersePrinter = ({ element: { pack, title, chapterTitle, reference, verse }, t, index }) => (
  <div className="VersePrinter">
    <div className="verse-card-header">
      <span className="verse-number-badge">{t("verse_validator.verse_number", { index })}</span>
      <span className="verse-pack-badge">{pack}</span>
    </div>

    <div className="review-block">
      <div className="review-row">
        <span className="review-label">{t("verse_validator.reference")}</span>
        <strong>{reference}</strong>
      </div>

      {chapterTitle ? (
        <div className="review-row">
          <span className="review-label">{t("verse_validator.chapter_title")}</span>
          <p>{chapterTitle}</p>
        </div>
      ) : null}

      <div className="review-row">
        <span className="review-label">{t("verse_validator.title")}</span>
        <p>{title}</p>
      </div>

      <div className="review-row review-verse-row">
        <span className="review-label">{t("verse_validator.verse")}</span>
        <p>{verse}</p>
      </div>
    </div>
  </div>
);

export default VersePrinter;
