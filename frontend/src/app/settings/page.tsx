"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TiltCard, StaggerContainer, StaggerItem } from "@/components/UIComponents";

export default function SettingsPage() {
  const [toggles, setToggles] = useState({
    darkMode: true,
    notifications: true,
    emailAlerts: false,
    autoOptimize: true,
    advancedAnalytics: true,
    highRiskWarnings: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const toggleSetting = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>⚙️ Settings & Profile</h1>
          <p>Manage your account preferences and protocol settings</p>
        </div>
      </div>

      <div className="grid-1-2" style={{ gap: "32px" }}>
        {/* Profile Column */}
        <StaggerContainer>
          <StaggerItem>
            <TiltCard className="card" style={{ textAlign: "center", marginBottom: "32px" }} glowColor="rgba(139, 92, 246, 0.1)">
              <div style={{ position: "relative", width: "96px", height: "96px", margin: "0 auto 20px" }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--purple), var(--cyan))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2rem", color: "var(--bg-primary)", fontWeight: 800,
                  boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
                }}>
                  0x
                </div>
                <div style={{
                  position: "absolute", bottom: "4px", right: "4px",
                  width: "16px", height: "16px", borderRadius: "50%",
                  background: "var(--neon-green)", border: "3px solid var(--bg-card)",
                }} />
              </div>

              <h3 style={{ marginBottom: "8px" }}>0x1a2...9cD4</h3>
              <div className="badge badge-purple" style={{ marginBottom: "24px" }}>Pro Restaker</div>

              <div className="divider" style={{ margin: "16px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", textAlign: "left" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Total Staked</span>
                <span className="mono" style={{ color: "var(--neon-green)", fontWeight: 600 }}>15.2 ETH</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", textAlign: "left" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Total Rewards</span>
                <span className="mono" style={{ color: "var(--cyan)", fontWeight: 600 }}>0.84 ETH</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", textAlign: "left" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Joined</span>
                <span className="mono" style={{ color: "var(--text-primary)" }}>Oct 2025</span>
              </div>
            </TiltCard>
          </StaggerItem>
        </StaggerContainer>

        {/* Settings Column */}
        <StaggerContainer>
          <StaggerItem>
            <div className="card" style={{ marginBottom: "24px" }}>
              <h3 className="section-title">Protocol Preferences</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
                Configure how the AI allocation engine manages your stake
              </p>

              <div className="settings-row">
                <div className="settings-info">
                  <h4>🧠 Auto-Optimize Allocations</h4>
                  <p>Automatically rebalance stake when risk/reward shifts</p>
                </div>
                <div
                  className={`toggle ${toggles.autoOptimize ? "active" : ""}`}
                  onClick={() => toggleSetting("autoOptimize")}
                />
              </div>

              <div className="settings-row">
                <div className="settings-info">
                  <h4>⚠️ High Risk Warnings</h4>
                  <p>Alert me before allocating to high-risk validators</p>
                </div>
                <div
                  className={`toggle ${toggles.highRiskWarnings ? "active" : ""}`}
                  onClick={() => toggleSetting("highRiskWarnings")}
                />
              </div>

              <div className="settings-row">
                <div className="settings-info">
                  <h4>📈 Advanced Analytics</h4>
                  <p>Enable detailed scatter plots and historical metrics</p>
                </div>
                <div
                  className={`toggle ${toggles.advancedAnalytics ? "active" : ""}`}
                  onClick={() => toggleSetting("advancedAnalytics")}
                />
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="card" style={{ marginBottom: "24px" }}>
              <h3 className="section-title">App Settings</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
                Customize your dashboard experience
              </p>

              <div className="settings-row">
                <div className="settings-info">
                  <h4>🌙 Dark Mode</h4>
                  <p>Use darker colors that are easier on the eyes</p>
                </div>
                <div
                  className={`toggle ${toggles.darkMode ? "active" : ""}`}
                  onClick={() => toggleSetting("darkMode")}
                />
              </div>

              <div className="settings-row">
                <div className="settings-info">
                  <h4>🔔 Push Notifications</h4>
                  <p>Receive browser notifications for rewards and rebalancing</p>
                </div>
                <div
                  className={`toggle ${toggles.notifications ? "active" : ""}`}
                  onClick={() => toggleSetting("notifications")}
                />
              </div>

              <div className="settings-row">
                <div className="settings-info">
                  <h4>✉️ Email Alerts</h4>
                  <p>Get weekly performance reports sent to your email</p>
                </div>
                <div
                  className={`toggle ${toggles.emailAlerts ? "active" : ""}`}
                  onClick={() => toggleSetting("emailAlerts")}
                />
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
              <motion.button
                className="btn btn-ghost"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setToggles({ darkMode: true, notifications: true, emailAlerts: false, autoOptimize: true, advancedAnalytics: true, highRiskWarnings: true })}
              >
                Reset
              </motion.button>
              <motion.button
                className="btn btn-primary"
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "💾 Save Changes"}
              </motion.button>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </>
  );
}
