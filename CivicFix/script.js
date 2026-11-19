const issueForm = document.getElementById("issueForm");
const issueList = document.getElementById("issueList");
const emptyMessage = document.getElementById("emptyMessage");

const STORAGE_KEY = "civicfixReports";

let issues = [];

try {
    const savedIssues = JSON.parse(localStorage.getItem(STORAGE_KEY));
    issues = Array.isArray(savedIssues) ? savedIssues : [];
} catch {
    issues = [];
}

const statuses = ["Reported", "In Progress", "Resolved"];

function saveIssues() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function updateDashboard() {
    const total = issues.length;
    const reported = issues.filter(i => i.status === "Reported").length;
    const progress = issues.filter(i => i.status === "In Progress").length;
    const resolved = issues.filter(i => i.status === "Resolved").length;

    const rate = total === 0 ? 0 : Math.round((resolved / total) * 100);

    document.getElementById("totalReports").textContent = total;
    document.getElementById("reportedCount").textContent = reported;
    document.getElementById("progressCount").textContent = progress;
    document.getElementById("resolvedCount").textContent = resolved;

    document.getElementById("resolutionRate").textContent = rate + "%";
    document.getElementById("resolutionBar").style.width = rate + "%";
}

function updateCategorySummary() {
    const summary = document.getElementById("categorySummary");
    summary.innerHTML = "";

    const categories = [
        "Road Damage",
        "Garbage",
        "Streetlight",
        "Water Leakage",
        "Drainage",
        "Other"
    ];

    categories.forEach(category => {
        const count = issues.filter(i => i.category === category).length;

        const item = createElement("div", "category-item");
        item.append(
            createElement("span", "", category),
            createElement("strong", "", count)
        );

        summary.appendChild(item);
    });
}

function renderIssues() {
    issueList.innerHTML = "";

    const search = document.getElementById("searchInput")
        .value.trim().toLowerCase();

    const category = document.getElementById("categoryFilter").value;
    const status = document.getElementById("statusFilter").value;

    const filtered = issues.filter(issue => {
        const matchesSearch =
            issue.title.toLowerCase().includes(search) ||
            issue.location.toLowerCase().includes(search);

        const matchesCategory =
            category === "All" || issue.category === category;

        const matchesStatus =
            status === "All" || issue.status === status;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    emptyMessage.style.display = filtered.length ? "none" : "block";

    filtered.forEach(issue => {
        const card = createElement("article",
            "issue-card " + issue.status.toLowerCase().replace(" ", "-"));

        const title = createElement("h3", "", issue.title);

        const categoryText = createElement(
            "p", "issue-meta", "Category: " + issue.category
        );

        const locationText = createElement(
            "p", "issue-meta", "Location: " + issue.location
        );

        const reporterText = createElement(
            "p", "issue-meta", "Reported by: " + issue.reporter
        );

        const dateText = createElement(
            "p", "issue-meta", "Date: " + issue.date
        );

        const description = createElement(
            "p", "issue-description", issue.description
        );

        const statusBadge = createElement(
            "span",
            "issue-status " + issue.status.toLowerCase().replace(" ", "-"),
            issue.status
        );

        const actions = createElement("div", "issue-actions");

        const statusButton = createElement("button", "status-button");
        statusButton.textContent = issue.status === "Resolved"
            ? "Reopen Report"
            : "Update Status";

        statusButton.addEventListener("click", () => {
            const currentIndex = statuses.indexOf(issue.status);
            issue.status = statuses[(currentIndex + 1) % statuses.length];
            saveIssues();
            renderIssues();
        });

        const deleteButton = createElement("button", "delete-button", "Delete");

        deleteButton.addEventListener("click", () => {
            issues = issues.filter(item => item.id !== issue.id);
            saveIssues();
            renderIssues();
        });

        actions.append(statusButton, deleteButton);

        card.append(
            title,
            categoryText,
            locationText,
            reporterText,
            dateText,
            description,
            statusBadge,
            actions
        );

        issueList.appendChild(card);
    });

    updateDashboard();
    updateCategorySummary();
}

issueForm.addEventListener("submit", event => {
    event.preventDefault();

    const issue = {
        id: Date.now(),
        title: document.getElementById("issueTitle").value.trim(),
        category: document.getElementById("category").value,
        location: document.getElementById("location").value.trim(),
        reporter: document.getElementById("reporter").value.trim(),
        description: document.getElementById("description").value.trim(),
        status: "Reported",
        date: new Date().toLocaleDateString()
    };

    if (
        !issue.title ||
        !issue.category ||
        !issue.location ||
        !issue.reporter ||
        !issue.description
    ) {
        return;
    }

    issues.unshift(issue);
    saveIssues();
    issueForm.reset();
    renderIssues();
});

document.getElementById("searchInput")
    .addEventListener("input", renderIssues);

document.getElementById("categoryFilter")
    .addEventListener("change", renderIssues);

document.getElementById("statusFilter")
    .addEventListener("change", renderIssues);

renderIssues();