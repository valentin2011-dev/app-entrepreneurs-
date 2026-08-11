const STORAGE_KEY = "v-problemes-data-v1";

const defaultCategories = [
  "Administratif",
  "Comptabilité",
  "Marketing / communication",
  "Vente (devis, relances)",
  "Recrutement",
  "Formation / gestion d’équipe",
  "Suivi des livraisons"
];

let data = loadData();
let activeCategory = null;
let deferredInstallPrompt = null;

const $ = (id) => document.getElementById(id);

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.categories?.length && Array.isArray(saved.people)) return saved;
  } catch {}
  return {
    categories: defaultCategories.map((name, i) => ({ id: i + 1, name })),
    people: []
  };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function render() {
  renderStats();
  renderRanking();
  renderCategories();
  renderPeople();
}

function renderStats() {
  $("totalEntrepreneurs").textContent = data.people.length;
  $("totalProblems").textContent = data.people.length;
}

function countFor(categoryId) {
  return data.people.filter(p => p.categoryId === categoryId).length;
}

function renderRanking() {
  const ranking = data.categories
    .map(c => ({ ...c, count: countFor(c.id) }))
    .sort((a, b) => b.count - a.count);

  const max = Math.max(1, ...ranking.map(r => r.count));
  $("ranking").innerHTML = ranking.map((r, i) => `
    <div class="rank-row">
      <div class="rank-number">${i + 1}</div>
      <div class="rank-name">${escapeHtml(r.name)}</div>
      <div class="bar-wrap"><div class="bar" style="width:${(r.count / max) * 100}%"></div></div>
      <div class="rank-count">${r.count} ${r.count > 1 ? "entrepreneurs" : "entrepreneur"}</div>
    </div>
  `).join("");
}

function renderCategories() {
  $("categories").innerHTML = data.categories.map(c => {
    const count = countFor(c.id);
    return `
      <div class="category">
        <div class="badge">${count}</div>
        <div class="category-info">
          <div class="category-name">${escapeHtml(c.name)}</div>
          <div class="category-count">${count === 0 ? "Aucune observation" : `${count} observation${count > 1 ? "s" : ""}`}</div>
        </div>
        <button class="plus" data-add="${c.id}" aria-label="Ajouter un entrepreneur à ${escapeHtml(c.name)}">+</button>
      </div>
    `;
  }).join("");

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => openModal(Number(btn.dataset.add)));
  });
}

function renderPeople() {
  const query = $("searchInput").value.trim().toLowerCase();
  const people = data.people
    .filter(p => p.name.toLowerCase().includes(query) || p.note.toLowerCase().includes(query))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!people.length) {
    $("peopleTable").innerHTML = `<div class="empty">${query ? "Aucun résultat." : "Aucun entrepreneur ajouté pour le moment."}</div>`;
    return;
  }

  $("peopleTable").innerHTML = `<div class="people-list">${people.map(p => {
    const category = data.categories.find(c => c.id === p.categoryId);
    const importanceLabel = { high: "Forte", medium: "Moyenne", low: "Faible" }[p.importance] || "Moyenne";
    const importanceClass = `importance-${p.importance || "medium"}`;
    const hours = Number(p.hours || 0);
    const date = new Date(p.createdAt).toLocaleDateString("fr-FR");
    return `
      <article class="person">
        <div>
          <div class="person-name">${escapeHtml(p.name)}</div>
          <div class="person-category">${escapeHtml(category?.name || "Catégorie supprimée")}</div>
        </div>
        <div class="${importanceClass}">${importanceLabel}</div>
        <div class="person-note">${escapeHtml(p.note)}</div>
        <div class="person-meta">${hours ? `${hours} h/sem.` : "—"}<br>${date}</div>
      </article>
    `;
  }).join("")}</div>`;
}

function openModal(categoryId) {
  activeCategory = data.categories.find(c => c.id === categoryId);
  if (!activeCategory) return;
  $("modalCategory").textContent = activeCategory.name;
  $("personForm").reset();
  $("importanceInput").value = "medium";
  $("modal").classList.remove("hidden");
  setTimeout(() => $("nameInput").focus(), 50);
}

function closeModal() {
  $("modal").classList.add("hidden");
  activeCategory = null;
}

$("personForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!activeCategory) return;

  const person = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    categoryId: activeCategory.id,
    name: $("nameInput").value.trim(),
    note: $("noteInput").value.trim(),
    importance: $("importanceInput").value,
    hours: Number($("hoursInput").value || 0),
    createdAt: new Date().toISOString()
  };

  if (!person.name || !person.note) return;

  data.people.push(person);
  saveData();
  render();
  closeModal();
  showToast(`${person.name} ajouté dans « ${activeCategory.name} »`);
});

$("closeModal").addEventListener("click", closeModal);
$("cancelBtn").addEventListener("click", closeModal);
$("modal").addEventListener("click", (e) => {
  if (e.target.dataset.close) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
$("searchInput").addEventListener("input", renderPeople);

$("resetBtn").addEventListener("click", () => {
  const ok = confirm("Supprimer toutes les observations ? Cette action est irréversible.");
  if (!ok) return;
  data.people = [];
  saveData();
  render();
  showToast("Toutes les observations ont été supprimées.");
});

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// PWA installation
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  $("installBtn").classList.remove("hidden");
});

$("installBtn").addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  $("installBtn").classList.add("hidden");
});

// Service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(console.error));
}

render();
