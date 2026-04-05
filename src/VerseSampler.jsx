/* eslint-disable react/prop-types */
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import CheckboxTree from "react-checkbox-tree";
import _ from "underscore";
import { useTranslation } from "react-i18next";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import fullVerseData from "./assets/verse.json";
import logo from "./assets/droplet.svg";
import naviLogo from "./assets/navi-logo-hy-blue.png";
import VersePrinter from "./VersePrinter";
import VerseValidator from "./VerseValidator";
import "./VerseSampler.css";

const ArrayTester = ({ array, toHideReference, liveValidation, clearKey, translate, onShowAnswer }) => (
  <div className="study-card-list">
    {array.map((element, index) => (
      <VerseValidator
        key={`${element.pack}${element.title}${element.reference}`}
        element={element}
        toHideReference={toHideReference}
        liveValidation={liveValidation}
        clearKey={clearKey}
        t={translate}
        index={index + 1}
        onShowAnswer={onShowAnswer}
      />
    ))}
  </div>
);

const ArrayPrinter = ({ array, translate }) => (
  <div className="study-card-list">
    {array.map((element, index) => (
      <VersePrinter
        key={`${element.pack}${element.title}${element.reference}`}
        element={element}
        t={translate}
        index={index + 1}
      />
    ))}
  </div>
);

const CheckboxWidget = ({ nodes, checked, expanded, setChecked, setExpanded }) => (
  <div className="CheckboxTree">
    <CheckboxTree
      nodes={nodes}
      checked={checked}
      expanded={expanded}
      onCheck={setChecked}
      onExpand={setExpanded}
    />
  </div>
);

const PanelCard = ({ title, description, children }) => (
  <section className="panel-card">
    <div className="panel-heading">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
    {children}
  </section>
);

const ToggleSetting = ({ title, description, checked, onChange, disabled }) => (
  <label className={`setting-card ${disabled ? "is-disabled" : ""}`}>
    <div className="setting-copy">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
    <span className={`toggle-switch ${checked ? "is-on" : ""}`} aria-hidden="true">
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
      <span className="toggle-thumb" />
    </span>
  </label>
);

const SummaryStat = ({ label, value }) => (
  <div className="summary-stat">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const QuickActionCard = ({ title, subtitle, onClick, tone = "primary", icon, disabled = false }) => (
  <button
    type="button"
    className={`quick-action-card quick-action-card--${tone}`}
    onClick={onClick}
    disabled={disabled}
  >
    <span className="quick-action-icon" aria-hidden="true">{icon}</span>
    <span className="quick-action-copy">
      <strong>{title}</strong>
      <small>{subtitle}</small>
    </span>
  </button>
);

const loadCustomData = (language) => {
  switch (language) {
    case "kn":
      return fullVerseData.kn;
    case "en":
    default:
      return fullVerseData.en;
  }
};

const buildNodeLabelMap = (nodes) => {
  const map = {};

  const walk = (items = []) => {
    items.forEach((item) => {
      map[item.value] = item.label;
      if (item.children) {
        walk(item.children);
      }
    });
  };

  walk(nodes);
  return map;
};

function Page() {
  const { t, i18n } = useTranslation();
  const buildDate = import.meta.env.VITE_BUILD_DATE ?? new Date().toISOString().slice(0, 10);

  const [shuffleKey, setShuffleKey] = useState(0);
  const [clearKey, setClearKey] = useState(0);
  const [sessionProblemVerses, setSessionProblemVerses] = useState({});
  const [verseData, setVerseData] = useState(null);
  const [testCount, setTestCount] = useState("30");
  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [toShuffle, setShuffle] = useState(false);
  const [toReview, setReview] = useState(false);
  const [toHideReference, setHideReference] = useState(false);
  const [liveValidation, setLiveValidation] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    setVerseData(loadCustomData(i18n.language));
  }, [i18n.language]);

  const translatedNodes = t("nodes", { returnObjects: true });
  const nodeLabelMap = useMemo(() => buildNodeLabelMap(translatedNodes), [translatedNodes]);

  const handleShuffle = useCallback(() => {
    setShuffleKey((current) => current + 1);
  }, []);

  const handleClearAll = useCallback(() => {
    setClearKey((current) => current + 1);
  }, []);

  const handleShowAnswer = useCallback((verseIdentifier) => {
    const key = `${verseIdentifier.pack}|${verseIdentifier.reference}`;
    setSessionProblemVerses((previous) => ({
      ...previous,
      [key]: (previous[key] || 0) + 1,
    }));
  }, []);

  const changeLanguage = useCallback((language) => {
    setChecked([]);
    setExpanded([]);
    i18n.changeLanguage(language);
  }, [i18n]);

  const handleShuffleCheckboxChange = useCallback(() => {
    if (!toShuffle) {
      setHideReference(false);
    }
    setShuffle((current) => !current);
  }, [toShuffle]);

  const handleReviewCheckboxChange = useCallback(() => {
    if (!toReview) {
      setHideReference(false);
    }
    setReview((current) => !current);
  }, [toReview]);

  const handleHideReferenceCheckboxChange = useCallback(() => {
    setHideReference((current) => !current);
  }, []);

  const handleLiveValidationCheckboxChange = useCallback(() => {
    setLiveValidation((current) => !current);
  }, []);

  const requestedVerseCount = useMemo(() => {
    const parsed = Number.parseInt(testCount, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [testCount]);

  const selectedVerses = useMemo(() => {
    if (!verseData || checked.length === 0) {
      return [];
    }

    return checked.reduce((accumulator, currentValue) => {
      const entries = verseData[currentValue] ?? [];
      return accumulator.concat(entries);
    }, []);
  }, [verseData, checked]);

  const testList = useMemo(() => {
    void shuffleKey;

    if (selectedVerses.length === 0 || requestedVerseCount === 0) {
      return [];
    }

    return toShuffle
      ? _.sample(selectedVerses, requestedVerseCount)
      : _.first(selectedVerses, requestedVerseCount);
  }, [selectedVerses, requestedVerseCount, toShuffle, shuffleKey]);

  useEffect(() => {
    setSessionProblemVerses({});
  }, [testList]);

  const selectedPackLabels = checked.map((value) => nodeLabelMap[value] ?? value);
  const totalRevealCount = Object.values(sessionProblemVerses).reduce((sum, count) => sum + count, 0);
  const flaggedVerses = useMemo(
    () => Object.entries(sessionProblemVerses).sort(([, countA], [, countB]) => countB - countA),
    [sessionProblemVerses],
  );

  const openCardsTab = useCallback((reviewMode) => {
    setReview(reviewMode);
    setActiveTab(selectedVerses.length > 0 ? "cards" : "packs");
  }, [selectedVerses.length]);

  const tabItems = [
    { id: "home", label: t("main.nav_home"), icon: "◉" },
    { id: "study", label: t("main.nav_settings"), icon: "◌" },
    { id: "packs", label: t("main.nav_topics"), icon: "▤" },
    { id: "cards", label: t("main.nav_cards"), icon: "▣" },
  ];

  const overviewItems = [
    { label: t("main.selected_packs"), value: checked.length },
    { label: t("main.selected_cards"), value: selectedVerses.length },
    { label: t("main.study_mode"), value: toReview ? t("main.review_mode_value") : t("main.test_mode_value") },
    { label: t("main.problem_verses_session"), value: totalRevealCount },
  ];

  return (
    <div className="AppShell">
      <header className="app-hero">
        <div className="hero-card hero-logo-card">
          <img src={naviLogo} alt={t("main.app_badge")} className="hero-logo-image" />
        </div>
      </header>

      <main className="app-content app-content-mobile">
        {activeTab === "home" ? (
          <div className="mobile-screen">
            <PanelCard title={t("main.overview_title")} description={t("main.mobile_focus_note")}>
              <div className="home-title-block">
                <h1>{t("main.title")}</h1>
                <p>{t("main.subtitle")}</p>
              </div>

              <div className="summary-grid">
                {overviewItems.map((item) => (
                  <SummaryStat key={item.label} label={item.label} value={item.value} />
                ))}
              </div>

              {selectedPackLabels.length > 0 ? (
                <div className="topic-pill-row">
                  {selectedPackLabels.map((label) => (
                    <span className="topic-pill" key={label}>{label}</span>
                  ))}
                </div>
              ) : null}
            </PanelCard>

            <PanelCard title={t("main.tools")} description={t("main.tools_description")}>
              <div className="quick-action-grid">
                <QuickActionCard
                  title={t("main.recite_now")}
                  subtitle={t("main.recite_now_note")}
                  onClick={() => openCardsTab(false)}
                  tone="primary"
                  icon="✎"
                />
                <QuickActionCard
                  title={t("main.review_now")}
                  subtitle={t("main.review_now_note")}
                  onClick={() => openCardsTab(true)}
                  tone="secondary"
                  icon="☑"
                />
                <QuickActionCard
                  title={t("main.open_topics")}
                  subtitle={t("main.selection_description")}
                  onClick={() => setActiveTab("packs")}
                  tone="ghost"
                  icon="☰"
                />
              </div>

              <div className="action-row action-row--single">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    handleShuffle();
                    setActiveTab(selectedVerses.length > 0 ? "cards" : "packs");
                  }}
                >
                  {t("main.shuffle_now")}
                </button>
              </div>
            </PanelCard>

            <PanelCard title={t("main.study_preferences")} description={t("main.mobile_preferences_description")}>
              <div className="preference-list">
                <div className="preference-row">
                  <span>{t("main.num_verses_tested")}</span>
                  <strong>{requestedVerseCount || 0}</strong>
                </div>
                <div className="preference-row">
                  <span>{t("main.set_shuffle")}</span>
                  <strong>{toShuffle ? t("main.on") : t("main.off")}</strong>
                </div>
                <div className="preference-row">
                  <span>{t("main.set_review")}</span>
                  <strong>{toReview ? t("main.on") : t("main.off")}</strong>
                </div>
                <div className="preference-row">
                  <span>{t("main.hide_reference")}</span>
                  <strong>{toHideReference ? t("main.on") : t("main.off")}</strong>
                </div>
                <div className="preference-row">
                  <span>{t("main.live_validation")}</span>
                  <strong>{liveValidation ? t("main.on") : t("main.off")}</strong>
                </div>
              </div>
            </PanelCard>

            <PanelCard title={t("main.problem_verses_session")} description={t("main.stats_description")}>
              {flaggedVerses.length > 0 ? (
                <div className="session-problem-verses">
                  <ul>
                    {flaggedVerses.map(([key, count]) => {
                      const [pack, reference] = key.split("|");
                      return (
                        <li key={key}>
                          <span>
                            <strong>{reference}</strong>
                            <em>{pack}</em>
                          </span>
                          <b>{t("main.answer_revealed_count", { count })}</b>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="empty-state-card">{t("main.no_flags_yet")}</div>
              )}
            </PanelCard>
          </div>
        ) : null}

        {activeTab === "study" ? (
          <div className="mobile-screen">
            <PanelCard title={t("main.pick_lang")} description={t("main.study_setup_note")}>
              <div className="segmented-control" aria-label={t("main.pick_lang")}>
                <button
                  type="button"
                  className={`segmented-button ${i18n.language === "en" ? "is-active" : ""}`}
                  onClick={() => changeLanguage("en")}
                >
                  {t("main.lang_english")}
                </button>
                <button
                  type="button"
                  className={`segmented-button ${i18n.language === "kn" ? "is-active" : ""}`}
                  onClick={() => changeLanguage("kn")}
                >
                  {t("main.lang_korean")}
                </button>
              </div>

              <div className="count-card">
                <label className="count-card-label" htmlFor="testCountBox">
                  {t("main.num_verses_tested")}
                </label>
                <input
                  className="test-count-input"
                  type="number"
                  min="1"
                  id="testCountBox"
                  name="testCountBox"
                  value={testCount}
                  onChange={(event) => setTestCount(event.target.value)}
                />
                <p className="helper-text">{t("main.note_num_verses")}</p>
              </div>
            </PanelCard>

            <PanelCard title={t("main.pick_num_verses")} description={t("main.mobile_toggle_note")}>
              <div className="setting-grid">
                <ToggleSetting
                  title={t("main.set_review")}
                  description={t("main.note_set_review")}
                  checked={toReview}
                  onChange={handleReviewCheckboxChange}
                />
                <ToggleSetting
                  title={t("main.set_shuffle")}
                  description={t("main.note_set_shuffle")}
                  checked={toShuffle}
                  onChange={handleShuffleCheckboxChange}
                />
                <ToggleSetting
                  title={t("main.hide_reference")}
                  description={t("main.note_hide_reference")}
                  checked={toHideReference}
                  onChange={handleHideReferenceCheckboxChange}
                  disabled={toShuffle || toReview}
                />
                <ToggleSetting
                  title={t("main.live_validation")}
                  description={t("main.note_live_validation")}
                  checked={liveValidation}
                  onChange={handleLiveValidationCheckboxChange}
                  disabled={toReview}
                />
              </div>
            </PanelCard>
          </div>
        ) : null}

        {activeTab === "packs" ? (
          <div className="mobile-screen">
            <PanelCard title={t("main.pick_pack")} description={t("main.selection_description")}>
              <CheckboxWidget
                nodes={translatedNodes}
                checked={checked}
                expanded={expanded}
                setChecked={setChecked}
                setExpanded={setExpanded}
              />
            </PanelCard>
          </div>
        ) : null}

        {activeTab === "cards" ? (
          <div className="mobile-screen">
            <PanelCard title={t("main.verses")} description={t("main.study_description")}>
              <div className="segmented-control segmented-control--study" aria-label={t("main.study_mode")}>
                <button
                  type="button"
                  className={`segmented-button ${!toReview ? "is-active" : ""}`}
                  onClick={() => setReview(false)}
                >
                  {t("main.test_mode_value")}
                </button>
                <button
                  type="button"
                  className={`segmented-button ${toReview ? "is-active" : ""}`}
                  onClick={() => setReview(true)}
                >
                  {t("main.review_mode_value")}
                </button>
              </div>

              <div className="action-row">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleShuffle}
                  disabled={selectedVerses.length === 0}
                >
                  {t("main.shuffle_now")}
                </button>
                <button type="button" className="ghost-button" onClick={handleClearAll}>
                  {t("main.clear_all")}
                </button>
              </div>

              {testList.length > 0 ? (
                toReview ? (
                  <ArrayPrinter array={testList} translate={t} />
                ) : (
                  <ArrayTester
                    array={testList}
                    toHideReference={toHideReference}
                    liveValidation={liveValidation}
                    clearKey={clearKey}
                    translate={t}
                    onShowAnswer={handleShowAnswer}
                  />
                )
              ) : (
                <div className="empty-state-card empty-state-card--actionable">
                  <p>{t("main.no_verse_selected")}</p>
                  <button type="button" className="primary-button" onClick={() => setActiveTab("packs")}>
                    {t("main.open_topics")}
                  </button>
                </div>
              )}
            </PanelCard>
          </div>
        ) : null}
      </main>

      <footer className="footer-meta">
        <p>
          <small>
            {t("main.built_on")}: {buildDate}
          </small>
        </p>
        <p>
          <small>
            <a href="https://github.com/RichFree/VerseChecker/issues">{t("main.bug_report")}</a>
          </small>
        </p>
      </footer>

      <nav className="bottom-nav" aria-label="Bottom navigation">
        {tabItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-button ${activeTab === item.id ? "is-active" : ""}`}
            onClick={() => setActiveTab(item.id)}
            aria-current={activeTab === item.id ? "page" : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

const Loader = () => (
  <div className="AppShell loader-shell">
    <div className="loader-card">
      <img src={logo} className="brand-logo loader-logo" alt="logo" />
      <div>loading...</div>
    </div>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Page />
    </Suspense>
  );
}
