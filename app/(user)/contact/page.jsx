const ContactPage = () => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <header
        style={{
          backgroundColor: "#FF9500",
          color: "white",
          padding: "20px",
          textAlign: "center",
          borderRadius: "10px 10px 0 0",
          animation: "slideDown 0.5s ease-out forwards",
        }}
      >
        <h1 style={{ fontSize: "48px", margin: 0 }}>NEED HELP?</h1>
      </header>

      <section
        style={{
          padding: "20px",
          backgroundColor: "#FFFFFF",
          borderRadius: "0 0 10px 10px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          animation: "fadeIn 0.5s ease-out 0.2s forwards",
          opacity: 0,
        }}
      >
        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
          If you have any questions or require assistance, feel free to reach
          out to our support team. We're here to help!
        </p>

        <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
          Live Chat Hours:
        </h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            fontSize: "16px",
            marginBottom: "20px",
          }}
        >
          <li>Monday to Friday: 8 am to 6 pm</li>
          <li>Weekends: 8 am to 5 pm</li>
          <li>Public Holidays: 9 am to 5 pm</li>
        </ul>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <button
            style={{
              backgroundColor: "#E5E5E5",
              color: "#333",
              padding: "10px 20px",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              marginRight: "20px",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
            onClick={(e) => (e.target.style.transform = "scale(0.95)")}
          >
            Chat with us
          </button>
          <div
            style={{
              backgroundColor: "#FF9500",
              borderRadius: "50%",
              padding: "15px",
              marginRight: "10px",
              animation: "scaleUp 0.5s ease-out 0.4s forwards",
              transform: "scale(0)",
            }}
          >
            <span style={{ fontSize: "24px" }}>🎧</span>
          </div>
          <h3 style={{ fontSize: "24px", margin: 0 }}>CALL</h3>
        </div>

        <img
          src="https://images.unsplash.com/photo-1664290601473-947b5d9c595a?auto=format&fit=crop&q=80&w=800"
          alt="Customer support representative"
          style={{
            width: "100%",
            maxHeight: "300px",
            objectFit: "cover",
            borderRadius: "10px",
            marginBottom: "20px",
            animation: "slideIn 0.5s ease-out 0.3s forwards",
            opacity: 0,
            transform: "translateX(50px)",
          }}
        />

        <p style={{ fontSize: "16px" }}>
          You can also reach us on <strong>007 53 60 22 18</strong> or{" "}
          <strong>0044 7853 738609</strong> from Monday to Friday (8 am to 6 pm)
          and weekends (8 am to 5 pm). On Public Holidays, we are available
          between 9am and 5pm. For further assistance, email us at{" "}
          <strong>support@mostoreon.com</strong>.
        </p>
      </section>

      <style>
        {`
          @keyframes slideDown {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleUp {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }
          @keyframes slideIn {
            from { transform: translateX(50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default ContactPage;
