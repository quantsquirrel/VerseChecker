/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import { StringDiff } from "react-string-diff";
import { containsKorean, jamoSubstringMatch } from "./utils";
import "./VerseValidator.css";

const STATE = {
  INCORRECT: 0,
  PARTIAL: 1,
  CORRECT: 2,
};

const DiffViewerStrict = ({ oldValue, newValue }) => {
  const string1 = String(oldValue).toLowerCase().normalize("NFC");
  const string2 = String(newValue).toLowerCase().normalize("NFC");

  return (
    <StringDiff
      oldValue={string1}
      newValue={string2}
      diffMethod="diffWords"
      styles={{
        added: {
          backgroundColor: "var(--background-color-added)",
        },
        removed: {
          backgroundColor: "var(--background-color-removed)",
        },
        default: {},
      }}
    />
  );
};

const getHintText = (text, count) => text.split(" ").slice(0, count).join(" ");

const VerseValidator = ({
  element: { pack, title, chapterTitle, reference, verse },
  toHideReference,
  liveValidation,
  clearKey,
  t,
  index,
  onShowAnswer,
}) => {
  const [inputReference, setReference] = useState("");
  const [referenceBool, setReferenceBool] = useState(STATE.INCORRECT);
  const [inputChapterTitle, setChapterTitle] = useState("");
  const [chapterTitleBool, setChapterTitleBool] = useState(STATE.INCORRECT);
  const [inputTitle, setTitle] = useState("");
  const [titleBool, setTitleBool] = useState(STATE.INCORRECT);
  const [inputVerse, setVerse] = useState("");
  const [verseBool, setVerseBool] = useState(STATE.INCORRECT);
  const [hintBool, setHintBool] = useState(false);
  const [diffBool, setDiffBool] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const isInitialMount = useRef(true);

  const [referenceHintCount, setReferenceHintCount] = useState(0);
  const [titleHintCount, setTitleHintCount] = useState(0);
  const [chapterTitleHintCount, setChapterTitleHintCount] = useState(0);
  const [verseHintCount, setVerseHintCount] = useState(0);

  const handleReset = useCallback(() => {
    setReference("");
    setReferenceBool(STATE.INCORRECT);
    setChapterTitle("");
    setChapterTitleBool(STATE.INCORRECT);
    setTitle("");
    setTitleBool(STATE.INCORRECT);
    setVerse("");
    setVerseBool(STATE.INCORRECT);
    setDiffBool(false);
    setHintBool(false);
    setReferenceHintCount(0);
    setTitleHintCount(0);
    setChapterTitleHintCount(0);
    setVerseHintCount(0);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    handleReset();
  }, [clearKey, handleReset]);

  const resultChecker = useCallback((string1, string2, isLiveValidation) => {
    if (containsKorean(string1)) {
      if (string1 === string2) {
        return STATE.CORRECT;
      }
      if (isLiveValidation && jamoSubstringMatch(string2, string1) && string1 !== "") {
        return STATE.PARTIAL;
      }
      return STATE.INCORRECT;
    }

    if (string1 === string2) {
      return STATE.CORRECT;
    }
    if (isLiveValidation && string2.startsWith(string1) && string1 !== "") {
      return STATE.PARTIAL;
    }
    return STATE.INCORRECT;
  }, []);

  const validateReference = useCallback((value) => {
    const string1 = String(value).replace(/\s+/g, "").toLowerCase().normalize("NFC");
    const string2 = String(reference).replace(/\s+/g, "").toLowerCase().normalize("NFC");
    setReferenceBool(resultChecker(string1, string2, liveValidation));
  }, [liveValidation, reference, resultChecker]);

  const validateTitle = useCallback((value) => {
    const string1 = String(value)
      .replace(/[\p{P}\p{S}]/gu, "")
      .replace(/\s+/g, "")
      .toLowerCase()
      .normalize("NFC");

    const string2 = String(title)
      .replace(/[\p{P}\p{S}]/gu, "")
      .replace(/\s+/g, "")
      .toLowerCase()
      .normalize("NFC");

    setTitleBool(resultChecker(string1, string2, liveValidation));
  }, [liveValidation, resultChecker, title]);

  const validateChapterTitle = useCallback((value) => {
    const string1 = String(value)
      .replace(/[\p{P}\p{S}]/gu, "")
      .replace(/\s+/g, "")
      .toLowerCase()
      .normalize("NFC");

    const string2 = String(chapterTitle)
      .replace(/[\p{P}\p{S}]/gu, "")
      .replace(/\s+/g, "")
      .toLowerCase()
      .normalize("NFC");

    setChapterTitleBool(resultChecker(string1, string2, liveValidation));
  }, [chapterTitle, liveValidation, resultChecker]);

  const validateVerse = useCallback((value) => {
    const string1 = String(value)
      .replace(/[\p{P}\p{S}]/gu, "")
      .replace(/\s+/g, "")
      .toLowerCase()
      .normalize("NFC");

    const string2 = String(verse)
      .replace(/[\p{P}\p{S}]/gu, "")
      .replace(/\s+/g, "")
      .toLowerCase()
      .normalize("NFC");

    setVerseBool(resultChecker(string1, string2, liveValidation));
  }, [liveValidation, resultChecker, verse]);

  useEffect(() => {
    validateReference(inputReference);
    validateChapterTitle(inputChapterTitle);
    validateTitle(inputTitle);
    validateVerse(inputVerse);
  }, [
    inputChapterTitle,
    inputReference,
    inputTitle,
    inputVerse,
    liveValidation,
    validateChapterTitle,
    validateReference,
    validateTitle,
    validateVerse,
  ]);

  const referenceClassName = `reference-box ${
    referenceBool === STATE.CORRECT ? "correct" : referenceBool === STATE.PARTIAL ? "partial" : "incorrect"
  }`;
  const titleClassName = `chapter-title-box ${
    titleBool === STATE.CORRECT ? "correct" : titleBool === STATE.PARTIAL ? "partial" : "incorrect"
  }`;
  const chapterTitleClassName = `title-box ${
    chapterTitleBool === STATE.CORRECT ? "correct" : chapterTitleBool === STATE.PARTIAL ? "partial" : "incorrect"
  }`;
  const verseClassName = `verse-box ${
    verseBool === STATE.CORRECT ? "correct" : verseBool === STATE.PARTIAL ? "partial" : "incorrect"
  }`;

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (setter, validator) => (event) => {
    const value = event.target.value;
    setIsComposing(false);
    setter(value);
    validator(value);
  };

  return (
    <div className="VerseValidator">
      <div className="verse-card-header">
        <span className="verse-number-badge">{t("verse_validator.verse_number", { index })}</span>
        <span className="verse-pack-badge">{pack}</span>
      </div>

      {!toHideReference ? (
        <div className="reference-display-card">
          <span className="preview-label">{t("verse_validator.reference")}</span>
          <h3>{reference}</h3>
          <p>{chapterTitle || title}</p>
        </div>
      ) : (
        <div className="field-group">
          <label className="field-label" htmlFor={`referenceBox-${index}`}>
            {t("verse_validator.input_reference")}
          </label>
          <textarea
            className={referenceClassName}
            id={`referenceBox-${index}`}
            name="referenceBox"
            rows="1"
            value={inputReference}
            onInput={(event) => {
              const value = event.target.value;
              setReference(value);
              if (!isComposing) {
                validateReference(value);
              }
            }}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd(setReference, validateReference)}
          />
          {hintBool ? (
            <div className="hint-area">
              <p className="hint-text">{getHintText(reference, referenceHintCount)}</p>
              <button
                type="button"
                className="secondary-button small-button"
                onClick={() => setReferenceHintCount((current) => current + 1)}
                disabled={referenceHintCount >= reference.split(" ").length}
              >
                {t("verse_validator.next_word")}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {chapterTitle ? (
        <div className="field-group">
          <label className="field-label" htmlFor={`chapterTitleBox-${index}`}>
            {t("verse_validator.input_chapter_title")}
          </label>
          <textarea
            className={chapterTitleClassName}
            id={`chapterTitleBox-${index}`}
            name="chapterTitleBox"
            rows="1"
            value={inputChapterTitle}
            onInput={(event) => {
              const value = event.target.value;
              setChapterTitle(value);
              if (!isComposing) {
                validateChapterTitle(value);
              }
            }}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd(setChapterTitle, validateChapterTitle)}
          />
          {hintBool ? (
            <div className="hint-area">
              <p className="hint-text">{getHintText(chapterTitle, chapterTitleHintCount)}</p>
              <button
                type="button"
                className="secondary-button small-button"
                onClick={() => setChapterTitleHintCount((current) => current + 1)}
                disabled={chapterTitleHintCount >= chapterTitle.split(" ").length}
              >
                {t("verse_validator.next_word")}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="field-group">
        <label className="field-label" htmlFor={`titleBox-${index}`}>
          {t("verse_validator.input_title")}
        </label>
        <textarea
          className={titleClassName}
          id={`titleBox-${index}`}
          name="titleBox"
          rows="1"
          value={inputTitle}
          onInput={(event) => {
            const value = event.target.value;
            setTitle(value);
            if (!isComposing) {
              validateTitle(value);
            }
          }}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd(setTitle, validateTitle)}
        />
        {hintBool ? (
          <div className="hint-area">
            <p className="hint-text">{getHintText(title, titleHintCount)}</p>
            <button
              type="button"
              className="secondary-button small-button"
              onClick={() => setTitleHintCount((current) => current + 1)}
              disabled={titleHintCount >= title.split(" ").length}
            >
              {t("verse_validator.next_word")}
            </button>
          </div>
        ) : null}
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor={`verseBox-${index}`}>
          {t("verse_validator.input_verse")}
        </label>
        <textarea
          className={verseClassName}
          id={`verseBox-${index}`}
          name="verseBox"
          rows="5"
          value={inputVerse}
          onInput={(event) => {
            const value = event.target.value;
            setVerse(value);
            if (!isComposing) {
              validateVerse(value);
            }
          }}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd(setVerse, validateVerse)}
        />
        {hintBool ? (
          <div className="hint-area">
            <p className="hint-text">{getHintText(verse, verseHintCount)}</p>
            <button
              type="button"
              className="secondary-button small-button"
              onClick={() => setVerseHintCount((current) => current + 1)}
              disabled={verseHintCount >= verse.split(" ").length}
            >
              {t("verse_validator.next_word")}
            </button>
          </div>
        ) : null}
      </div>

      <div className="verse-validator-button-box">
        <button type="button" className="secondary-button" onClick={() => setHintBool((current) => !current)}>
          {hintBool ? t("verse_validator.hide_hints") : t("verse_validator.show_hints")}
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setDiffBool((current) => !current);
            if (!diffBool && onShowAnswer) {
              onShowAnswer({ pack, title, reference });
            }
          }}
        >
          {diffBool ? t("verse_validator.hide_answer") : t("verse_validator.show_answer")}
        </button>
        <button type="button" className="ghost-button" onClick={handleReset}>
          {t("verse_validator.reset")}
        </button>
      </div>

      {diffBool ? (
        <div className="diff-box">
          <h3>{t("verse_validator.differences")}</h3>

          <div className="diff-line">
            <span>{t("verse_validator.pack")}</span>
            <strong>{pack}</strong>
          </div>
          <div className="diff-line">
            <span>{t("verse_validator.reference")}</span>
            <DiffViewerStrict oldValue={reference} newValue={inputReference} />
          </div>
          {chapterTitle ? (
            <div className="diff-line">
              <span>{t("verse_validator.chapter_title")}</span>
              <DiffViewerStrict oldValue={chapterTitle} newValue={inputChapterTitle} />
            </div>
          ) : null}
          <div className="diff-line">
            <span>{t("verse_validator.title")}</span>
            <DiffViewerStrict oldValue={title} newValue={inputTitle} />
          </div>
          <div className="diff-line diff-line-verse">
            <span>{t("verse_validator.verse")}</span>
            <DiffViewerStrict oldValue={verse} newValue={inputVerse} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VerseValidator;
