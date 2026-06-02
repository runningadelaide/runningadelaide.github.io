/**
 * Adelaide Running Crew Website JavaScript
 * Lightweight, dependency-free vanilla JS.
 */

// --- CONFIGURATION SETTINGS ---
// Set the maximum number of sessions and races to display on the main page.
// Note: Training sessions are also bounded by the 35-day spreadsheet fetch window.
const DISPLAY_COUNT_INTERVALS = 3;  // Wednesday Interval sessions
const DISPLAY_COUNT_LONG_RUNS = 3;  // Saturday Long Run sessions
const DISPLAY_COUNT_RACES = 100;     // Upcoming Races

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initFAQ();
    initDonationCopy();

    // Check if we are on the index page or mini-tp page before loading training data
    if (document.getElementById('wedtraining') || document.getElementById('sattraining')) {
        loadTrainingData();
    }
});

// Run auto-carousel after all assets (like images) have fully loaded
window.addEventListener('load', () => {
    initAutoCarousel();
});

/* ==========================================================================
   Navigation Bar (Sticky, Mobile Menu, and Scrollspy)
   ========================================================================== */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    let ticking = false;

    // Sticky Scroll Effect with requestAnimationFrame throttle and passive listener
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                updateScrollspy();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Mobile Menu Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            navToggle.classList.toggle('open', isOpen);
        });

        // Close menu when clicking nav links
        navMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                navMenu.classList.remove('open');
                navToggle.classList.remove('open');
            }
        });
    }

    // Scrollspy Highlight
    function updateScrollspy() {
        const scrollPosition = window.scrollY + 100; // Offset for navbar height

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });

        // Remove active class from links if we are at the very top of the page
        if (window.scrollY < 100) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#page-top') {
                    link.classList.add('active');
                }
            });
        }
    }

    // Initial run
    updateScrollspy();
}

/* ==========================================================================
   Accordion FAQ Controller
   ========================================================================== */
function initFAQ() {
    const details = document.querySelectorAll('.faq-list details');

    details.forEach(targetDetail => {
        targetDetail.addEventListener('toggle', () => {
            if (targetDetail.open) {
                // Close other accordion elements when one is opened
                details.forEach(detail => {
                    if (detail !== targetDetail && detail.open) {
                        detail.removeAttribute('open');
                    }
                });
            }
        });
    });
}

/* ==========================================================================
   Donation Copy-to-Clipboard Utility
   ========================================================================== */
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Prevent zooming on mobile when focusing
    textArea.style.fontSize = '12pt';
    
    // Hide the element off-screen but keep in DOM for selection
    textArea.setAttribute('readonly', ''); // Prevent iOS keyboard popping up
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '-9999px';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    document.body.appendChild(textArea);
    
    // Highlight and select content (compatible with iOS and Android)
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 999999);

    let successful = false;
    try {
        successful = document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed', err);
    }

    document.body.removeChild(textArea);
    return successful;
}

function copyTextToClipboard(text) {
    return new Promise((resolve, reject) => {
        // Try modern API first (requires HTTPS secure context)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(resolve)
                .catch(err => {
                    // Fall back if promise rejects (e.g. Firefox permission/context errors)
                    const ok = fallbackCopyTextToClipboard(text);
                    if (ok) resolve();
                    else reject(err);
                });
        } else {
            // Fall back immediately if API is unavailable
            const ok = fallbackCopyTextToClipboard(text);
            if (ok) resolve();
            else reject(new Error("Clipboard API not available and fallback failed"));
        }
    });
}

function initDonationCopy() {
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                let textToCopy = targetElement.textContent.trim();

                // Special cleanups for copy labels
                if (targetId === 'bank-bsb') {
                    textToCopy = textToCopy.replace(/\s+/g, '');
                } else if (targetId === 'bank-acc') {
                    textToCopy = textToCopy.replace(/\s+/g, '');
                }

                copyTextToClipboard(textToCopy)
                    .then(() => {
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        button.style.backgroundColor = 'var(--accent-alt)';
                        button.style.color = '#ffffff';
                        button.style.borderColor = 'var(--accent-alt)';

                        setTimeout(() => {
                            button.textContent = originalText;
                            button.style.backgroundColor = '';
                            button.style.color = '';
                            button.style.borderColor = '';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Could not copy text: ', err);
                    });
            }
        });
    });
}

/* ==========================================================================
   Google Sheet CSV Fetcher and Parser
   ========================================================================== */
const ssKey = "1SQq7DSinO7do-sdqUjZZb0sV437SHRMICMlUQlFFy-g";
const csvUrl = `https://docs.google.com/spreadsheets/d/${ssKey}/export?format=csv`;

const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

const weekdayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseCSV(text) {
    const lines = [];
    const pattern = /("([^"]*)"|([^,]*))(,|$)/g;

    const rawLines = text.split(/\r?\n/);
    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if (!line.trim()) continue;

        const fields = [];
        let match;
        pattern.lastIndex = 0;
        while ((match = pattern.exec(line)) !== null) {
            let field = match[2] !== undefined ? match[2] : match[3];
            fields.push(field.trim());
            if (match[4] === "") break;
        }
        lines.push(fields);
    }
    return lines;
}

function parseSheetDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthIndex = monthMap[parts[1]];
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && monthIndex !== undefined && !isNaN(year)) {
            return new Date(year, monthIndex, day);
        }
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateString(date) {
    return `${weekdayName[date.getDay()]} ${monthName[date.getMonth()]} ${date.getDate()}`;
}

function getDateDiffString(earlyDate, lateDate) {
    const oneHour = 1000 * 60 * 60;
    const totalHours = Math.floor((lateDate.getTime() - earlyDate.getTime()) / oneHour);
    const totalDays = Math.floor(totalHours / 24);

    if (totalDays >= 7) {
        const weeks = Math.floor(totalDays / 7);
        const days = totalDays - (weeks * 7);
        return `(${weeks}w ${days}d)`;
    } else {
        const hours = totalHours - (totalDays * 24);
        return `(${totalDays}d ${hours}h)`;
    }
}

async function loadTrainingData() {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error("Network response was not ok");

        const csvText = await response.text();
        const rows = parseCSV(csvText);

        // Remove header row
        rows.shift();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const limitDate = new Date(today.getTime() + (35 * 24 * 60 * 60 * 1000));
        limitDate.setHours(0, 0, 0, 0);

        const wedRuns = [];
        const satRuns = [];
        const races = [];

        rows.forEach(row => {
            if (row.length < 2) return;
            const date = parseSheetDate(row[0]);
            if (!date) return;

            const type = row[1];
            // Map row indices:
            // 0: Date
            // 1: Type
            // 2: Workout / Name (Location in CSV)
            // 3: Meeting Point (Description in CSV)
            // 4: Approx Length
            // 5: Start Pin Link
            // 6: Strava Map Link
            const runInfo = {
                date: date,
                workout: row[2] || "",
                meetingPoint: row[3] || "Cafe/Start Point",
                length: row[4] || "",
                pinLink: row[5] || null,
                stravaLink: row[6] || null
            };

            if (type === 'Wednesday' && date >= today && date < limitDate) {
                wedRuns.push(runInfo);
            } else if (type === 'Saturday' && date >= today && date < limitDate) {
                satRuns.push(runInfo);
            } else if (type === 'Race' && date >= today) {
                races.push(runInfo);
            }
        });

        // Sort by date ascending
        const sortByDate = (a, b) => a.date.getTime() - b.date.getTime();
        wedRuns.sort(sortByDate);
        satRuns.sort(sortByDate);
        races.sort(sortByDate);

        // Render (sliced based on configuration constants, showing only 1 on mini-tp page)
        const isMiniTP = !!document.querySelector('.mini-tp-wrapper');
        const wedLimit = isMiniTP ? 1 : DISPLAY_COUNT_INTERVALS;
        const satLimit = isMiniTP ? 1 : DISPLAY_COUNT_LONG_RUNS;
        const raceLimit = isMiniTP ? 1 : DISPLAY_COUNT_RACES;

        renderRunsSection(wedRuns.slice(0, wedLimit), 'wedtraining', 'moreWedTraining', 'showmorewedtrainingctrl', true);
        renderRunsSection(satRuns.slice(0, satLimit), 'sattraining', 'moreSatTraining', 'showmoresattrainingctrl', false);
        renderRacesSection(races.slice(0, raceLimit), 'racesdiv', 'moreRaces', 'showmoreracectrl');

    } catch (error) {
        console.error("Failed to load training schedule: ", error);

        const fallbackText = "Failed to load schedule. We are still running! Please check Facebook for updates.";
        ['wedtraining', 'sattraining', 'racesdiv'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<p class="error-msg">${fallbackText}</p>`;
        });
    }
}

function formatRunHTML(run, isWed) {
    const formattedDate = formatDateString(run.date);
    const defaultWedPin = "https://maps.app.goo.gl/NFkGSGo5jo4hQgDQ9";

    // Meeting Point link styling
    let meetingPointHTML = run.meetingPoint;
    if (isWed) {
        meetingPointHTML = `<a href="${defaultWedPin}" target="_blank" rel="noopener noreferrer">${run.meetingPoint}</a>`;
    } else if (run.pinLink) {
        meetingPointHTML = `<a href="${run.pinLink}" target="_blank" rel="noopener noreferrer">${run.meetingPoint}</a>`;
    }

    // Start Location pin link (for Saturday runs, placed above route link)
    const pinHTML = (!isWed && run.pinLink)
        ? `<div class="route-link"><a href="${run.pinLink}" target="_blank" rel="noopener noreferrer">Start Location</a></div>`
        : "";

    // Route link styling
    const routeHTML = run.stravaLink
        ? `<div class="route-link"><a href="${run.stravaLink}" target="_blank" rel="noopener noreferrer">Route Map Link</a></div>`
        : "";

    const itemClass = isWed ? 'run-schedule-item intervals-item' : 'run-schedule-item longrun-item';

    if (isWed) {
        return `
            <div class="${itemClass}">
                <h4 class="run-date">${formattedDate}</h4>
                <div class="run-meeting-point">${meetingPointHTML}</div>
                ${run.workout ? `<div class="run-workout">${run.workout}</div>` : ""}
                ${run.length ? `<div class="run-length">${run.length}</div>` : ""}
                ${routeHTML}
            </div>
        `;
    } else {
        return `
            <div class="${itemClass}">
                <h4 class="run-date">${formattedDate}</h4>
                <div class="run-location">${run.workout || "Saturday Long Run"}</div>
                <div class="run-meeting-point">${meetingPointHTML}</div>
                ${run.length ? `<div class="run-length">${run.length}</div>` : ""}
                ${pinHTML}
                ${routeHTML}
            </div>
        `;
    }
}

function renderRunsSection(runs, mainDivId, extraDivId, toggleButtonId, isWed) {
    const mainDiv = document.getElementById(mainDivId);
    if (!mainDiv) return;

    if (runs.length === 0) {
        mainDiv.innerHTML = "<p class=\"text-muted text-center\">No upcoming sessions listed currently. Check Facebook for updates!</p>";
        return;
    }

    // Render all runs directly into the container
    mainDiv.innerHTML = runs.map(run => formatRunHTML(run, isWed)).join('');
}

function formatRaceHTML(race) {
    const formattedDate = formatDateString(race.date);
    const diffString = getDateDiffString(new Date(), race.date);

    const locationHTML = race.pinLink
        ? `<a href="${race.pinLink}" target="_blank" rel="noopener noreferrer">${race.meetingPoint}</a>`
        : race.meetingPoint;

    return `
        <div class="run-schedule-item race-item">
            <h4 class="run-date">${formattedDate} <span class="race-countdown">${diffString}</span></h4>
            <div class="run-meeting-point">${locationHTML}</div>
            ${race.workout ? `<div class="race-details">${race.workout}</div>` : ""}
            ${race.length ? `<div class="run-length">${race.length}</div>` : ""}
        </div>
    `;
}

function renderRacesSection(runs, mainDivId, extraDivId, toggleButtonId) {
    const mainDiv = document.getElementById(mainDivId);
    if (!mainDiv) return;

    if (runs.length === 0) {
        mainDiv.innerHTML = "<p class=\"text-muted text-center\">No upcoming races scheduled. Check back soon!</p>";
        return;
    }

    // Render all races directly into the container
    mainDiv.innerHTML = runs.map(run => formatRaceHTML(run)).join('');
}

// Global functions for custom legacy calls if needed (e.g. from inline HTML triggers)
window.showDivHideLink = function (divToShowId, linkToHideId) {
    const div = document.getElementById(divToShowId);
    const link = document.getElementById(linkToHideId);
    if (div) div.style.display = "block";
    if (link) link.style.display = "none";
};

/* ==========================================================================
   Auto-Scrolling Endless Carousels
   ========================================================================== */
function initAutoCarousel() {
    const tracks = document.querySelectorAll('.carousel-track');

    tracks.forEach(track => {
        if (!track.children.length) return;

        // Duplicate the track content to allow seamless loop
        const originalContent = track.innerHTML;
        track.innerHTML = originalContent + originalContent;

        let speed = 0.5; // Pixels per frame
        let scrollPos = 0;
        let isHovered = false;

        track.addEventListener('mouseenter', () => isHovered = true);
        track.addEventListener('mouseleave', () => isHovered = false);
        track.addEventListener('touchstart', () => isHovered = true, { passive: true });
        track.addEventListener('touchend', () => isHovered = false, { passive: true });

        function scroll() {
            if (!isHovered) {
                scrollPos += speed;

                const maxScroll = track.scrollWidth / 2;
                if (maxScroll > 0) {
                    if (scrollPos >= maxScroll) {
                        scrollPos = 0;
                    }
                    track.scrollLeft = Math.floor(scrollPos);
                }
            } else {
                scrollPos = track.scrollLeft;
            }
            requestAnimationFrame(scroll);
        }

        requestAnimationFrame(scroll);
    });
}


