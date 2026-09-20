const SAMPLE_EMAIL = `From: security-alert@micr0soft-support.com
Subject: Urgent: Your account will be suspended

We detected unusual activity. Verify your account immediately within 24 hours:
http://bit.ly/verify-account

Confirm your password and payment details to avoid suspension.`;

const rules = [
    { name: "Urgent or threatening language", weight: 18, pattern: /\b(urgent|immediately|act now|within \d+ hours?|suspend(?:ed|sion)?|last warning|final notice)\b/i, detail: "The message creates time pressure or threatens account loss." },
    { name: "Credential or payment request", weight: 24, pattern: /\b(password|passcode|login|sign in|verify your account|payment details|credit card|bank details|one[- ]time code|otp)\b/i, detail: "Requests for secrets or financial data are common phishing signals." },
    { name: "Suspicious shortened link", weight: 20, pattern: /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|ow\.ly)\b/i, detail: "Short links hide the destination and deserve extra scrutiny." },
    { name: "Insecure link", weight: 12, pattern: /\bhttp:\/\/\S+/i, detail: "The message contains a link that does not use HTTPS." },
    { name: "Lookalike sender domain", weight: 22, pattern: /\b(micr[o0]soft|paypa[l1]|g[o0][o0]gle|amaz[o0]n|app[l1]e|netfl[i1]x)[-_]?(support|security|billing)?\b/i, detail: "The sender appears to imitate a well-known brand." },
    { name: "Unexpected attachment", weight: 16, pattern: /\b(attachment|attached|invoice|receipt|document)\b.*\b(enable macros?|run|open|download)\b|\b(download|open)\b.*\b(attachment|invoice|document)\b/i, detail: "Unexpected documents can deliver malware or exploit vulnerabilities." },
    { name: "Impersonation language", weight: 10, pattern: /\b(ceo|chief executive|it support|helpdesk|security team|admin(?:istrator)?)\b/i, detail: "Attackers often impersonate trusted internal roles." }
];

const input = document.querySelector("#email-input");
const analyzeButton = document.querySelector("#analyze-btn");
const sampleButton = document.querySelector("#sample-btn");
const count = document.querySelector("#character-count");
const scanCount = document.querySelector("#scan-count");

function analyzeEmail(text) {
    const indicators = rules.filter((rule) => rule.pattern.test(text));
    const score = Math.min(100, indicators.reduce((total, rule) => total + rule.weight, 0));
    const links = text.match(/\bhttps?:\/\/[^\s<>"')]+/gi) || [];
    const scoreWithLinks = Math.min(100, score + (links.length > 2 ? 8 : 0));
    return { score: scoreWithLinks, indicators, links };
}

function getVerdict(score) {
    if (score >= 60) return { label: "High risk", title: "Likely malicious", copy: "Multiple high-confidence phishing signals were found.", action: "Do not click links, open attachments, or reply. Report the message to your security team and remove it." };
    if (score >= 30) return { label: "Review", title: "Needs manual review", copy: "The message contains suspicious signals that need verification.", action: "Verify the sender through a separate trusted channel. Avoid sharing credentials or payment information." };
    return { label: "Low risk", title: "No strong signals found", copy: "This scan did not find common phishing indicators.", action: "Continue to treat unexpected requests carefully. Confirm sensitive actions through a trusted channel." };
}

function renderResults(result) {
    const verdict = getVerdict(result.score);
    document.querySelector("#empty-state").classList.add("hidden");
    document.querySelector("#results").classList.remove("hidden");
    document.querySelector("#risk-score").textContent = result.score;
    document.querySelector("#risk-badge").textContent = verdict.label;
    document.querySelector("#risk-badge").className = `risk-badge ${result.score >= 60 ? "high" : result.score >= 30 ? "medium" : "low"}`;
    document.querySelector("#verdict-title").textContent = verdict.title;
    document.querySelector("#verdict-copy").textContent = verdict.copy;
    document.querySelector("#recommendation").textContent = verdict.action;
    document.querySelector("#meter-fill").style.width = `${result.score}%`;
    document.querySelector("#meter-fill").className = result.score >= 60 ? "high" : result.score >= 30 ? "medium" : "low";
    document.querySelector("#indicator-count").textContent = `${result.indicators.length} found`;
    const list = document.querySelector("#indicator-list");
    list.replaceChildren();
    if (!result.indicators.length) {
        const item = document.createElement("li");
        item.className = "indicator clear";
        item.innerHTML = "<span>✓</span><div><strong>No matching indicators</strong><p>Keep validating unexpected requests out of band.</p></div>";
        list.appendChild(item);
    } else {
        result.indicators.forEach((indicator) => {
            const item = document.createElement("li");
            item.className = "indicator";
            item.innerHTML = `<span>!</span><div><strong>${indicator.name}</strong><p>${indicator.detail}</p></div><b>+${indicator.weight}</b>`;
            list.appendChild(item);
        });
    }
}

input.addEventListener("input", () => { count.textContent = `${input.value.length.toLocaleString()} characters`; });
sampleButton.addEventListener("click", () => { input.value = SAMPLE_EMAIL; input.dispatchEvent(new Event("input")); input.focus(); });
analyzeButton.addEventListener("click", () => {
    if (!input.value.trim()) { input.focus(); return; }
    renderResults(analyzeEmail(input.value));
    scanCount.textContent = Number(scanCount.textContent) + 1;
});
