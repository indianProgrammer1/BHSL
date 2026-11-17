export function systemDiagram() {
  const stages = [
    ['Market data', 'Decode the input. Preserve its meaning.', 'An event needs a defined format, order and unit before it becomes useful state.', 'DECODE', 'INPUT / NORMALIZE'],
    ['Book state', 'Make every transition explicit.', 'The order book is a model of the feed. Missing events and recovery belong in that model.', 'BOOK STATE', 'STATE / UPDATE'],
    ['Decision', 'Separate the decision from the delivery.', 'A strategy consumes state. The surrounding system owns how a request reaches the market.', 'DECISION', 'STRATEGY / EVALUATE'],
    ['Risk / send', 'Keep the boundary visible.', 'Check a request before transmission, then account for the execution reports that return.', 'RISK / SEND', 'BOUNDARY / EXECUTE']
  ];
  return `<figure class="system-figure" data-stage="0"><div class="figure-top"><span>SYSTEM STUDY / 001</span><span>BHSL</span></div>
  <div class="system-scene" role="img" aria-label="Four layers of a trading system: decode market data, update book state, make a decision, then check and send orders. A conceptual illustration, not a live trading feed.">
    <div class="scene-orbit" aria-hidden="true"></div>
    <div class="system-stack" aria-hidden="true"><div class="stack-foundation"></div>${stages.map((stage, i) => `<div class="system-plane plane-${i}"><div class="plane-heading"><span>0${i + 1}</span><span>${stage[4]}</span></div><strong>${stage[3]}</strong><div class="plane-circuit"><span></span><span></span><span></span><span></span><span></span></div><span class="plane-port"></span></div>`).reverse().join('')}</div>
    <span class="scene-label" aria-hidden="true">INPUT → STATE → ACTION</span>
  </div>
  <div class="stage-controls" role="group" aria-label="Explore the system stages" hidden>${stages.map(([label,title,description],i)=>`<button type="button" data-stage-select="${i}" data-title="${title}" data-description="${description}" aria-pressed="${i===0}" aria-controls="stage-description"><span>0${i+1}</span>${label}</button>`).join('')}</div>
  <figcaption id="stage-description" class="stage-description" aria-live="polite"><strong>${stages[0][1]}</strong><p>${stages[0][2]}</p></figcaption>
  <div class="figure-bottom"><span>CONCEPTUAL EVENT FLOW</span><button type="button" class="diagram-pause" aria-pressed="false" hidden>Pause animation</button></div></figure>`;
}
