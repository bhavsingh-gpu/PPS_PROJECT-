/**
 * LetterGlitch - Vanilla JS implementation of the React component
 */
class LetterGlitch {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.glitchColors = options.glitchColors || ['#2b4539', '#61dca3', '#61b3dc'];
        this.glitchSpeed = options.glitchSpeed || 50;
        this.characters = options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789';
        this.smooth = options.smooth !== undefined ? options.smooth : true;
        
        this.letters = [];
        this.grid = { columns: 0, rows: 0 };
        this.lastGlitchTime = Date.now();
        this.fontSize = 16;
        this.charWidth = 10;
        this.charHeight = 20;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    getRandomChar() {
        return this.characters[Math.floor(Math.random() * this.characters.length)];
    }

    getRandomColor() {
        return this.glitchColors[Math.floor(Math.random() * this.glitchColors.length)];
    }

    hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    interpolateColor(start, end, factor) {
        const result = {
            r: Math.round(start.r + (end.r - start.r) * factor),
            g: Math.round(start.g + (end.g - start.g) * factor),
            b: Math.round(start.b + (end.b - start.b) * factor)
        };
        return `rgb(${result.r}, ${result.g}, ${result.b})`;
    }

    resize() {
        const parent = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.grid.columns = Math.ceil(rect.width / this.charWidth);
        this.grid.rows = Math.ceil(rect.height / this.charHeight);
        
        const totalLetters = this.grid.columns * this.grid.rows;
        this.letters = Array.from({ length: totalLetters }, () => ({
            char: this.getRandomChar(),
            color: this.getRandomColor(),
            targetColor: this.getRandomColor(),
            colorProgress: 1
        }));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = `${this.fontSize}px monospace`;
        this.ctx.textBaseline = 'top';

        this.letters.forEach((letter, index) => {
            const x = (index % this.grid.columns) * this.charWidth;
            const y = Math.floor(index / this.grid.columns) * this.charHeight;
            this.ctx.fillStyle = letter.color;
            this.ctx.fillText(letter.char, x, y);
        });
    }

    update() {
        const updateCount = Math.max(1, Math.floor(this.letters.length * 0.05));
        for (let i = 0; i < updateCount; i++) {
            const index = Math.floor(Math.random() * this.letters.length);
            this.letters[index].char = this.getRandomChar();
            this.letters[index].targetColor = this.getRandomColor();
            if (!this.smooth) {
                this.letters[index].color = this.letters[index].targetColor;
                this.letters[index].colorProgress = 1;
            } else {
                this.letters[index].colorProgress = 0;
            }
        }
    }

    handleSmoothTransitions() {
        let needsRedraw = false;
        this.letters.forEach(letter => {
            if (letter.colorProgress < 1) {
                letter.colorProgress += 0.05;
                if (letter.colorProgress > 1) letter.colorProgress = 1;

                const startRgb = this.hexToRgb(letter.color.startsWith('#') ? letter.color : '#61dca3'); // Fallback
                const endRgb = this.hexToRgb(letter.targetColor);
                
                if (startRgb && endRgb) {
                    letter.color = this.interpolateColor(startRgb, endRgb, letter.colorProgress);
                    needsRedraw = true;
                }
            }
        });
        return needsRedraw;
    }

    animate() {
        const now = Date.now();
        let needsRedraw = false;

        if (now - this.lastGlitchTime >= this.glitchSpeed) {
            this.update();
            needsRedraw = true;
            this.lastGlitchTime = now;
        }

        if (this.smooth) {
            if (this.handleSmoothTransitions()) needsRedraw = true;
        }

        if (needsRedraw) this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

/**
 * SecurePass Logic
 */
const WEAK_PASSWORDS = ["123456", "password", "123456789", "12345678", "qwerty", "111111", "admin", "welcome", "letmein", "sunshine", "iloveyou", "password123"];

function getStrength(password) {
    let score = 0;
    let feedback = [];
    
    if (!password) return { score: 0, label: "Waiting...", color: "var(--text-secondary)", feedback: [] };

    // Length check
    const length = password.length;
    if (length >= 12) score += 40;
    else if (length >= 8) score += 20;
    else feedback.push("Too short (aim for 12+ chars)");

    // Variety checks
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasUpper) score += 15;
    else feedback.push("Add uppercase letters");
    
    if (hasLower) score += 10;
    
    if (hasDigit) score += 15;
    else feedback.push("Add numbers");
    
    if (hasSpecial) score += 20;
    else feedback.push("Add symbols (!@#...)");

    if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
        score = 10;
        feedback.unshift("Warning: Very common password!");
    }

    let label, color;
    if (score < 40) { label = "Weak"; color = "var(--strength-weak)"; }
    else if (score < 70) { label = "Medium"; color = "var(--strength-medium)"; }
    else { label = "Strong"; color = "var(--strength-strong)"; }

    return { score, label, color, feedback };
}

function generatePassword(length) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    const all = upper + lower + digits + symbols;
    
    let pwd = [
        upper[Math.floor(Math.random() * upper.length)],
        lower[Math.floor(Math.random() * lower.length)],
        digits[Math.floor(Math.random() * digits.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
    ];
    
    for (let i = 0; i < length - 4; i++) {
        pwd.push(all[Math.floor(Math.random() * all.length)]);
    }
    
    return pwd.sort(() => Math.random() - 0.5).join('');
}

/**
 * CardNav Logic - Vanilla JS Implementation
 */
const CARD_ITEMS = [
    {
        label: "Security",
        bgColor: "#1B1722",
        textColor: "#fff",
        links: [
            { label: "Protocols", href: "#" },
            { label: "Compliance", href: "#" }
        ]
    },
    {
        label: "Resources", 
        bgColor: "#2F293A",
        textColor: "#fff",
        links: [
            { label: "Documentation", href: "#" },
            { label: "API Reference", href: "#" }
        ]
    },
    {
        label: "Support",
        bgColor: "#2F293A", 
        textColor: "#fff",
        links: [
            { label: "Help Center", href: "#" },
            { label: "Contact Us", href: "#" }
        ]
    }
];

function initCardNav() {
    const nav = document.getElementById('card-nav');
    const content = document.getElementById('card-nav-content');
    const hamburger = document.getElementById('hamburger-menu');
    let isExpanded = false;

    // Inject Cards
    content.innerHTML = CARD_ITEMS.map(item => `
        <div class="nav-card" style="background-color: ${item.bgColor}; color: ${item.textColor}">
            <div class="nav-card-label">${item.label}</div>
            <div class="nav-card-links">
                ${item.links.map(lnk => `
                    <a class="nav-card-link" href="${lnk.href}">
                        <span>↗</span> ${lnk.label}
                    </a>
                `).join('')}
            </div>
        </div>
    `).join('');

    const cards = content.querySelectorAll('.nav-card');

    function calculateHeight() {
        if (window.innerWidth <= 768) {
            return 60 + content.scrollHeight + 16;
        }
        return 300;
    }

    const tl = gsap.timeline({ paused: true });
    tl.to(nav, { height: calculateHeight, duration: 0.4, ease: "power3.out" })
      .fromTo(cards, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power3.out" }, "-=0.2");

    hamburger.addEventListener('click', () => {
        isExpanded = !isExpanded;
        hamburger.classList.toggle('open', isExpanded);
        nav.classList.toggle('open', isExpanded);
        
        if (isExpanded) {
            content.setAttribute('aria-hidden', 'false');
            tl.play();
        } else {
            content.setAttribute('aria-hidden', 'true');
            tl.reverse();
        }
    });

    window.addEventListener('resize', () => {
        if (isExpanded) {
            gsap.set(nav, { height: calculateHeight() });
        }
    });
}

/**
 * UI Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize CardNav
    initCardNav();

    // Initialize Glitch Background
    const bgContainer = document.getElementById('glitch-background');
    const canvas = document.createElement('canvas');
    canvas.id = 'glitch-canvas';
    bgContainer.appendChild(canvas);
    
    const glitch = new LetterGlitch('glitch-canvas', {
        glitchColors: ['#e0e0e0', '#2b4539', '#0077b6'],
        glitchSpeed: 60
    });

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            glitch.glitchColors = ['#2b4539', '#61dca3', '#61b3dc'];
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            glitch.glitchColors = ['#e0e0e0', '#2b4539', '#0077b6'];
        }
    });

    // Password Analyzer (keep rest of logic...)
    const passwordInput = document.getElementById('password-input');
    const strengthBar = document.getElementById('strength-bar');
    const strengthLabel = document.getElementById('strength-label');
    const strengthScore = document.getElementById('strength-score');
    const feedbackContainer = document.getElementById('feedback-container');
    const toggleVisibility = document.getElementById('toggle-visibility');

    passwordInput.addEventListener('input', () => {
        const pwd = passwordInput.value;
        const result = getStrength(pwd);
        
        strengthBar.style.width = `${result.score}%`;
        strengthBar.style.backgroundColor = result.color;
        strengthLabel.textContent = result.label;
        strengthLabel.style.color = result.color;
        strengthScore.textContent = `${result.score}/100`;
        
        feedbackContainer.innerHTML = '';
        result.feedback.forEach(text => {
            const item = document.createElement('div');
            item.className = 'feedback-item';
            item.textContent = text;
            feedbackContainer.appendChild(item);
        });
    });

    toggleVisibility.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleVisibility.textContent = isPassword ? '🙈' : '👁️';
    });

    // Password Generator
    const lengthSlider = document.getElementById('length-slider');
    const lengthValue = document.getElementById('length-value');
    const generateBtn = document.getElementById('generate-btn');
    const generatedContainer = document.getElementById('generated-container');
    const generatedPassword = document.getElementById('generated-password');
    const copyBtn = document.getElementById('copy-btn');
    const copyStatus = document.getElementById('copy-status');

    lengthSlider.addEventListener('input', () => {
        lengthValue.textContent = lengthSlider.value;
    });

    generateBtn.addEventListener('click', () => {
        const pwd = generatePassword(parseInt(lengthSlider.value));
        generatedPassword.textContent = pwd;
        generatedContainer.classList.remove('hidden');
        copyStatus.textContent = '';
    });

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(generatedPassword.textContent).then(() => {
            copyStatus.textContent = 'Copied to clipboard!';
            setTimeout(() => { copyStatus.textContent = ''; }, 2000);
        });
    });
});
