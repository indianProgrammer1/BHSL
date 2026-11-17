import { escapeHtml } from './components.mjs';

export const clockRows = [
  [
    { "city": "Israel", "zone": "Asia/Jerusalem" },
    {
      "city": "London",
      "zone": "Europe/London"
    },
    {
      "city": "Amsterdam",
      "zone": "Europe/Amsterdam"
    },
    {
      "city": "Austin",
      "zone": "America/Chicago"
    },
    {
      "city": "Chicago",
      "zone": "America/Chicago"
    },
    {
      "city": "Hong Kong",
      "zone": "Asia/Hong_Kong"
    }
  ],
  [
    {
      "city": "New York",
      "zone": "America/New_York"
    },
    {
      "city": "Shanghai",
      "zone": "Asia/Shanghai"
    },
    {
      "city": "Singapore",
      "zone": "Asia/Singapore"
    },
    {
      "city": "Sydney",
      "zone": "Australia/Sydney"
    },
    {
      "city": "Taipei",
      "zone": "Asia/Taipei"
    },
    {
      "city": "Mumbai",
      "zone": "Asia/Kolkata"
    }
  ]
];

export function worldClocks() {
  const rows = clockRows.map((cities, index) => {
    const cards = cities.map(({ city, zone }) =>
      '<div class="clock-card"><h3>' + escapeHtml(city) + '</h3><time data-clock-zone="' + zone + '">--:--:--</time></div>'
    ).join('');
    return '<div class="clock-row clock-row-' + index + '" data-clock-row><div class="clock-track"><div class="clock-group">' + cards + '</div></div></div>';
  }).join('');
  return '<section class="world-clocks" aria-labelledby="world-clocks-heading"><div class="clock-heading shell"><p class="eyebrow">THE GLOBAL CLOCK</p><h2 id="world-clocks-heading">Different time zones.<br><em>Connected by markets.</em></h2><p>Twelve locations. One shared timeline.</p></div>' + rows +
    '<div class="clock-controls"><span>LIVE LOCAL TIME / 24H</span><button class="clock-pause" type="button" aria-pressed="false" hidden><span class="clock-pause-icon" aria-hidden="true">Ⅱ</span><span class="clock-pause-label">Pause motion</span></button></div><noscript><p class="clock-noscript">Enable JavaScript to display live local times.</p></noscript></section>';
}

