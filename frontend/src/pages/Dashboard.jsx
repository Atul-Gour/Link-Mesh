import { useEffect, useState } from "react";
import api from "../services/api";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080c14",
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  topbar: {
    background: "#0f1623",
    borderBottom: "0.5px solid rgba(99,102,241,0.2)",
    padding: "0 24px",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoIcon: {
    width: 30, height: 30,
    background: "#6366f1",
    borderRadius: 7,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, color: "#fff",
  },
  avatar: {
    width: 32, height: 32,
    borderRadius: "50%",
    background: "#6366f1",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 500, color: "#fff",
  },
  statCard: {
    background: "#0f1623",
    border: "0.5px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: 16,
  },
  section: {
    background: "#0f1623",
    border: "0.5px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
  },
  input: {
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "#e2e8f0",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [customAlias, setCustomAlias] = useState("");
  const [expiryDays, setExpiryDays] = useState(30);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchUrls();
  }, []);

  async function fetchUser() {
    try {
      const res = await api.get("/me");
      setUser(res.data);
    } catch {
      window.location.href = "/";
    }
  }

  async function fetchUrls() {
    try {
      const res = await api.get("/v1/url/my-urls");
      setUrls(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function createShortUrl() {
    try {
      const res = await api.post("/v1/url", {
        longUrl,
        customAlias: customAlias || null,
        expiryDays: Number(expiryDays),
      });
      setShortUrl(res.data);
      setLongUrl("");
      setCustomAlias("");
      setExpiryDays(30);
      fetchUrls();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create URL");
    }
  }

  async function deleteUrl(code) {
    await api.delete(`/v1/url/${code}`);
    fetchUrls();
  }

  function logout() {
      window.location.href =
          "http://localhost:8080/logout";
  }

  function copyLink() {
    navigator.clipboard?.writeText(shortUrl.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={styles.page}>
      {/* Topbar */}
      <div style={styles.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={styles.logoIcon}>🔗</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#f1f5f9" }}>LinkMesh</span>
        </div>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{user.name}</div>
{/*               <div style={{ fontSize: 11, color: "#475569" }}>{user.email}</div> */}
            </div>
            {user.picture
              ? <img src={user.picture} alt="" width={32} height={32} style={{ borderRadius: "50%" }} />
              : <div style={styles.avatar}>{initials}</div>
            }
            <button
              onClick={logout}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 7, padding: "5px 12px",
                fontSize: 12, color: "#94a3b8", cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total links", value: urls.length },
            {
              label: "Total clicks",
              value: urls.reduce(
                (sum, url) => sum + (url.clickCount || 0),
                0
              )
            },
            { label: "Active links", value: urls.length },
          ].map(({ label, value }) => (
            <div key={label} style={styles.statCard}>
              <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                {label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, color: "#f1f5f9" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Create section */}
        <div style={styles.section}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
            Create short URL
          </div>
          <input
            style={styles.input}
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                Custom alias <span style={{ color: "#1e293b" }}>(optional)</span>
              </div>
              <input
                style={styles.input}
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="my-link"
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                Expiry days
              </div>
              <input
                style={styles.input}
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={createShortUrl}
            style={{
              marginTop: 14,
              background: "#6366f1", border: "none", borderRadius: 8,
              padding: "9px 18px", fontSize: 13, fontWeight: 500, width: "100%",
              color: "#fff", cursor: "pointer",
            }}
          >
            ⚡ Shorten
          </button>

          {shortUrl && (
            <div style={{
              marginTop: 14,
              background: "rgba(99,102,241,0.08)",
              border: "0.5px solid rgba(99,102,241,0.25)",
              borderRadius: 10, padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <a href={shortUrl.shortUrl} target="_blank" rel="noreferrer"
                  style={{ fontSize: 14, color: "#818cf8", fontWeight: 500 }}>
                  {shortUrl.shortUrl}
                </a>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>
                  Expires: {formatDate(shortUrl.expiresAt)} — {shortUrl.message}
                </div>
              </div>
              <button
                onClick={copyLink}
                style={{
                  background: "rgba(99,102,241,0.15)",
                  border: "0.5px solid rgba(99,102,241,0.3)",
                  borderRadius: 6, padding: "5px 10px",
                  fontSize: 11, color: "#818cf8", cursor: "pointer",
                }}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          )}
        </div>

        {/* URLs table */}
        <div style={styles.section}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
            My URLs
          </div>
          {urls.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "#334155", fontSize: 13 }}>
              No URLs yet — create your first one above
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ fontSize: 11, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 12px 10px", textAlign: "left", fontWeight: 500, width: "15%" }}>Short link</th>
                  <th style={{ fontSize: 11, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 12px 10px", textAlign: "left", fontWeight: 500, width: "45%" }}>Original URL</th>
                  <th style={{ fontSize: 11, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 12px 10px", textAlign: "left", fontWeight: 500, width: "15%" }}>Clicks</th>
                  <th style={{ fontSize: 11, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 12px 10px", textAlign: "left", fontWeight: 500, width: "25%" }}>Expires</th>
                  <th style={{ width: "15%" }}></th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => (
                  <tr key={url.shortUrl} style={{ borderTop: "0.5px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "11px 12px", fontSize: 13, color: "#818cf8", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {url.shortUrl}
                    </td>
                    <td style={{ padding: "11px 12px", fontSize: 12, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {url.longUrl}
                    </td>
                    <td
                      style={{
                        padding: "11px 12px",
                        fontSize: 12,
                        color: "#f1f5f9",
                        fontWeight: 600
                      }}
                    >
                      {url.clickCount ?? 0}
                    </td>
                    <td style={{ padding: "11px 12px" }}>
                      <span style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "0.5px solid rgba(255,255,255,0.08)",
                        borderRadius: 6, padding: "3px 8px",
                        fontSize: 11, color: "#475569",
                      }}>
                        {formatDate(url.expiresAt)}
                      </span>
                    </td>
                    <td style={{ padding: "11px 12px" }}>
                      <button
                        onClick={() => deleteUrl(url.shortUrl)}
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "0.5px solid rgba(239,68,68,0.2)",
                          borderRadius: 6, padding: "5px 10px",
                          fontSize: 11, color: "#f87171", cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}