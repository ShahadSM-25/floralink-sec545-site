import { CheckCircle2, Flower2 } from "lucide-react";
import { Link } from "wouter";

const testCases = [
  {
    id: "TC-01",
    title: "Register with valid details",
    expected: "The account is created and the success state appears.",
  },
  {
    id: "TC-02",
    title: "Register with an existing email",
    expected: "An error message appears and account creation is blocked.",
  },
  {
    id: "TC-03",
    title: "Register with a weak password",
    expected: "Password requirements remain incomplete and submission is rejected.",
  },
  {
    id: "TC-04",
    title: "Login with valid credentials",
    expected: "The user is signed in successfully.",
  },
  {
    id: "TC-05",
    title: "Login with invalid credentials",
    expected: "An invalid credentials message appears.",
  },
  {
    id: "TC-06",
    title: "Five failed login attempts",
    expected: "The account is temporarily locked and a countdown is displayed.",
  },
];

export default function TestCases() {
  return (
    <div className="site-shell testcases-page">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-icon">
            <Flower2 className="h-4 w-4" />
          </span>
          <span>FloraLink</span>
        </Link>

        <nav className="topnav">
          <Link href="/">Home</Link>
          <span>Test Cases</span>
        </nav>
      </header>

      <section className="testcases-hero">
        <span className="hero-badge">Review sheet</span>
        <h1>Authentication test cases</h1>
        <p>A compact view for the main registration and sign-in scenarios.</p>
      </section>

      <section className="testcases-table-wrap">
        <table className="testcases-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Scenario</th>
              <th>Expected Result</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>
                  <span className="result-chip">
                    <CheckCircle2 className="h-4 w-4" />
                    {item.expected}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
