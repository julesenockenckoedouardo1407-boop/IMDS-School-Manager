const app = document.getElementById('app');
const tabs = [...document.querySelectorAll('.tab')];
let currentView = 'dashboard';

const money = n => new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(Number(n)||0);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

async function render() {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.view === currentView));
  const students = await dbAll('students');
  const payments = await dbAll('payments');
  const finance = await dbAll('finance');

  if (currentView === 'dashboard') {
    const totalPaid = payments.reduce((a,p)=>a+Number(p.amount||0),0);
    app.innerHTML = `
      <section class="hero"><h1>Bienvenue dans IMDS School Manager</h1>
      <p>Une base solide pour gérer l'école, avec stockage local et fonctionnement hors connexion.</p></section>
      <section class="cards">
        <div class="card"><b>${students.length}</b><span>Élèves</span></div>
        <div class="card"><b>${money(totalPaid)}</b><span>Paiements enregistrés</span></div>
        <div class="card"><b>${finance.length}</b><span>Opérations financières</span></div>
        <div class="card"><b>${navigator.onLine?'En ligne':'Hors connexion'}</b><span>État réseau</span></div>
      </section>
      <section class="panel"><h2>Démarrage rapide</h2>
      <div class="quick">
        <button onclick="go('students')">Ajouter un élève</button>
        <button onclick="go('payments')">Enregistrer un paiement</button>
        <button onclick="go('grades')">Saisir une note</button>
        <button onclick="go('attendance')">Marquer les présences</button>
      </div></section>`;
  }

  if (currentView === 'students') renderStudents(students);
  if (currentView === 'payments') renderPayments(students, payments);
  if (currentView === 'grades') renderGrades(students);
  if (currentView === 'attendance') renderAttendance(students);
  if (currentView === 'finance') renderFinance(finance);
  if (currentView === 'settings') renderSettings();
}

function renderStudents(students) {
  app.innerHTML = `<section class="panel"><h1>Élèves</h1>
    <form id="studentForm" class="formgrid">
      <input name="name" placeholder="Nom complet" required>
      <input name="className" placeholder="Classe" required>
      <input name="parent" placeholder="Parent / responsable">
      <input name="phone" placeholder="Téléphone">
      <button>Enregistrer l'élève</button>
    </form>
    <div class="tablewrap"><table><thead><tr><th>ID</th><th>Élève</th><th>Classe</th><th>Responsable</th><th>Téléphone</th></tr></thead>
    <tbody>${students.map(s=>`<tr><td>${s.id}</td><td>${esc(s.name)}</td><td>${esc(s.className)}</td><td>${esc(s.parent)}</td><td>${esc(s.phone)}</td></tr>`).join('')||'<tr><td colspan="5">Aucun élève.</td></tr>'}</tbody></table></div>
  </section>`;
  document.getElementById('studentForm').onsubmit = async e => {
    e.preventDefault(); await dbAdd('students', Object.fromEntries(new FormData(e.target))); e.target.reset(); render();
  };
}

function studentOptions(students) { return students.map(s=>`<option value="${s.id}">${esc(s.name)} — ${esc(s.className)}</option>`).join(''); }

function renderPayments(students, payments) {
  const total = payments.reduce((a,p)=>a+Number(p.amount||0),0);
  app.innerHTML = `<section class="panel"><h1>Paiements</h1>
    <form id="paymentForm" class="formgrid">
      <select name="studentId" required>${studentOptions(students)}</select>
      <input name="label" placeholder="Motif (ex. frais scolaires)" required>
      <input name="amount" type="number" min="0" step="1" placeholder="Montant payé" required>
      <input name="date" type="date" value="${new Date().toISOString().slice(0,10)}">
      <button>Enregistrer</button>
    </form>
    <p class="total">Total enregistré : <strong>${money(total)}</strong></p>
    <div class="tablewrap"><table><thead><tr><th>Date</th><th>Élève</th><th>Motif</th><th>Montant</th></tr></thead><tbody>
    ${payments.map(p=>{const s=students.find(x=>x.id==p.studentId);return `<tr><td>${p.date||''}</td><td>${esc(s?.name||'Supprimé')}</td><td>${esc(p.label)}</td><td>${money(p.amount)}</td></tr>`}).join('')||'<tr><td colspan="4">Aucun paiement.</td></tr>'}
    </tbody></table></div></section>`;
  document.getElementById('paymentForm').onsubmit = async e => {e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.amount=Number(d.amount);d.studentId=Number(d.studentId);await dbAdd('payments',d);render();};
}

function renderGrades(students) {
  app.innerHTML = `<section class="panel"><h1>Notes</h1>
  <form id="gradeForm" class="formgrid"><select name="studentId" required>${studentOptions(students)}</select>
  <input name="subject" placeholder="Matière" required><input name="score" type="number" min="0" max="100" placeholder="Note /100" required>
  <input name="period" placeholder="Période"><button>Enregistrer la note</button></form>
  <p class="muted">Module de base : les notes sont stockées hors connexion. Les bulletins et moyennes pourront être ajoutés dans la prochaine version.</p></section>`;
  document.getElementById('gradeForm').onsubmit = async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.studentId=Number(d.studentId);d.score=Number(d.score);await dbAdd('grades',d);e.target.reset();};
}

function renderAttendance(students) {
  app.innerHTML = `<section class="panel"><h1>Présences</h1>
  <form id="attendanceForm" class="formgrid"><select name="studentId" required>${studentOptions(students)}</select>
  <input name="date" type="date" value="${new Date().toISOString().slice(0,10)}">
  <select name="status"><option>Présent</option><option>Absent</option><option>Retard</option></select>
  <button>Enregistrer</button></form></section>`;
  document.getElementById('attendanceForm').onsubmit = async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.studentId=Number(d.studentId);await dbAdd('attendance',d);e.target.reset();};
}

function renderFinance(finance) {
  app.innerHTML = `<section class="panel"><h1>Finances</h1>
  <form id="financeForm" class="formgrid"><select name="type"><option>Recette</option><option>Dépense</option></select>
  <input name="label" placeholder="Description" required><input name="amount" type="number" min="0" step="1" placeholder="Montant" required>
  <input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"><button>Enregistrer</button></form>
  <div class="tablewrap"><table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Montant</th></tr></thead><tbody>
  ${finance.map(f=>`<tr><td>${f.date||''}</td><td>${esc(f.type)}</td><td>${esc(f.label)}</td><td>${money(f.amount)}</td></tr>`).join('')||'<tr><td colspan="4">Aucune opération.</td></tr>'}</tbody></table></div></section>`;
  document.getElementById('financeForm').onsubmit = async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.amount=Number(d.amount);await dbAdd('finance',d);render();};
}

function renderSettings() {
  app.innerHTML = `<section class="panel"><h1>Sécurité & sauvegarde</h1>
  <div class="warning"><strong>Important :</strong> cette version est un prototype local. Avant une utilisation réelle avec des données sensibles, il faudra ajouter authentification, rôles, chiffrement, journal d'audit, sauvegarde distante sécurisée et synchronisation serveur.</div>
  <button id="backup">Exporter une sauvegarde</button>
  <button id="clear" class="danger">Effacer toutes les données locales</button></section>`;
  document.getElementById('backup').onclick=exportBackup;
  document.getElementById('clear').onclick=async()=>{if(confirm('Effacer toutes les données de cet appareil ?')){for(const s of ['students','payments','grades','attendance','finance']) await dbClear(s);render();}};
}

function go(v){currentView=v;render();}
window.go=go;
tabs.forEach(t=>t.onclick=()=>{currentView=t.dataset.view;render();});
render();

let deferredPrompt;
window.addEventListener('beforeinstallprompt', e=>{e.preventDefault();deferredPrompt=e;document.getElementById('installBtn').classList.remove('hidden');});
document.getElementById('installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;}};
