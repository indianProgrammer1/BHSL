import { executionCoach } from './identity-content.mjs';
import { codeBlock } from './components.mjs';

// Articles and concept projects remain labeled examples. ExecutionCoach is documented work.
export const articles = [
  {
    slug: "price-is-an-integer",
    title: "Price is an integer. Treat it like one.",
    displayTitle: "Price is an integer.<br><em>Treat it like one.</em>",
    category: "C++ FUNDAMENTALS",
    readingTime: 7,
    summary: "Precision starts with representation. Integer ticks, explicit units, and the boundaries of a financial system.",
    intro: "An exact representation starts with a defined unit—and a boundary that refuses ambiguity.",
    sections: [["define-the-unit","Define the unit"],["validate-the-boundary","Validate the boundary"],["arithmetic-has-limits","Arithmetic has limits"],["keep-the-context","Keep the context"],["references","References"]],
    body: `<h2 id="define-the-unit">First, define the unit.</h2>
<p>A price entering an order book should have a precise meaning. For an instrument with a fixed price increment, an integer count of ticks makes that meaning explicit. Equality is exact. Sorting is straightforward. A one-tick adjustment is an integer operation.</p>
<p>The important part is the unit. A tick is an instrument’s permitted price increment; it is not automatically a cent. For a futures contract, the monetary value of a tick also depends on the contract multiplier. Treat those as separate pieces of metadata.</p>
<p>For a deliberately simple example, assume a fixed grid anchored at zero, a display scale of 100, and a tick size of 25 display units. The displayed price <code>100.25</code> becomes <code>10025</code> scaled units, then <code>401</code> ticks. The price <code>100.26</code> fails validation. Rounding it into place would change the request.</p>
<h2 id="validate-the-boundary">Make the boundary do the work.</h2>
<p>Decode the incoming format, validate its range and precision, apply the instrument’s rules, and construct the internal price only after those checks succeed. If the source sends decimal text, parse that text exactly into the chosen scale. Do not introduce an unnecessary conversion through <code>double</code>.</p>
<div class="callout"><p><strong>A deliberately narrow interface.</strong> This example accepts integer text in scaled units: <code>"10025"</code>, not <code>"100.25"</code>. It assumes a fixed tick grid anchored at zero. Decimal-text parsing and instrument-specific rules belong in a separate adapter.</p></div>
<p>Check both the parsing status and the end pointer. <code>std::from_chars</code> can successfully parse a numeric prefix while leaving trailing characters. It separately reports values outside the destination type’s range.</p>
{{PRICE_CODE}}
<h2 id="arithmetic-has-limits">Integer arithmetic still has limits.</h2>
<p>In C++, signed overflow is undefined behavior. Switching to unsigned arithmetic supplies modular wraparound, which does not make a wrapped price acceptable. Check the operation <em>before</em> performing it, as <code>add_ticks</code> does above.</p>
<p>The same discipline applies when multiplying price by quantity or a contract multiplier. A price and quantity can each fit comfortably in 64 bits while their product does not. Define the required range for the result, account for every intermediate operation, and use checked arithmetic or a suitably wider representation. Casting an already-overflowed product cannot repair it.</p>
<h2 id="keep-the-context">A number needs its context.</h2>
<p>An integer count without an instrument identifier and a tick definition is incomplete. Comparisons between different instruments, currencies, or metadata versions should require an explicit decision. Instruments with variable tick schedules need a richer validator than the fixed divisor shown here.</p>
<p>Whether negative prices are allowed is another instrument rule; this parser deliberately leaves that decision to its caller. A production price type should prevent unchecked construction and tie values to validated instrument metadata.</p>
<p>Test the boundaries: exact ticks, values between ticks, empty input, trailing characters, representable limits, and additions that would exceed them. Keep decimal formatting at the presentation boundary.</p>
<p>The useful guarantee is a narrow one: once a price reaches the core, its unit and permitted operations are understood. That makes the rest of the system easier to reason about.</p>
<h2 id="references">Further reading.</h2>
<ul><li><a href="https://eel.is/c++draft/charconv.from.chars">C++ working draft — numeric conversion with from_chars</a></li><li><a href="https://eel.is/c++draft/basic.fundamental">C++ working draft — integer types and arithmetic</a></li><li><a href="https://www.cmegroup.com/education/courses/introduction-to-equity-index-products/discover-equity-index-notional-value-and-price">CME Group — price increments and contract multipliers</a></li></ul>`
  },
  {
    slug: "replay-the-same-story",
    title: "A replay should tell the same story twice.",
    displayTitle: "A replay should tell<br><em>the same story twice.</em>",
    category: "MARKET DATA",
    readingTime: 3,
    summary: "Recorded ordering, explicit clocks, and a policy for missing events. Make a failure something you can reproduce.",
    intro: "A design note on turning a stream of market events into a repeatable experiment.",
    sections: [["event-order","Preserve event order"],["explicit-time","Make time explicit"],["gaps","Treat gaps as data"]],
    body: `<h2 id="event-order">Preserve the story, not just the timestamps.</h2>
<p>A useful replay system answers a simple question: given the same initial state and the same events, do we arrive at the same result?</p>
<p>That requires an explicit ordering rule. An exchange sequence number, a local capture ordinal, and a timestamp each describe something different. Record them separately. For multiple channels, define a merge policy and retain enough original information to audit it. Do not quietly assume timestamps establish a total order.</p>
<h2 id="explicit-time">Give time an interface.</h2>
<p>A strategy that calls the wall clock from deep inside its decision logic has a hidden input. During replay, that input changes on every run. Pass event time into the core explicitly, or give the core a clock interface controlled by the replay driver.</p>
{{REPLAY_CODE}}
<p>This declaration is an interface sketch. It assumes <code>&lt;cstdint&gt;</code> and a separately defined <code>MarketEvent</code> type. The driver can run quickly, pause at an event, or step through a failure while preserving the core’s inputs.</p>
<h2 id="gaps">A gap is part of the result.</h2>
<p>Decide what happens when sequence numbers jump. Depending on the feed’s protocol, the correct response may involve recovery, a snapshot, or marking the reconstructed state as invalid. A replay should expose that decision instead of silently manufacturing continuity.</p>
<p>Compare more than the final state. Checkpoint intermediate book states, decisions, and emitted requests. A stable final checksum can conceal a different path through the run.</p>
<div class="callout"><p><strong>Reproducible within a defined envelope.</strong> Fixed input ordering alone does not control thread scheduling, random seeds, external services, or floating-point differences across environments. Record or constrain every input that matters.</p></div>
<p>The goal is a replay whose assumptions are visible enough that a disagreement can be investigated, one event at a time.</p>`
  },
  {
    slug: "queues-and-correctness",
    title: "Your queue is part of your correctness model.",
    displayTitle: "Your queue is part of<br><em>your correctness model.</em>",
    category: "SYSTEMS DESIGN",
    readingTime: 3,
    summary: "When producers outrun consumers, the overflow policy becomes part of the system’s behavior.",
    intro: "Before asking how fast a queue can run, ask what happens when it fills up.",
    sections: [["bounded","Define the boundary"],["policy","Name the policy"],["measure","Measure the failure mode"]],
    body: `<h2 id="bounded">Capacity is a design decision.</h2>
<p>A queue connects components that do not necessarily run at the same pace. A bounded queue makes its capacity explicit, but it also forces a decision: what should the producer do when no slot remains?</p>
<p>There is no universal answer. A telemetry stream may tolerate dropping a sample. An order-state transition may require durable recovery. A book built from incremental updates can become unusable if a required update disappears.</p>
<h2 id="policy">Give overload a name.</h2>
<p>Document the policy at the interface. Blocking, rejecting, retrying, coalescing, or entering a recovery state are different behaviors with different consequences. They should not be accidental consequences of an implementation detail.</p>
{{QUEUE_CODE}}
<p>This is an interface sketch, not a queue implementation. The <code>Event</code> type and ownership rules must be defined separately. An explicit result makes overload visible, while <code>[[nodiscard]]</code> encourages callers to handle it.</p>
<h2 id="measure">Observe the uncomfortable case.</h2>
<p>A throughput figure under a steady, balanced load tells only part of the story. Exercise bursts, paused consumers, shutdown, and recovery. Record queue depth, rejection counts, and the time an event spends waiting.</p>
<p>Measure latency across the whole path relevant to the application. A fast push operation can coexist with a long queueing delay. State the workload and sampling method alongside any reported percentile.</p>
<div class="callout"><p><strong>Correctness comes first.</strong> “Lock-free” is not a substitute for a defined ownership model, a valid memory-ordering argument, and a tested overload policy.</p></div>
<p>The queue’s most important contract is what the surrounding system can still trust when the queue is full.</p>`
  }
];

export const projects = [
  executionCoach,
  {
    slug: "tick-ledger",
    title: "Tick Ledger",
    label: "EXACT PRICE PRIMITIVES",
    status: "EXAMPLE CONCEPT",
    stack: ["C++17","INTEGER ARITHMETIC","PROPERTY TESTING"],
    summary: "A small, explicit vocabulary for prices. Instrument-aware units, validated boundaries, and arithmetic that knows its limits.",
    intro: "An example design for a C++ price library. A narrow core with explicit units and failure modes.",
    sections: [["architecture","Architecture"],["interface","Interface sketch"],["validation","Validation plan"],["benchmarks","Benchmark plan"]],
    body: `<h2 id="architecture">Small types. Strong boundaries.</h2>
<p>Tick Ledger is a proposed library, shown here as an example project brief. Its purpose is to move price validation out of ad hoc call sites and into a small set of explicit types.</p>
<div class="architecture" role="group" aria-label="Proposed price validation pipeline"><div><span>01 / INPUT</span>Scaled integer text</div><div><span>02 / VALIDATION</span>Instrument rules</div><div><span>03 / CORE</span>Validated price</div></div>
<p>An input adapter accepts an exact representation. A validator applies the instrument’s scale, tick schedule, and allowed range. The core receives a validated value associated with an instrument and a metadata version.</p>
<h2 id="interface">Make failure visible.</h2>
{{TICK_CODE}}
<p>This is an interface sketch, not a completed library. <code>PriceResult</code> would carry either a validated value or a specific error; <code>InstrumentRules</code> would own the relevant metadata. These types still need implementation.</p>
<h2 id="validation">The first milestone is correctness.</h2>
<ul><li>Round-trip values through serialization without changing their unit.</li><li>Reject off-grid prices and values outside the instrument’s allowed range.</li><li>Exercise every arithmetic boundary before considering optimizations.</li><li>Reject comparisons across incompatible instruments or metadata versions.</li></ul>
<h2 id="benchmarks">A place for evidence.</h2>
<p>No project benchmarks have been run. These proposed measurements are a reporting plan, not performance claims.</p>
<div class="table-wrap"><table><caption>Proposed benchmark coverage</caption><thead><tr><th scope="col">Operation</th><th scope="col">Report</th><th scope="col">Result</th></tr></thead><tbody><tr><td>Parse & validate</td><td>Latency distribution</td><td>Not measured</td></tr><tr><td>Checked arithmetic</td><td>Time per operation</td><td>Not measured</td></tr><tr><td>Serialization</td><td>Round-trip cost</td><td>Not measured</td></tr></tbody></table></div>
<p>Any future report should include the processor, compiler, optimization flags, input distribution, warm-up method, and sample count.</p>
<p>For a working educational primitive, see <a href="/articles/price-is-an-integer/">Price is an integer. Treat it like one.</a></p>`
  },
  {
    slug: "tape-room",
    title: "Tape Room",
    label: "DETERMINISTIC EVENT REPLAY",
    status: "EXAMPLE CONCEPT",
    stack: ["C++17","EVENT PROCESSING","REPRODUCIBLE TESTS"],
    summary: "A proposed replay workbench for recorded market events. Explicit clocks, gap detection, and failures you can revisit.",
    intro: "An example architecture for exploring recorded market data through a controlled, repeatable event loop.",
    sections: [["architecture","Architecture"],["interface","Event contract"],["validation","Validation plan"],["benchmarks","Benchmark plan"]],
    body: `<h2 id="architecture">Record once. Reason carefully.</h2>
<p>Tape Room is an example project concept, not a shipped tool. Its proposed architecture separates file decoding, event ordering, and a deterministic consumer so each responsibility can be tested independently.</p>
<div class="architecture" role="group" aria-label="Proposed replay pipeline"><div><span>01 / SOURCE</span>Recorded events</div><div><span>02 / DRIVER</span>Clock & ordering</div><div><span>03 / CONSUMER</span>State & decisions</div></div>
<p>The source preserves capture order and feed metadata. The driver supplies logical time and a documented merge policy. The consumer emits state checkpoints that can be compared across repeated runs.</p>
<h2 id="interface">Keep provenance attached.</h2>
{{TAPE_CODE}}
<p>This interface sketch assumes <code>&lt;cstdint&gt;</code> and a separately defined event type. The position lets a diagnostic refer back to the recorded input that produced it.</p>
<h2 id="validation">Test what breaks the story.</h2>
<ul><li>Replay the same fixture twice and compare intermediate state checkpoints.</li><li>Inject missing, duplicate, and out-of-order events.</li><li>Pause and resume without changing logical time or output order.</li><li>Reject malformed input and truncated records with useful diagnostics.</li></ul>
<h2 id="benchmarks">Measure the complete path.</h2>
<p>No implementation or performance measurements are claimed. A future benchmark should distinguish decoding cost, consumer cost, and end-to-end replay time.</p>
<div class="table-wrap"><table><caption>Proposed benchmark coverage</caption><thead><tr><th scope="col">Stage</th><th scope="col">Report</th><th scope="col">Result</th></tr></thead><tbody><tr><td>Decode</td><td>Events per second</td><td>Not measured</td></tr><tr><td>Replay consumer</td><td>Latency distribution</td><td>Not measured</td></tr><tr><td>End to end</td><td>Time & peak memory</td><td>Not measured</td></tr></tbody></table></div>
<p>State the fixture size, cache conditions, storage device, processor, compiler, and thread configuration with any results.</p>
<p>Read the companion design note: <a href="/articles/replay-the-same-story/">A replay should tell the same story twice.</a></p>`
  }
];

export const codeSamples = {
  "PRICE_CODE": {
    "code": "#include <charconv>\n#include <cstdint>\n#include <limits>\n#include <optional>\n#include <string_view>\n#include <system_error>\n\nusing i64 = std::int64_t;\nstruct Price { i64 ticks; };\n\nstd::optional<Price> parse_price(std::string_view text,\n                                 i64 tick_units) {\n    if (text.empty() || tick_units <= 0)\n        return std::nullopt;\n\n    i64 units{};\n    const char* end = text.data() + text.size();\n    const auto [ptr, ec] =\n        std::from_chars(text.data(), end, units);\n\n    if (ec != std::errc{} || ptr != end ||\n        units % tick_units != 0)\n        return std::nullopt;\n\n    return Price{units / tick_units};\n}\n\nstd::optional<Price> add_ticks(Price price, i64 delta) {\n    constexpr auto lo = std::numeric_limits<i64>::min();\n    constexpr auto hi = std::numeric_limits<i64>::max();\n\n    if ((delta > 0 && price.ticks > hi - delta) ||\n        (delta < 0 && price.ticks < lo - delta))\n        return std::nullopt;\n\n    return Price{price.ticks + delta};\n}\n\n// parse_price(\"10025\", 25) -> Price{401}\n// parse_price(\"10026\", 25) -> rejected",
    "filename": "price.cpp"
  },
  "REPLAY_CODE": {
    "code": "struct EventContext {\n    std::uint64_t capture_ordinal;\n    std::int64_t event_time_ns;\n};\n\n// The driver supplies both ordering and time.\nvoid on_event(const EventContext& context,\n              const MarketEvent& event);",
    "filename": "event_context.hpp"
  },
  "QUEUE_CODE": {
    "code": "enum class PushResult {\n    accepted,\n    full,\n    stopped\n};\n\n// Every caller must handle overload explicitly.\n[[nodiscard]] PushResult try_push(const Event& event);",
    "filename": "event_queue.hpp"
  },
  "TICK_CODE": {
    "code": "enum class PriceError {\n    invalid_input,\n    outside_range,\n    off_tick_grid,\n    arithmetic_overflow\n};\n\n// Proposed interface; types are defined by the library.\nPriceResult parse_price(std::string_view input,\n                        const InstrumentRules& rules);",
    "filename": "tick_ledger.hpp"
  },
  "TAPE_CODE": {
    "code": "struct ReplayPosition {\n    std::uint64_t file_offset;\n    std::uint64_t capture_ordinal;\n    std::int64_t logical_time_ns;\n};\n\n// Proposed consumer interface; Event is feed-specific.\nvoid consume(const ReplayPosition& position,\n             const Event& event);",
    "filename": "replay_consumer.hpp"
  }
};

for (const entry of [...articles, ...projects]) {
  entry.body = entry.body.replace(/\{\{([A-Z_]+)\}\}/g, (_, name) => {
    const sample = codeSamples[name];
    if (!sample) throw new Error('Unknown code sample: ' + name);
    return codeBlock(sample.code, sample.filename);
  });
}
