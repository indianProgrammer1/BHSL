import { selectedWork, recentInsights, projectRow } from './brand-sections.mjs';
import { worldClocks } from './world-clocks.mjs';
import { arrow, sectionHead, articleRow, escapeHtml } from './components.mjs';
import { articles, projects } from './content.mjs';
import { howPage } from './how.mjs';

export const pages = [{ path: '/', title: 'Markets. Software. Engineering.', description: 'BHSL explores the engineering behind trading software: C++ systems, Linux, concurrency, and performance. Projects and technical notes by Yahav Gabay.', body: `
<section class="hero shell"><div class="hero-copy"><p class="eyebrow"><span class="small-line"></span> BHSL / MARKETS & ENGINEERING</p><h1>Close to the metal.<br><em>Closer to the market.</em></h1><p class="hero-description">Trading software. C++ systems. The engineering decisions between an idea and its execution.</p><div class="hero-actions"><a class="button" href="/projects/">Explore the work ${arrow}</a><a class="text-link" href="/articles/">Read the notes ${arrow}</a></div><div class="hero-footnote"><span>BHSL</span><span>Buy high. Sell low.<br>A little irony. A lot of engineering.</span></div></div></section>
<div class="discipline-strip"><div class="shell"><span>THE AREAS OF INTEREST</span><p><span>C++ & Linux</span><i>/</i><span>Trading systems</span><i>/</i><span>Concurrency</span><i>/</i><span>Performance research</span></p></div></div>
${selectedWork()}
${recentInsights()}
<section class="shell writing-section" data-reveal>${sectionHead('03', 'From the journal', '/articles/', 'All articles')}<a class="featured-article" href="/articles/price-is-an-integer/"><div class="featured-copy"><div class="meta"><span>C++ FUNDAMENTALS</span><span>7 MIN READ</span><span class="sample-label">SAMPLE ARTICLE</span></div><h2>Price is an integer.<br><em>Treat it like one.</em></h2><p>Precision starts with representation. A practical look at integer ticks, explicit units, and the boundaries of a financial system.</p><span class="text-link">Read the article ${arrow}</span></div><div class="code-preview" aria-hidden="true"><div><span>price.cpp</span><span>C++17</span></div><pre><span class="token-comment">// Make the unit part of the type.</span>
<span class="token-keyword">struct</span> Price {
    std::int64_t ticks;
};

<span class="token-comment">// Precision is a design decision.</span>
<span class="token-keyword">constexpr</span> Price bid{<span class="token-number">401</span>};</pre><span class="code-preview-note">01 — REPRESENTATION MATTERS</span></div></a>${articles.slice(1).map((article, index) => articleRow(article, index + 2)).join('')}</section>
${worldClocks()}
<section class="shell home-note" data-reveal><p class="eyebrow">THE PHILOSOPHY</p><p class="philosophy">Understand the system.<br><em>Then make it faster.</em></p><div><p>Know what a value means. Know who owns it. Know what was measured. That discipline connects the smallest C++ decision to the behavior of a trading system.</p><a class="text-link" href="/about/">The thinking behind BHSL ${arrow}</a></div></section>
` }];

pages.push(howPage);

pages.push({
  path: '/articles/', title: 'Writing', description: 'Technical writing on C++, market data and systems behavior.',
  body: `<section class="page-intro shell"><p class="eyebrow">01 / THE JOURNAL</p><h1>Notes from<br><em>under the abstraction.</em></h1><p class="intro-copy">The small decisions behind a reliable system. Educational notes on C++, market data, and explicit boundaries.</p></section><section class="shell content-section" aria-label="Articles">${articles.map((article, index) => articleRow(article, index + 1, 2)).join('')}<p class="editorial-note"><span>EDITORIAL NOTE</span>These are sample articles prepared for this website. They demonstrate the journal’s subject matter and format.</p></section>${recentInsights()}`
});

function readingPage(entry, kind, index) {
  const isArticle = kind === 'articles';
  const entries = isArticle ? articles : projects;
  const next = entries[(index + 1) % entries.length];
  return {
    path: `/${kind}/${entry.slug}/`, title: entry.title, description: entry.intro,
    body: `<header class="page-intro article-intro shell"><a class="back-link" href="/${kind}/">← Back to ${isArticle ? 'writing' : 'projects'}</a><div class="meta"><span>${isArticle ? entry.category : entry.label}</span>${isArticle ? `<span>${entry.readingTime} MIN READ</span>` : ''}<span class="sample-label">${isArticle ? 'SAMPLE ARTICLE' : entry.status}</span></div><h1>${entry.displayTitle || escapeHtml(entry.title)}</h1><p class="intro-copy">${entry.intro}</p></header><div class="reading-layout shell"><aside class="reading-sidebar"><p>ON THIS PAGE</p><nav aria-label="Table of contents">${entry.sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</nav></aside><article class="prose" aria-label="${escapeHtml(entry.title)}">${entry.body}<div class="article-end"><a href="/${kind}/">← All ${isArticle ? 'writing' : 'projects'}</a><a href="/${kind}/${next.slug}/">Next ${isArticle ? 'article' : 'project'} ${arrow}</a></div></article></div>`
  };
}

pages.push(...articles.map((entry, index) => readingPage(entry, 'articles', index)));

pages.push({
  path: '/projects/', title: 'Projects', description: 'Trading software and engineering explorations. ExecutionCoach, alongside clearly identified C++ design concepts.',
  body: `<section class="page-intro shell"><p class="eyebrow">THE WORKBENCH / SYSTEMS & EXPERIMENTS</p><h1>From a question.<br><em>To a system.</em></h1><p class="intro-copy">Trading software, explicit interfaces, and the reasoning behind them. Work with a defined purpose and a visible scope.</p></section><section class="shell content-section" aria-label="Projects"><h2 class="project-group-heading">01 / Documented work</h2>${projects.filter(p => p.kind === 'documented').map(projectRow).join('')}<h2 class="project-group-heading">02 / Design explorations</h2>${projects.filter(p => p.kind !== 'documented').map(projectRow).join('')}<p class="editorial-note"><span>WORKBENCH NOTE</span>ExecutionCoach is described from its published project record. Tick Ledger and Tape Room remain example concepts, with proposed architectures and unmeasured benchmark plans.</p></section>`
});

pages.push(...projects.map((entry, index) => readingPage(entry, 'projects', index)));

pages.push({
  path: '/about/', title: 'About', description: 'BHSL: Buy High, Sell Low. Independent engineering at the intersection of markets, software and performance.',
  body: `<section class="page-intro shell"><p class="eyebrow">THE NAME IS PLAYFUL. THE WORK IS PRECISE.</p><h1>A little irony.<br><em>A lot of engineering.</em></h1><p class="intro-copy">BHSL stands for Buy High, Sell Low. An independent engineering brand exploring the systems behind the trade.</p></section><section class="shell about-layout"><div class="nameplate"><p class="eyebrow">MARKETS × SOFTWARE × ENGINEERING</p><div class="initials" aria-hidden="true">BHSL.</div><p>Buy high. Sell low.<br>Question the assumptions.</p><div class="name-rule"><span>C++ / LINUX / SYSTEMS</span><span>BUILT FROM CURIOSITY</span></div></div><div class="prose"><h2>Look beneath the abstraction.</h2><p>A trading system is a chain of engineering decisions: how data is represented, how state is shared, what happens at a boundary, and which costs survive compilation.</p><p>BHSL brings those questions together through trading software, C++ experiments, and technical writing. Transaction analysis and automation provide the application context. Memory, concurrency, and performance provide the engineering questions.</p><h2>The person behind the work.</h2><p>BHSL is led by Yahav Gabay, a software developer whose public work centers on C++, Linux, and trading systems. His writing examines the behavior hidden inside familiar code—from vector storage and return values to shared ownership.</p><p><a href="https://www.linkedin.com/in/yahav-gabay/">Yahav’s writing on LinkedIn ${arrow}</a> · <a href="https://www.linkedin.com/company/buyhighselllow1">BHSL on LinkedIn ${arrow}</a></p><h2>A few principles.</h2><ol class="principles"><li><strong>01 / Correctness before cleverness.</strong>Define the unit, the lifetime, and the failure case before changing the implementation.</li><li><strong>02 / Make the hidden cost visible.</strong>Follow the allocation, the synchronization, and the work the compiler actually leaves behind.</li><li><strong>03 / Evidence needs context.</strong>A measurement means little without its workload, hardware, and method. An illustration is not a benchmark.</li></ol><p class="about-sample-note">ExecutionCoach is documented project work. The journal articles and the Tick Ledger and Tape Room briefs remain clearly labeled educational examples.</p><p><a href="/projects/">Explore the work ${arrow}</a></p></div></section>`
});
