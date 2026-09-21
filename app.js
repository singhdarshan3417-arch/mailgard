const modal = document.querySelector("#expense-modal");
const openExpense = document.querySelector("#open-expense");
const closeExpense = document.querySelector("#close-expense");
const expenseForm = document.querySelector("#expense-form");
const transactionList = document.querySelector("#transaction-list");
const spentAmount = document.querySelector("#spent-amount");
const availableAmount = document.querySelector("#available-amount");
const spentProgress = document.querySelector("#spent-progress");

let totalSpent = 1159.50;
const monthlyBudget = 3000;

function formatMoney(value) {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toggleModal(show) {
    modal.classList.toggle("hidden", !show);
    if (show) document.querySelector("#expense-name").focus();
}

function updateSummary() {
    const available = monthlyBudget - totalSpent;
    spentAmount.textContent = formatMoney(totalSpent);
    availableAmount.textContent = formatMoney(available);
    spentProgress.style.width = `${Math.min(100, (totalSpent / monthlyBudget) * 100)}%`;
    spentProgress.parentElement.nextElementSibling.innerHTML = `<span>${((totalSpent / monthlyBudget) * 100).toFixed(1)}% used</span><span>${formatMoney(available)} left</span>`;
}

openExpense.addEventListener("click", () => toggleModal(true));
closeExpense.addEventListener("click", () => toggleModal(false));
modal.addEventListener("click", (event) => { if (event.target === modal) toggleModal(false); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") toggleModal(false); });

expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#expense-name").value.trim();
    const amount = Number(document.querySelector("#expense-amount").value);
    const category = document.querySelector("#expense-category").value;
    if (!name || !Number.isFinite(amount) || amount <= 0) return;

    totalSpent += amount;
    const item = document.createElement("div");
    item.className = "transaction";
    const icon = document.createElement("span");
    icon.className = "merchant-icon grocery";
    icon.textContent = "✦";
    const details = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = name;
    const metadata = document.createElement("small");
    metadata.textContent = `Just now · ${category}`;
    details.append(title, metadata);
    const value = document.createElement("b");
    value.textContent = `−${formatMoney(amount)}`;
    item.append(icon, details, value);
    transactionList.prepend(item);
    updateSummary();
    expenseForm.reset();
    toggleModal(false);
});
