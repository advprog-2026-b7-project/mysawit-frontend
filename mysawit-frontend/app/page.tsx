"use client";

import { useState } from "react";
import HarvestForm from "./components/HarvestForm";
import styles from "./page.module.css";

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [harvestId, setHarvestId] = useState<string | null>(null);

  const handleSuccess = (id: string) => {
    setHarvestId(id);
    setSubmitted(true);
  };

  const handleStartAgain = () => {
    setSubmitted(false);
    setHarvestId(null);
  };

  if (submitted && harvestId) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successContent}>
          <div className={styles.successIcon}>✓</div>
          <h1>Submission Successful!</h1>
          <p>Your harvest data has been submitted successfully for verification.</p>

          <div className={styles.harvestInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Harvest ID:</span>
              <span className={styles.value}>{harvestId}</span>
            </div>
            <p className={styles.timestamp}>
              Submitted at: {new Date().toLocaleString()}
            </p>
          </div>

          <div className={styles.actionButtons}>
            <button
              onClick={handleStartAgain}
              className={styles.btnPrimary}
            >
              Submit Another Harvest
            </button>
            <a href="/" className={styles.btnSecondary}>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <HarvestForm onSuccess={handleSuccess} />
    </main>
  );
}
