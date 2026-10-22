const fs = require('fs');

// 1. Fix components.css
let comp = fs.readFileSync('src/css/components.css', 'utf8');

comp = comp.replace(
`:root[data-theme="dark"] .chip-mode[aria-pressed="true"],
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .chip-mode[aria-pressed="true"] {
    background: #472635;
    border-color: #EB6FA1;
    color: #FCE8F0;
    box-shadow: 0 2px 12px rgba(235, 111, 161, 0.24);
  }
}`,
`:root[data-theme="dark"] .chip-mode[aria-pressed="true"] {
  background: #472635;
  border-color: #EB6FA1;
  color: #FCE8F0;
  box-shadow: 0 2px 12px rgba(235, 111, 161, 0.24);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .chip-mode[aria-pressed="true"] {
    background: #472635;
    border-color: #EB6FA1;
    color: #FCE8F0;
    box-shadow: 0 2px 12px rgba(235, 111, 161, 0.24);
  }
}`
);

comp = comp.replace(
`:root[data-theme="dark"] .chip-check,
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .chip-check {
    background: #EB6FA1;
    color: #211D26;
  }
}`,
`:root[data-theme="dark"] .chip-check {
  background: #EB6FA1;
  color: #211D26;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .chip-check {
    background: #EB6FA1;
    color: #211D26;
  }
}`
);

comp = comp.replace(
`:root[data-theme="dark"] #toast,
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) #toast {
    background: #FFFFFF;
    color: #120F16;
  }
}`,
`:root[data-theme="dark"] #toast {
  background: #FFFFFF;
  color: #120F16;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) #toast {
    background: #FFFFFF;
    color: #120F16;
  }
}`
);

comp = comp.replace(
`:root[data-theme="dark"] .pill-calibration,
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .pill-calibration {
    background: #472635;
    color: #FCE8F0;
    border-color: #EB6FA1;
  }
  :root:not([data-theme="light"]) .pill-toggles {
    background: #36294C;
    color: #F2EEFA;
    border-color: #A993D6;
  }
}`,
`:root[data-theme="dark"] .pill-calibration {
  background: #472635;
  color: #FCE8F0;
  border-color: #EB6FA1;
}
:root[data-theme="dark"] .pill-toggles {
  background: #36294C;
  color: #F2EEFA;
  border-color: #A993D6;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .pill-calibration {
    background: #472635;
    color: #FCE8F0;
    border-color: #EB6FA1;
  }
  :root:not([data-theme="light"]) .pill-toggles {
    background: #36294C;
    color: #F2EEFA;
    border-color: #A993D6;
  }
}`
);

comp = comp.replace(
`:root[data-motion="reduced"],
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  .view-enter, .view-enter .card, .ring-pulse-halo, .phase-art-wrap, .chart-bar, .sheet, .scrim, .day.s, .nav-btn[aria-current="page"]::after {
    animation: none !important;
    transition: none !important;
  }
}`,
`:root[data-motion="reduced"] *,
:root[data-motion="reduced"] ::before,
:root[data-motion="reduced"] ::after {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  scroll-behavior: auto !important;
}
:root[data-motion="reduced"] .view-enter,
:root[data-motion="reduced"] .view-enter .card,
:root[data-motion="reduced"] .ring-pulse-halo,
:root[data-motion="reduced"] .phase-art-wrap,
:root[data-motion="reduced"] .chart-bar,
:root[data-motion="reduced"] .sheet,
:root[data-motion="reduced"] .scrim,
:root[data-motion="reduced"] .day.s,
:root[data-motion="reduced"] .nav-btn[aria-current="page"]::after {
  animation: none !important;
  transition: none !important;
}
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  .view-enter, .view-enter .card, .ring-pulse-halo, .phase-art-wrap, .chart-bar, .sheet, .scrim, .day.s, .nav-btn[aria-current="page"]::after {
    animation: none !important;
    transition: none !important;
  }
}`
);

fs.writeFileSync('src/css/components.css', comp);

// 2. Fix views.css
let views = fs.readFileSync('src/css/views.css', 'utf8');

views = views.replace(
`:root[data-theme="dark"] .reassurance-box,
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .reassurance-box {
    background: #25202E;
    border-left-color: #EB6FA1;
  }
}`,
`:root[data-theme="dark"] .reassurance-box {
  background: #25202E;
  border-left-color: #EB6FA1;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .reassurance-box {
    background: #25202E;
    border-left-color: #EB6FA1;
  }
}`
);

views = views.replace(
`:root[data-theme="dark"] .checkin-btn.active,
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .checkin-btn.active {
    background: #472635;
    border-color: #EB6FA1;
    color: #FCE8F0;
  }
}`,
`:root[data-theme="dark"] .checkin-btn.active {
  background: #472635;
  border-color: #EB6FA1;
  color: #FCE8F0;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .checkin-btn.active {
    background: #472635;
    border-color: #EB6FA1;
    color: #FCE8F0;
  }
}`
);

views = views.replace(
`:root[data-theme="dark"] .gentle-progress-badge,
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .gentle-progress-badge {
    background: #1F362B;
    color: #E6F5EC;
    border-color: #70AD8B;
  }
}`,
`:root[data-theme="dark"] .gentle-progress-badge {
  background: #1F362B;
  color: #E6F5EC;
  border-color: #70AD8B;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .gentle-progress-badge {
    background: #1F362B;
    color: #E6F5EC;
    border-color: #70AD8B;
  }
}`
);

views = views.replace(
`:root[data-theme="dark"] .care-kit-item.favorited,
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .care-kit-item.favorited {
    background: #2B2130;
    border-color: #EB6FA1;
  }
}`,
`:root[data-theme="dark"] .care-kit-item.favorited {
  background: #2B2130;
  border-color: #EB6FA1;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .care-kit-item.favorited {
    background: #2B2130;
    border-color: #EB6FA1;
  }
}`
);

views = views.replace(
`:root[data-theme="dark"] .journal-prompt-box,
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .journal-prompt-box {
    background: #36294C;
    border-color: #A993D6;
  }
}`,
`:root[data-theme="dark"] .journal-prompt-box {
  background: #36294C;
  border-color: #A993D6;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .journal-prompt-box {
    background: #36294C;
    border-color: #A993D6;
  }
}`
);

views = views.replace(
`:root[data-theme="dark"] .journal-tag-chip.active,
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .journal-tag-chip.active {
    background: #472635;
    border-color: #EB6FA1;
    color: #FCE8F0;
  }
}`,
`:root[data-theme="dark"] .journal-tag-chip.active {
  background: #472635;
  border-color: #EB6FA1;
  color: #FCE8F0;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .journal-tag-chip.active {
    background: #472635;
    border-color: #EB6FA1;
    color: #FCE8F0;
  }
}`
);

fs.writeFileSync('src/css/views.css', views);
console.log('Successfully corrected all @media selector issues in components.css and views.css!');
