/* ============================================
   PREMIUM PORTFOLIO — JavaScript
   ============================================ */

(function () {
    'use strict';

    // ===== DYNAMIC ACCENT COLOR ROTATION =====
    function hslToRgbString(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return `${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))}`;
    }

    const randomHue = Math.floor(Math.random() * 360);
    document.documentElement.style.setProperty('--accent-hue', randomHue);
    document.documentElement.style.setProperty('--accent-rgb', hslToRgbString(randomHue, 91, 50));
    console.log(`Initialized with random hue: ${randomHue}`);

    // ===== CONFIG =====
    const LOADING_DURATION = 3200; // ms for the loading overlay

    // System prompt for portfolio AI
    const AI_SYSTEM_PROMPT = `You are EVE, an AI assistant embedded in Ragesh L's developer portfolio website. You look like EVE from the Pixar movie WALL-E. Keep responses concise (2-4 sentences max). Be friendly, use emojis occasionally.

About Ragesh L:
- B.Tech AI & Data Science undergraduate at CK College of Engineering (CGPA: 8.1), graduating 2026
- Solved 167+ LeetCode problems (134 Easy, 31 Medium, 2 Hard), Contest Rating: 1,414, Max Streak: 118 days
- Skills: Java, Python, TensorFlow, Scikit-Learn, Pandas, NumPy, HTML/CSS/JS, SQL, Git
- Projects: Production-Level RAG System (LangChain, ChromaDB), ALL CAREER Job Aggregator, Weather Agent, ChatGPT Desktop Commander MCP
- Contact: lragesh28@gmail.com, github.com/ragesh28, leetcode.com/u/lragesh28, linkedin.com/in/Ragesh-L-34118inf

If asked about something unrelated to Ragesh, briefly answer but steer back to the portfolio. End responses with a suggestion to explore his projects or reach out.`;

    const chatHistory = [{ role: 'system', content: AI_SYSTEM_PROMPT }];

    // ===== DOM ELEMENTS =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ===== AI LOADING OVERLAY =====
    const overlay = $('#ai-loading-overlay');
    const statusText = $('#ai-loader-status');

    const loadingMessages = [
        'Connecting to server...',
        'Loading neural network...',
        'Initializing AI engine...',
        'Preparing portfolio data...',
        'Almost ready...'
    ];

    let msgIndex = 0;
    const msgInterval = setInterval(() => {
        msgIndex++;
        if (msgIndex < loadingMessages.length) {
            if (statusText) statusText.textContent = loadingMessages[msgIndex];
        }
    }, 600);

    // Set status to ready and clear interval
    setTimeout(() => {
        if (statusText) statusText.textContent = 'AI engine ready!';
    }, LOADING_DURATION - 600);

    setTimeout(() => {
        clearInterval(msgInterval);
        if (overlay) overlay.classList.add('hidden');
    }, LOADING_DURATION);

    // ===== THEME TOGGLE =====
    const themeToggle = $('#theme-toggle');
    const body = document.body;

    // Load saved theme
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    body.className = savedTheme;

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = body.classList.contains('dark');
            body.className = isDark ? 'light' : 'dark';
            localStorage.setItem('portfolio-theme', body.className);
        });
    }

    // ===== NAVBAR SCROLL =====
    const navbar = $('#navbar');
    const navLinks = $$('.nav-link');
    const sections = $$('section[id]');

    window.addEventListener('scroll', () => {
        // Navbar shadow
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }

        // Active nav link
        let current = '';
        sections.forEach((section) => {
            const top = section.offsetTop - 100;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ===== MOBILE MENU =====
    const mobileMenuBtn = $('#mobile-menu-btn');
    const navLinksContainer = $('#nav-links');

    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
        });

        // Close menu on link click
        navLinksContainer.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('active');
            });
        });
    }

    // ===== TYPING ANIMATION =====
    const typingEl = $('#typing-text');
    const typingPhrases = [
        'AI & Data Science Student',
        'Problem Solver',
        'Python & Java Developer',
        'LeetCode Warrior',
        'Machine Learning Enthusiast'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function typeEffect() {
        if (!typingEl) return;

        const current = typingPhrases[phraseIndex];

        if (isDeleting) {
            typingEl.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40;
        } else {
            typingEl.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 80;
        }

        if (!isDeleting && charIndex === current.length) {
            typingSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % typingPhrases.length;
            typingSpeed = 400;
        }

        setTimeout(typeEffect, typingSpeed);
    }

    typeEffect();

    // ===== COUNTER ANIMATION =====
    function animateCounters() {
        const counters = $$('.hero-stat-number[data-target]');
        counters.forEach((counter) => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                const current = Math.floor(eased * target);
                counter.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            }

            requestAnimationFrame(update);
        });
    }

    let isLeetCodeStatsLoaded = false;
    let shouldAnimateOnLoad = false;

    // ===== FETCH LEETCODE STATS =====
    async function fetchLeetCodeStats() {
        let profileData = null;
        let contestData = null;
        let badgesData = null;
        let calendarData = null;

        // Fetch individual endpoints in separate blocks to avoid cascading failures
        try {
            const res = await fetch('https://alfa-leetcode-api.onrender.com/userProfile/lragesh28');
            if (res.ok) profileData = await res.json();
            else console.warn('LeetCode profile fetch returned status:', res.status);
        } catch (e) {
            console.warn('Error fetching LeetCode profile:', e);
        }

        try {
            const res = await fetch('https://alfa-leetcode-api.onrender.com/lragesh28/contest');
            if (res.ok) contestData = await res.json();
            else console.warn('LeetCode contest fetch returned status:', res.status);
        } catch (e) {
            console.warn('Error fetching LeetCode contest:', e);
        }

        try {
            const res = await fetch('https://alfa-leetcode-api.onrender.com/lragesh28/badges');
            if (res.ok) badgesData = await res.json();
            else console.warn('LeetCode badges fetch returned status:', res.status);
        } catch (e) {
            console.warn('Error fetching LeetCode badges:', e);
        }

        try {
            const res = await fetch('https://alfa-leetcode-api.onrender.com/lragesh28/calendar');
            if (res.ok) calendarData = await res.json();
            else console.warn('LeetCode calendar fetch returned status:', res.status);
        } catch (e) {
            console.warn('Error fetching LeetCode calendar:', e);
        }

        try {
            // 1. Update targets for counter animations
            if (profileData) {
                const solvedStat = $('[data-target="150"]');
                if (solvedStat) solvedStat.setAttribute('data-target', profileData.totalSolved || 178);
                
                const submissionsStat = $('[data-target="640"]');
                if (submissionsStat) {
                    const allSubs = profileData.totalSubmissions?.find(s => s.difficulty === 'All');
                    submissionsStat.setAttribute('data-target', allSubs?.submissions || 673);
                }
            }
            
            if (contestData) {
                const ratingStat = $('[data-target="1414"]');
                if (ratingStat) ratingStat.setAttribute('data-target', Math.round(contestData.contestRating) || 1414);
            }
            
            // 2. Update LeetCode Dashboard text values
            if (contestData) {
                const ratingVal = $('.lc-rating-value');
                if (ratingVal) ratingVal.textContent = Math.round(contestData.contestRating).toLocaleString() || '1,414';
                
                const topPctVal = $('.lc-top-value');
                if (topPctVal) {
                    topPctVal.innerHTML = `${contestData.contestTopPercentage || 78.61}<span class="lc-top-pct">%</span>`;
                }

                const rankingLabel = $('.lc-contest-card .lc-card-sub');
                if (rankingLabel) {
                    rankingLabel.innerHTML = `Global Ranking <strong>${(contestData.contestGlobalRanking || 684455).toLocaleString()}</strong>/${(contestData.totalParticipants || 874213).toLocaleString()} &nbsp;·&nbsp; Attended <strong class="lc-accent">${contestData.contestAttend || 1}</strong>`;
                }

                const highlightRating = $('.highlight-rating');
                if (highlightRating) {
                    highlightRating.textContent = `Contest Rating: ${Math.round(contestData.contestRating).toLocaleString() || '1,414'}`;
                }
            }
            
            if (profileData) {
                const solvedCountVal = $('.lc-solved-count');
                if (solvedCountVal) solvedCountVal.textContent = profileData.totalSolved || 178;
                
                const easySolvedVal = $('.lc-diff-item.lc-easy .lc-diff-value');
                if (easySolvedVal) {
                    easySolvedVal.innerHTML = `${profileData.easySolved || 143}<span class="lc-diff-total">/${profileData.totalEasy || 949}</span>`;
                }
                const mediumSolvedVal = $('.lc-diff-item.lc-medium .lc-diff-value');
                if (mediumSolvedVal) {
                    mediumSolvedVal.innerHTML = `${profileData.mediumSolved || 33}<span class="lc-diff-total">/${profileData.totalMedium || 2067}</span>`;
                }
                const hardSolvedVal = $('.lc-diff-item.lc-hard .lc-diff-value');
                if (hardSolvedVal) {
                    hardSolvedVal.innerHTML = `${profileData.hardSolved || 2}<span class="lc-diff-total">/${profileData.totalHard || 942}</span>`;
                }

                // Heatmap title totals
                const heatmapTitleCount = $('.lc-submissions-count');
                if (heatmapTitleCount) {
                    const allSubs = profileData.totalSubmissions?.find(s => s.difficulty === 'All');
                    heatmapTitleCount.textContent = (allSubs?.submissions || 673).toLocaleString();
                }
                
                // Donut chart offsets
                const easyCircle = $('.lc-donut-easy');
                if (easyCircle) {
                    const easyOffset = 314.16 - (profileData.easySolved || 143);
                    easyCircle.setAttribute('stroke-dashoffset', easyOffset);
                }
                const mediumCircle = $('.lc-donut-medium');
                if (mediumCircle) {
                    const mediumOffset = 314.16 - (profileData.mediumSolved || 33);
                    mediumCircle.setAttribute('stroke-dashoffset', mediumOffset);
                }
                const hardCircle = $('.lc-donut-hard');
                if (hardCircle) {
                    const hardOffset = 314.16 - (profileData.hardSolved || 2);
                    hardCircle.setAttribute('stroke-dashoffset', hardOffset);
                }
            }
            
            // 3. Update LeetCode Badges
            if (badgesData) {
                const badgeCountVal = $('.lc-badge-count');
                if (badgeCountVal) badgeCountVal.textContent = badgesData.badgesCount || 3;
                
                const badgesIconsContainer = $('.lc-badges-icons');
                if (badgesIconsContainer && badgesData.badges) {
                    badgesIconsContainer.innerHTML = '';
                    badgesData.badges.slice(0, 3).forEach((badge, idx) => {
                        const badgeEl = document.createElement('div');
                        badgeEl.className = 'lc-badge';
                        const colorClass = idx === 1 ? 'blue' : '';
                        badgeEl.innerHTML = `
                            <div class="lc-badge-hex ${colorClass}" style="padding: 8px; display: flex; align-items: center; justify-content: center;">
                                <img src="${badge.icon}" alt="${badge.displayName}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 4px rgba(255,255,255,0.15));" title="${badge.displayName}">
                            </div>
                        `;
                        badgesIconsContainer.appendChild(badgeEl);
                    });
                }
                
                const recentBadgeName = $('.lc-badge-info strong');
                if (recentBadgeName && badgesData.badges && badgesData.badges.length > 0) {
                    recentBadgeName.textContent = badgesData.badges[0].displayName || '50 Days Badge 2026';
                }

                const highlightBadge = $('.highlight-badge');
                if (highlightBadge && badgesData.badges && badgesData.badges.length > 0) {
                    highlightBadge.textContent = badgesData.badges[0].displayName || '50 Days Badge 2026';
                }
            }
            
            // 4. Update Heatmap Meta & Highlight ratings/streak/badge dynamically
            const activeDaysVal = $('.lc-active-days');
            if (activeDaysVal) {
                activeDaysVal.textContent = (calendarData && calendarData.totalActiveDays) || 188;
            }
            
            const maxStreakVal = $('.lc-max-streak');
            if (maxStreakVal) {
                maxStreakVal.textContent = (calendarData && calendarData.streak) || 118;
            }
            
            const highlightStreak = $('.highlight-streak');
            if (highlightStreak) {
                highlightStreak.textContent = `Max Streak: ${(calendarData && calendarData.streak) || 118} Days`;
            }
            
            // 5. Update real heatmap dynamically
            // Check calendarData first, fallback to profileData's calendar if calendar endpoint fails
            const submissionCalendar = (calendarData && calendarData.submissionCalendar) || (profileData && profileData.submissionCalendar);
            if (submissionCalendar) {
                generateHeatmap(submissionCalendar);
            } else {
                generateHeatmap(); // Fallback to random/loading state if none are available
            }
            
        } catch (error) {
            console.error('Error rendering LeetCode data:', error);
        } finally {
            isLeetCodeStatsLoaded = true;
            if (shouldAnimateOnLoad) {
                animateCounters();
            }
        }
    }

    // Start counter when hero is visible
    const heroObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (isLeetCodeStatsLoaded) {
                        animateCounters();
                    } else {
                        shouldAnimateOnLoad = true;
                    }
                    heroObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.3 }
    );

    const heroStats = $('.hero-stats-row');
    if (heroStats) heroObserver.observe(heroStats);

    // Load LeetCode stats on execution
    fetchLeetCodeStats();

    // ===== SCROLL REVEAL =====
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    $$('.reveal').forEach((el) => revealObserver.observe(el));

    // ===== LEETCODE MONTH LABELS =====
    function generateMonthLabels(startDate) {
        const container = $('.lc-heatmap-months');
        if (!container) return;
        container.innerHTML = '';

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        if (!startDate) {
            // Default fallback: evenly spaced labels
            monthNames.forEach(name => {
                const span = document.createElement('span');
                span.textContent = name;
                container.appendChild(span);
            });
            return;
        }

        // We have 52 columns (weeks). Let's find which columns start a new month.
        let lastMonth = -1;
        for (let week = 0; week < 52; week++) {
            const weekSunday = new Date(startDate);
            weekSunday.setDate(startDate.getDate() + week * 7);
            
            const currentMonth = weekSunday.getMonth();
            if (currentMonth !== lastMonth) {
                const monthName = weekSunday.toLocaleDateString('en-US', { month: 'short' });
                const span = document.createElement('span');
                span.textContent = monthName;
                span.style.gridColumnStart = week + 1;
                container.appendChild(span);
                lastMonth = currentMonth;
            }
        }
    }

    // ===== LEETCODE HEATMAP =====
    function generateHeatmap(submissionCalendarStrOrObj) {
        const heatmap = $('#lc-heatmap');
        if (!heatmap) return;
        heatmap.innerHTML = ''; // Clear

        const totalCells = 52 * 7; // 52 weeks × 7 days
        const fragment = document.createDocumentFragment();

        // Calculate Sunday-to-Saturday aligned date range for 52 weeks
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const endOffset = 6 - currentDayOfWeek; // days until Saturday of current week
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + endOffset);

        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 363); // 364 days total (52 weeks)

        let submissions = {};
        if (submissionCalendarStrOrObj) {
            if (typeof submissionCalendarStrOrObj === 'string') {
                try {
                    submissions = JSON.parse(submissionCalendarStrOrObj);
                } catch (e) {
                    console.error('Failed to parse submission calendar:', e);
                }
            } else if (typeof submissionCalendarStrOrObj === 'object') {
                submissions = submissionCalendarStrOrObj;
            }
        }

        const cellsData = [];
        for (let i = 0; i < totalCells; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isFuture = date > today;
            
            // LeetCode calendar API timestamps are UTC midnight in seconds
            const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const utcTimestamp = Math.floor(utcDate.getTime() / 1000).toString();
            
            let count = 0;
            if (submissionCalendarStrOrObj) {
                count = isFuture ? 0 : (submissions[utcTimestamp] || 0);
            } else {
                // Fallback / Loading state: random but realistic contributions
                const week = Math.floor(i / 7);
                const rand = Math.random();
                if (!isFuture) {
                    if (week < 10) {
                        if (rand > 0.92) count = 1;
                    } else if (week < 20) {
                        if (rand > 0.85) count = 1;
                        else if (rand > 0.93) count = 3;
                    } else if (week < 28) {
                        if (rand > 0.7) count = 1;
                        else if (rand > 0.85) count = 3;
                    } else if (week < 36) {
                        if (rand > 0.3) {
                            count = rand > 0.8 ? 8 : rand > 0.6 ? 5 : rand > 0.45 ? 3 : 1;
                        }
                    } else {
                        if (rand > 0.25) {
                            count = rand > 0.7 ? 8 : rand > 0.5 ? 5 : rand > 0.35 ? 3 : 1;
                        }
                    }
                }
            }
            cellsData.push({ date, count, isFuture });
        }

        cellsData.forEach(cell => {
            const cellEl = document.createElement('div');
            cellEl.className = 'lc-heatmap-cell';
            
            if (cell.isFuture) {
                cellEl.classList.add('future');
            } else if (cell.count > 0) {
                let level = 'l1';
                if (cell.count >= 8) level = 'l4';
                else if (cell.count >= 5) level = 'l3';
                else if (cell.count >= 3) level = 'l2';
                cellEl.classList.add(level);
            }
            
            const dateStr = cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const tooltipText = cell.isFuture ? `No submissions` : `${cell.count} submission${cell.count === 1 ? '' : 's'} on ${dateStr}`;
            cellEl.title = tooltipText;
            fragment.appendChild(cellEl);
        });

        heatmap.appendChild(fragment);
        
        // Generate month labels aligned to this date range
        generateMonthLabels(startDate);
    }

    generateHeatmap();    // ===== EVE PREMIUM CHATRestoration =====
    const chatInput = $('#ai-chat-input');
    const chatSend = $('#ai-chat-send');
    const chatMessages = $('#ai-chat-messages');
    const evePlusBtn = $('#eve-plus-btn');
    const eveDropdown = $('#eve-dropdown');
    const eveOptionTags = $('#eve-option-tags');
    const promptWrap = $('.eve-prompt-wrap');
    const glowCursor = $('.eve-glow-cursor');
    const rippleLayer = $('.eve-ripple-layer');

    // 1. Textarea Auto-Growing
    if (chatInput) {
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = `${chatInput.scrollHeight}px`;
        });
    }

    // 2. Preset dropdown toggle
    if (evePlusBtn && eveDropdown) {
        evePlusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = eveDropdown.style.display === 'block';
            eveDropdown.style.display = isVisible ? 'none' : 'block';
        });

        document.addEventListener('click', () => {
            eveDropdown.style.display = 'none';
        });

        // Toggle presets selection
        eveDropdown.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const shortcut = item.getAttribute('data-shortcut');
                const text = item.textContent;
                
                // Add tag if not already added
                const existing = eveOptionTags.querySelector(`[data-tag="${shortcut}"]`);
                if (!existing) {
                    const tag = document.createElement('div');
                    tag.className = 'eve-tag';
                    tag.setAttribute('data-tag', shortcut);
                    tag.innerHTML = `${text} <button class="eve-tag-remove" type="button" aria-label="Remove tag">&times;</button>`;
                    
                    // Remove handler
                    tag.querySelector('.eve-tag-remove').addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        tag.remove();
                    });

                    eveOptionTags.appendChild(tag);
                }
                eveDropdown.style.display = 'none';
            });
        });
    }

    // 3. Cursor-following glow effect
    if (promptWrap && glowCursor) {
        promptWrap.addEventListener('mousemove', (e) => {
            const rect = promptWrap.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            glowCursor.style.background = `radial-gradient(circle 70px at ${x}px ${y}px, rgba(147, 51, 234, 0.5), transparent 100%)`;
        });
    }

    // 4. Click ripple effect
    if (promptWrap && rippleLayer) {
        promptWrap.addEventListener('click', (e) => {
            // Ignore if clicked on input controls
            if (e.target.closest('.eve-textarea') || e.target.closest('.eve-plus-btn') || e.target.closest('.eve-send-btn') || e.target.closest('.eve-tag-remove')) return;
            const rect = promptWrap.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('div');
            ripple.className = 'eve-ripple';
            ripple.style.left = `${x - 25}px`;
            ripple.style.top = `${y - 25}px`;

            rippleLayer.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    }

    // Portfolio knowledge base for static AI responses
    const portfolioKB = {
        greeting: "Hi! 👋 I'm EVE, Ragesh L's Portfolio AI. I can tell you about his skills, projects, LeetCode journey, and education. What would you like to know?",
        skills: "Ragesh is proficient in: Java, Python, TensorFlow, Scikit-Learn, Pandas, NumPy, HTML/CSS/JavaScript, SQL, Git & GitHub, and Jupyter Notebook. He's particularly passionate about AI/ML and Data Structures & Algorithms.",
        projects: "Here are Ragesh's featured projects:\n\n🤖 **Production-Level RAG System** — Retrieval-Augmented Generation pipeline for structured knowledge retrieval\n💼 **ALL CAREER** — Automated job aggregation from company pages\n🌤️ **Weather Agent** — AI agent for real-time weather analytics\n💻 **ChatGPT Desktop Commander MCP** — MCP server for system tasks",
        leetcode: "Ragesh has solved 150+ problems on LeetCode with a contest rating of 1,414. Breakdown: 134 Easy, 31 Medium, 2 Hard. He has a max streak of 118 days and earned the 100 Days Badge 2025. 🏆",
        experience: "Ragesh L is a B.Tech AI & Data Science undergraduate at CK College of Engineering (CGPA: 8.1), graduating in 2026. He has strong programming fundamentals in Java and Python, with expertise in DSA, OOP, and AI/ML.",
        contact: "You can reach Ragesh via:\n📧 Email: lragesh28@gmail.com\n🔗 GitHub: github.com/ragesh28\n💻 LeetCode: leetcode.com/u/lragesh28\n💼 LinkedIn: linkedin.com/in/Ragesh-L-34118inf",
        default: "That's an interesting question! Ragesh is a B.Tech AI & Data Science student passionate about building intelligent systems. Feel free to ask about his skills, projects, LeetCode stats, or how to contact him!"
    };

    function getAIResponse(message) {
        const msg = message.toLowerCase();
        if (msg.match(/\b(hi|hello|hey|sup)\b/)) return { text: portfolioKB.greeting, animation: 'greeting' };
        if (msg.match(/skill|tech|stack|language|tool/)) return { text: portfolioKB.skills, animation: 'nod' };
        if (msg.match(/project|work|build|made|portfolio/)) return { text: portfolioKB.projects, animation: 'excited' };
        if (msg.match(/leetcode|problem|solve|contest|rating|algorithm|dsa/)) return { text: portfolioKB.leetcode, animation: 'excited' };
        if (msg.match(/experience|background|about|who/)) return { text: portfolioKB.experience, animation: 'nod' };
        if (msg.match(/contact|email|reach|hire|connect|github|linkedin/)) return { text: portfolioKB.contact, animation: 'point' };
        return { text: portfolioKB.default, animation: 'curious' };
    }

    function triggerEve(animation) {
        if (typeof window.eveAnimate === 'function') {
            window.eveAnimate(animation);
        }
    }

    // Typewriter print effect
    function typewriteText(bubbleElement, text, speed = 12, onComplete = null) {
        bubbleElement.innerHTML = '';
        let i = 0;
        const cursor = document.createElement('span');
        cursor.className = 'eve-typing-cursor';
        bubbleElement.appendChild(cursor);

        function type() {
            if (i < text.length) {
                const char = text.charAt(i);
                if (char === '\n') {
                    cursor.insertAdjacentHTML('beforebegin', '<br>');
                } else if (char === '*' && text.charAt(i + 1) === '*') {
                    // Render bold sections
                    const endIdx = text.indexOf('**', i + 2);
                    if (endIdx !== -1) {
                        const boldText = text.substring(i + 2, endIdx);
                        cursor.insertAdjacentHTML('beforebegin', `<strong>${boldText}</strong>`);
                        i = endIdx + 1;
                    } else {
                        cursor.insertAdjacentHTML('beforebegin', '*');
                    }
                } else {
                    cursor.insertAdjacentHTML('beforebegin', char);
                }
                i++;
                if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
                setTimeout(type, speed);
            } else {
                cursor.remove();
                if (onComplete) onComplete();
            }
        }
        type();
    }

    function addMessage(text, type, shouldAnimate = false, onComplete = null) {
        if (!chatMessages) return;
        const msg = document.createElement('div');
        msg.className = `ai-message ${type}`;

        const avatar = document.createElement('div');
        avatar.className = 'ai-msg-avatar';
        avatar.innerHTML = type === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

        const bubble = document.createElement('div');
        bubble.className = 'ai-msg-bubble';

        msg.appendChild(avatar);
        msg.appendChild(bubble);
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (type === 'bot' && shouldAnimate) {
            typewriteText(bubble, text, 12, onComplete);
        } else {
            bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
            if (onComplete) onComplete();
        }
    }

    function showTypingIndicator() {
        if (!chatMessages) return;
        const typing = document.createElement('div');
        typing.className = 'ai-message bot';
        typing.id = 'typing-indicator';
        typing.innerHTML = `
            <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
            <div class="ai-msg-bubble">
                <div class="ai-typing"><span></span><span></span><span></span></div>
            </div>
        `;
        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = $('#typing-indicator');
        if (indicator) indicator.remove();
    }

    function detectAnimation(userMsg, botReply) {
        const msg = userMsg.toLowerCase();
        const reply = botReply.toLowerCase();
        if (msg.match(/\b(hi|hello|hey|sup|greet)\b/)) return 'greeting';
        if (msg.match(/project|work|build|made|rag|career|weather|desktop|mcp/)) return 'excited';
        if (msg.match(/contact|email|reach|hire|connect|github|linkedin/)) return 'point';
        if (msg.match(/skill|tech|stack|language|tool|python|java/)) return 'nod';
        if (msg.match(/leetcode|problem|solve|contest|rating|dsa/)) return 'excited';
        if (msg.match(/who|about|experience|background|education/)) return 'nod';
        if (reply.includes('?')) return 'curious';
        return 'nod';
    }

    function handleChat() {
        if (!chatInput) return;
        const text = chatInput.value.trim();
        
        // Gather selected tags
        const tags = Array.from(eveOptionTags.querySelectorAll('.eve-tag')).map(t => t.getAttribute('data-tag'));
        
        if (!text && tags.length === 0) return;

        // Formulate request query combining tags + text
        let queryText = text;
        if (tags.length > 0) {
            const tagContext = tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
            queryText = text ? `[Context: ${tagContext}] ${text}` : `Tell me about: ${tagContext}`;
        }

        // Add user message visually
        const displayUserText = text || `Clicked preset: ${tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}`;
        addMessage(displayUserText, 'user');
        
        // Clear input and tags
        chatInput.value = '';
        chatInput.style.height = 'auto';
        eveOptionTags.innerHTML = '';
        
        // Disable controls during typing
        chatSend.disabled = true;
        chatInput.disabled = true;

        showTypingIndicator();

        // Add to history
        chatHistory.push({ role: 'user', content: queryText });

        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: chatHistory.slice(-10),
                max_tokens: 200,
                temperature: 0.7
            })
        })
            .then((res) => {
                if (!res.ok) throw new Error('Proxy error or offline');
                return res.json();
            })
            .then((data) => {
                removeTypingIndicator();
                const reply = data.choices?.[0]?.message?.content || 'Beep boop! 🤖 I had a small glitch. Try asking again!';
                chatHistory.push({ role: 'assistant', content: reply });
                
                addMessage(reply, 'bot', true, () => {
                    // Re-enable input after typewriter completes
                    chatSend.disabled = false;
                    chatInput.disabled = false;
                    chatInput.focus();
                });
                triggerEve(detectAnimation(queryText, reply));
            })
            .catch(() => {
                removeTypingIndicator();
                const result = getAIResponse(queryText);
                addMessage(result.text, 'bot', true, () => {
                    // Re-enable input after typewriter completes
                    chatSend.disabled = false;
                    chatInput.disabled = false;
                    chatInput.focus();
                });
                triggerEve(result.animation);
            });
    }

    if (chatSend) chatSend.addEventListener('click', handleChat);
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!chatSend.disabled) handleChat();
            }
        });
    }

    // ===== CONTACT FORM =====
    const contactForm = $('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.btn-primary');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span>Message Sent! ✨</span>';
            btn.style.pointerEvents = 'none';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.pointerEvents = '';
                contactForm.reset();
            }, 2500);
        });
    }

    // ===== SMOOTH SCROLL =====
    $$('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = $(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ===== PROFILE IMAGE FALLBACK =====
    const profileImg = $('#profile-img');
    if (profileImg) {
        profileImg.addEventListener('error', () => {
            // Generate a gradient placeholder with initials
            profileImg.style.display = 'none';
            const frame = profileImg.parentElement;
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#7c5cfc,#00d4ff);display:flex;align-items:center;justify-content:center;font-size:4rem;font-weight:800;color:#fff;font-family:Outfit,sans-serif;position:relative;z-index:1;border:3px solid var(--accent);';
            placeholder.textContent = 'R';
            frame.insertBefore(placeholder, profileImg);
        });
    }
})();
