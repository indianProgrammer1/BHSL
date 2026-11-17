export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
const mark = '<img class="brand-mark" src="/assets/bhsl-logo-silver.svg" width="40" height="40" alt="" aria-hidden="true">';
const favicon = '/assets/bhsl-logo-silver.svg';

export function layout({ title, description, path, body }) {
  const nav = [['/', 'Index'], ['/articles/', 'Writing'], ['/projects/', 'Projects'], ['/how/', 'How?'], ['/about/', 'About']];
  const pageAssets = path === '/how/' ? '<link rel="stylesheet" href="/assets/how.css"><script type="module" src="/assets/how.js"></script>' : '';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#080808"><title>${escapeHtml(title)} · BHSL</title><meta name="description" content="${escapeHtml(description)}"><link rel="icon" type="image/svg+xml" href="${favicon}"><link rel="icon" type="image/svg+xml" href="/assets/bhsl-logo-black.svg" media="(prefers-color-scheme: light)"><link rel="stylesheet" href="/assets/styles.css"><link rel="stylesheet" href="/assets/theme.css"><link rel="stylesheet" href="/assets/depth.css"><link rel="stylesheet" href="/assets/intro.css"><script src="/assets/intro.js"></script><script src="/assets/site.js" defer></script><script src="/assets/motion.js" defer></script><script src="/assets/particles.js" defer></script>${pageAssets}${path === "/" ? '<script src="/assets/clocks.js" defer></script>' : ""}</head>
<body><div class="brand-intro" aria-hidden="true" hidden><div class="brand-intro-content"><img class="brand-intro-mark" src="/assets/bhsl-logo-silver.svg" width="140" height="140" alt=""><p class="brand-intro-name">BHSL</p><p class="brand-intro-caption">MARKETS × SOFTWARE × ENGINEERING</p></div></div><canvas class="pointer-field" aria-hidden="true" hidden></canvas><a class="skip-link" href="#main">Skip to content</a><header class="site-header shell"><a class="brand" href="/" aria-label="BHSL home">${mark}<span>BHSL<span class="brand-dot">.</span></span></a><span class="header-caption">MARKETS × SOFTWARE × ENGINEERING</span><nav aria-label="Main navigation">${nav.map(([href, label]) => `<a href="${href}" ${path === href ? 'aria-current="page"' : href !== '/' && path.startsWith(href) ? 'aria-current="location"' : ''}>${label}</a>`).join('')}</nav></header>
<main id="main" tabindex="-1">${body}</main>
<footer class="site-footer shell"><div><a class="brand footer-brand" href="/">${mark}<span>BHSL.</span></a><p>Buy high. Sell low. Learn something.</p></div><div class="footer-right"><span>Independent engineering. Market perspective.</span><a href="/about/">Behind the name ${arrow}</a><a href="https://www.linkedin.com/in/yahav-gabay/">Follow on LinkedIn ${arrow}</a></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} BHSL</span><span>C++ / LINUX / TRADING SYSTEMS</span><button class="motion-toggle" type="button" aria-pressed="false" hidden>Pause background</button><a href="#main">Back to top ↑</a></div></footer></body></html>`;
}

export function sectionHead(number, title, href, link) {
  return `<div class="section-heading"><h2><span class="section-number">${number}</span>${title}</h2>${href ? `<a class="text-link" href="${href}">${link} ${arrow}</a>` : ''}</div>`;
}

export function articleRow(article, number, headingLevel = 3) {
  const heading = headingLevel === 2 ? 'h2' : 'h3';
  return `<a class="article-row" href="/articles/${article.slug}/"><span class="row-number">${String(number).padStart(2, '0')}</span><div><div class="meta"><span>${article.category}</span><span>${article.readingTime} MIN READ</span><span class="sample-label">SAMPLE ARTICLE</span></div><${heading}>${article.title}</${heading}><p>${article.summary}</p></div>${arrow}</a>`;
}

export function codeBlock(code, filename = 'example.cpp') {
  const tokenPattern = /\/\/[^\n]*|"(?:\\.|[^"\\])*"|#[a-z]+|\b(?:alignas|auto|bool|class|const|constexpr|double|else|enum|false|if|include|int|noexcept|nullptr|return|std|struct|throw|true|using|void)\b|\b\d+(?:'\d+)*\b/g;
  let result = ''; let last = 0;
  for (const match of code.matchAll(tokenPattern)) {
    result += escapeHtml(code.slice(last, match.index));
    const token = match[0];
    const type = token.startsWith('//') ? 'comment' : token.startsWith('"') ? 'string' : /^\d/.test(token) ? 'number' : 'keyword';
    result += `<span class="token-${type}">${escapeHtml(token)}</span>`;
    last = match.index + token.length;
  }
  result += escapeHtml(code.slice(last));
  return `<div class="code-block"><div class="code-caption"><span>${escapeHtml(filename)}</span><span>C++17</span></div><pre tabindex="0" role="region" aria-label="C++ code: ${escapeHtml(filename)}"><code>${result}</code></pre></div>`;
}


