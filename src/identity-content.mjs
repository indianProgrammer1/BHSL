// Editorial summaries of Yahav Gabay's public posts; source links remain attached.
export const recentNotes = [
  {
    title: "A container grows. A reference expires.",
    category: "LIFETIME & MEMORY",
    summary: "Vector growth can invalidate pointers and references. Knowing when storage moves is part of designing a reliable interface.",
    href: "https://www.linkedin.com/posts/yahav-gabay_cpp-activity-7508193674783248384-TLFN"
  },
  {
    title: "Let the return value take its shortest path.",
    category: "COMPILERS & COST",
    summary: "An explicit move can prevent named return value optimization. Performance starts with understanding what the compiler is allowed to remove.",
    href: "https://www.linkedin.com/posts/yahav-gabay_cpp-moderncpp-performanceoptimization-activity-7505656710502645761-rtR2"
  },
  {
    title: "Shared ownership needs a publication rule.",
    category: "CONCURRENCY",
    summary: "Sharing an object and updating the same shared pointer are different concurrency problems. Atomic publication protects the pointer; it does not make the pointee thread-safe.",
    href: "https://www.linkedin.com/posts/yahav-gabay_cpp-multithreading-lowlatency-activity-7503119988975710208-bV2r"
  }
];

export const executionCoach = {
  slug: "execution-coach",
  title: "ExecutionCoach",
  label: "TRADE ANALYSIS & AUTOMATION",
  status: "DOCUMENTED PROJECT",
  kind: "documented",
  stack: ["C++17", "MULTITHREADING", "POSTGRESQL"],
  summary: "Executed trades, explicit rules, recorded results. A C++ console tool that connects trade analysis with PostgreSQL.",
  intro: "A multithreaded C++17 project for analyzing executed trades against configurable risk rules and storing the results.",
  sections: [["purpose", "Purpose"], ["workflow", "Documented workflow"], ["implementation", "Implementation"], ["source", "Project source"]],
  body: `<h2 id="purpose">Turn execution records into analysis.</h2>
<p>ExecutionCoach reads executed trades from a CSV file and analyzes them against configurable risk rules. It brings trade records and explicit analysis criteria into one console workflow.</p>
<h2 id="workflow">Inputs. Rules. Results.</h2>
<div class="architecture" role="group" aria-label="Documented ExecutionCoach workflow"><div><span>01 / INPUT</span>Executed-trade CSV</div><div><span>02 / ANALYSIS</span>Risk rules in rules.conf</div><div><span>03 / STORAGE</span>PostgreSQL results</div></div>
<p>The analysis uses rules defined in <code>rules.conf</code>. Results are stored automatically in a PostgreSQL database.</p>
<h2 id="implementation">A focused C++ tool.</h2>
<p>The published project description identifies multithreaded C++17, PostgreSQL connectivity through <code>libpqxx</code>, and a Windows console interface. The project is listed for November 2025.</p>
<h2 id="source">Scope of this overview.</h2>
<p>This overview is based on Yahav Gabay’s published project description. No project benchmarks are published here.</p>
<p><a href="https://www.linkedin.com/in/yahav-gabay/">View the ExecutionCoach description on LinkedIn</a>.</p>`
};
