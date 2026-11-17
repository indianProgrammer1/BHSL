import { escapeHtml } from './components.mjs';

export const howStages = [
  { title: 'Source Code', phase: 'Build', artifact: 'main.cpp',
    description: 'It starts as text. Inside main, this C++ statement asks the standard output stream to write an integer and end the line.',
    detail: 'The editor holds source code. The processor cannot execute this text directly.',
    visual: '<span class="how-dim">#include &lt;iostream&gt;</span>\n\n<span class="how-keyword">int</span> main() {\n    <span class="how-statement">std::cout &lt;&lt; <b>42</b> &lt;&lt; std::endl;</span>\n}' },
  { title: 'Preprocessing', phase: 'Build', artifact: 'translation unit',
    description: 'The preprocessor handles directives such as #include, expands macros, and selects conditional source before compilation.',
    detail: 'Here, <iostream> supplies declarations for the stream library. This is a simplified expansion, not the full header.',
    visual: '<span class="how-dim">// &lt;iostream&gt; declarations included</span>\nnamespace std { <span class="how-dim">/* … */</span> }\n\n<span class="how-dim">// source + expanded headers</span>\nstd::cout &lt;&lt; <b>42</b> &lt;&lt; std::endl;' },
  { title: 'Compilation', phase: 'Build', artifact: 'intermediate representation',
    description: 'The compiler checks syntax and types, builds and optimizes intermediate representations, then lowers the program toward target instructions.',
    detail: 'The operations below are conceptual IR, not a dump from a particular compiler.',
    visual: '<span class="how-dim">// conceptual intermediate operations</span>\n%stream = output_stream\n%next   = insert_integer %stream, <b>42</b>\n          insert_newline %next\n          flush_stream %next' },
  { title: 'Assembly', phase: 'Build', artifact: 'target instructions',
    description: 'Human-readable instruction mnemonics illustrate the target-level work: prepare arguments, call routines, and return.',
    detail: 'Illustrative assembly only—not the exact compiled output of this line. An integrated assembler can produce an object file without creating a separate .s file.',
    visual: '<span class="how-dim">; illustrative assembly · not exact output</span>\nmov   esi, <b>42</b>\ncall  print_integer\ncall  newline_and_flush\nret' },
  { title: 'Object File', phase: 'Build', artifact: 'main.o / main.obj',
    description: 'The assembler encodes target instructions as machine code in a relocatable object file, alongside symbols and relocation information.',
    detail: 'The byte sample is illustrative, not the compiled bytes of this statement. Some addresses still need to be resolved.',
    visual: '<span class="how-dim">ILLUSTRATIVE BYTES · NOT EXACT OUTPUT</span>\nBE 2A 00 00 00   E8 ?? ?? ?? ??\n\n.text     machine instructions\n.symtab   symbols     .rel   relocations' },
  { title: 'Linking', phase: 'Build', artifact: 'resolve & combine',
    description: 'The linker combines object files and required libraries, resolves references, and lays out the program.',
    detail: 'Libraries may be linked statically or referenced dynamically. Some dynamic symbol resolution happens at load time or during execution.',
    visual: 'main.o ─────┐\nstartup ────┼── resolve symbols ──→ program\nlibraries ──┘\n\n<span class="how-dim">objects + library code / dynamic references</span>' },
  { title: 'Executable', phase: 'Build', artifact: 'program / program.exe',
    description: 'The build produces a runnable program with code, data, and metadata for the loader. No output has been printed yet.',
    detail: 'This is the boundary between building a program and running it. The file on disk is ready to be launched.',
    visual: '┌────────────────────────────────────┐\n│  PROGRAM   ·   entry point + code  │\n│  segments  ·   data + dependencies │\n└────────────────────────────────────┘\n<span class="how-dim">BUILD COMPLETE / NOT YET RUNNING</span>' },
  { title: 'Loading & Initialization', phase: 'Run', artifact: 'process memory',
    description: 'The operating system maps the executable into a process. Required dynamic libraries are loaded, and runtime initialization leads to main.',
    detail: 'Memory holds the running program; it is not a build step that creates the executable.',
    visual: 'PROCESS ADDRESS SPACE\n┌ code ┐  ┌ data ┐  ┌ shared libraries ┐\n└──────┘  └──────┘  └──────────────────┘\n\nentry → runtime initialization → <b>main()</b>' },
  { title: 'Execution & Output', phase: 'Run', artifact: 'instructions → text',
    description: 'The CPU executes machine instructions. The C++ library formats 42 as text; std::endl adds a newline and flushes the stream.',
    detail: 'The output goes to standard output through the runtime and operating system. Its destination may be a terminal, file, or pipe.',
    visual: 'CPU → C++ stream library → standard output\n\ninteger <b>42</b> → characters <b>"42"</b>\nstd::endl → newline + flush\n<span class="how-dim">text leaves the output stream</span>' },
  { title: 'Terminal Display', phase: 'Run', artifact: 'standard output → screen',
    description: 'When standard output is connected to a terminal, the terminal receives the text and draws the characters on screen.',
    detail: 'The 42 you see is the result of the original statement. A successful build alone never printed it.',
    visual: '<span class="how-dim">$ ./program</span>\n<span class="how-terminal-output">42</span>\n<span class="how-dim">$</span> <span class="how-cursor">▏</span>' }
];

const layerSignals = [
  '', '#include → declarations + macros', 'syntax → types → IR → target',
  'mov esi, 42 · call … / illustrative', 'BE 2A 00 00 00 · E8 ?? … / illustrative',
  '[main.o] + [runtime] + [libraries]', '[entry] [code] [data] · ready to run',
  '[code] [data] [libraries] → main()', '42 → "42" + newline → flush', '42'
];
const number = index => String(index + 1).padStart(2, '0');
const sourceLine = 'std::cout &lt;&lt; 42 &lt;&lt; std::endl;';

export const howPage = {
  path: '/how/', title: 'How? From source to screen',
  description: 'Follow one line of C++ from a flat editor into ten connected layers: from source code and the build to execution and terminal output.',
  body: `<section class="how-experience" aria-labelledby="how-title">
    <div class="how-pin shell">
      <header class="how-heading"><div><p class="eyebrow">BENEATH ONE LINE / AN INTERACTIVE EXPLAINER</p><h1 id="how-title">From source <em>to screen.</em></h1></div><a class="how-skip text-link" href="#how-notes">Read the explanation <span aria-hidden="true">↗</span></a></header>
      <div class="how-viewport"><div class="how-object" aria-hidden="true">
        ${howStages.map((stage, index) => `<div class="how-layer${index === 0 ? ' is-active' : ''}" data-layer="${index}" data-phase="${stage.phase.toLowerCase()}"><div class="how-face">
          <div class="how-windowbar"><span class="how-window-dots"><i></i><i></i><i></i></span><span class="how-file-tab"><b aria-hidden="true">{ }</b> ${escapeHtml(stage.artifact)}</span><span>${index === 0 ? 'C++' : stage.phase.toUpperCase()}</span></div>
          <div class="how-editor"><div class="how-gutter">01<br>02<br>03<br>04<br>05</div><pre>${stage.visual}</pre></div>
          ${index ? `<div class="how-layer-signal">${escapeHtml(layerSignals[index])}</div>` : ""}<div class="how-layer-label"><span>${number(index)} / ${escapeHtml(stage.title)}</span><span>${stage.phase.toUpperCase()}${index === 0 ? ' · UTF-8' : ''}</span></div>
        </div></div>`).join('')}
      </div><div class="how-annotations"><div class="how-leaders" aria-hidden="true">${howStages.map((_, index) => `<div class="how-leader" data-leader="${index}"><i data-segment></i><i data-segment></i><b data-anchor="${index}"></b></div>`).join('')}</div><div class="how-callouts" aria-label="Layers of the program">${howStages.map((stage, index) => `<button class="how-callout" type="button" data-label="${index}" data-go-stage="${index}" aria-label="Explore ${escapeHtml(stage.title)}"><span class="how-callout-number">${number(index)}</span><span>${escapeHtml(stage.title)}</span>${index === 0 || index === 7 ? `<small>${stage.phase.toUpperCase()}</small>` : ''}</button>`).join('')}</div></div></div>
      <aside class="how-caption" aria-label="Current stage">
        ${howStages.map((stage, index) => `<div class="how-caption-stage" data-caption="${index}"${index ? ' hidden' : ''}><p class="eyebrow"><span class="how-phase-label">${stage.phase.toUpperCase()}</span> / ${number(index)} OF 10</p><h2>${escapeHtml(stage.title)}</h2><p class="how-stage-description">${escapeHtml(stage.description)}</p><p class="how-stage-detail">${escapeHtml(stage.detail)}</p>${index === 9 ? `<div class="how-result"><span>ON SCREEN</span><output>42</output><code>${sourceLine}</code></div>` : ''}</div>`).join('')}
      </aside>
      <p class="how-scroll-hint">Scroll to explore <span aria-hidden="true">↓</span></p>
      <div class="how-controls" hidden><div class="how-progress-copy"><span data-how-status>ONE LINE. TEN LAYERS.</span><span class="how-scroll-label">SCROLL TO UNFOLD ↓</span></div><nav class="how-stage-nav" aria-label="Explore pipeline stages">${howStages.map((stage, index) => `<button type="button" data-go-stage="${index}" aria-label="${number(index)} ${escapeHtml(stage.title)}"${index === 0 ? ' aria-current="step"' : ''}><span>${number(index)}</span><i aria-hidden="true"></i></button>`).join('')}</nav><div class="how-phase-key"><span>01—07 / BUILD</span><span>08—10 / RUN</span></div></div>
    </div>
  </section>
  <section class="how-notes shell" id="how-notes" aria-labelledby="how-notes-title"><div class="how-notes-intro"><p class="eyebrow">ONE STATEMENT. A WHOLE SYSTEM.</p><h2 id="how-notes-title">A small line.<br><em>A long journey.</em></h2><p>This is a conceptual view of a typical native C++ pipeline. The layers represent responsibilities, not ten separate tools or ten mandatory files.</p><p>A separate assembly file is not always created. Some dynamic linking happens while loading or running the program. Standard output must be connected to a terminal for the final text to appear there.</p><a class="text-link" href="#main">Back to the beginning ↑</a></div>
    <div class="how-transcript"><p class="eyebrow">THE TEN STAGES / TEXT REFERENCE</p><ol>${howStages.map((stage, index) => `<li><details${index === 0 ? ' open' : ''}><summary><span>${number(index)}</span><strong>${escapeHtml(stage.title)}</strong><small>${stage.phase}</small></summary><div><p>${escapeHtml(stage.description)}</p><p>${escapeHtml(stage.detail)}</p><pre><code>${stage.visual}</code></pre></div></details></li>`).join('')}</ol><p class="how-references">Further reading: <a href="https://gcc.gnu.org/onlinedocs/gcc/Overall-Options.html">GCC build stages</a>, <a href="https://clang.llvm.org/docs/Toolchain.html">Clang’s toolchain</a>, and <a href="https://eel.is/c++draft/ostream.manip">the C++ stream manipulator specification</a>.</p></div>
  </section>`
};