export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          fontSize: 34,
          fontWeight: "bold",
          color: "#333",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Telegram Auto Reaction Bot 🎉
      </div>

      <img
        style={{ width: "60%", maxWidth: 320, marginBottom: 20 }}
        src="https://telegra.ph/file/cb59967120c6bda64580b.jpg"
        alt="Auto Reaction Bot Logo"
      />

      <a
        href="https://github.com/Malith-Rukshan/Auto-Reaction-Bot"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: "10px 20px",
          margin: 10,
          fontSize: 16,
          cursor: "pointer",
          textAlign: "center",
          color: "#fff",
          border: "none",
          borderRadius: 15,
          backgroundColor: "#0881FD",
          textDecoration: "none",
          display: "inline-block",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.backgroundColor = "#0672E0")}
        onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.backgroundColor = "#0881FD")}
      >
        Open Source 🌱
      </a>

      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a
          className="github-button"
          href="https://github.com/Malith-Rukshan/Auto-Reaction-Bot"
          data-size="large"
          data-show-count="true"
        >
          Star
        </a>
        <a
          className="github-button"
          href="https://github.com/Malith-Rukshan/Auto-Reaction-Bot/fork"
          data-size="large"
          data-show-count="true"
        >
          Fork
        </a>
        <a
          className="github-button"
          href="https://github.com/Malith-Rukshan"
          data-size="large"
        >
          Follow @Malith-Rukshan
        </a>
      </div>

      <script async defer src="https://buttons.github.io/buttons.js" />
    </div>
  );
}
