const KEY="imds_school_manager_v2";
const defaultData={students:[],payments:[],grades:[],attendance:[]};
let data=loadData();

function loadData(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(defaultData)}catch(e){return structuredClone(defaultData)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data)); renderAll();}
function money(n){return new Intl.NumberFormat("fr-FR").format(Number(n)||0)+" HTG"}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function today(){return new Date().toLocaleDateString("fr-CA")}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function studentName(id){return data.students.find(s=>s.id===id)?.name||"Élève supprimé"}

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.toggle("active",s.id===id));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.section===id));
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.section)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.go)));

function renderStudents(){
  const q=document.getElementById("studentSearch").value.toLowerCase();
  const rows=data.students.filter(s=>s.name.toLowerCase().includes(q)||s.class.toLowerCase().includes(q)).map(s=>{
    const paid=data.payments.filter(p=>p.studentId===s.id).reduce((a,p)=>a+Number(p.amount),0);
    return `<tr><td>${esc(s.name)}</td><td>${esc(s.class)}</td><td>${money(s.requested)}</td><td>${money(paid)}</td><td>${money(Math.max(0,Number(s.requested)-paid))}</td><td><button class="btn mini danger" data-delete="${s.id}">Supprimer</button></td></tr>`
  }).join("");
  document.getElementById("studentsBody").innerHTML=rows||'<tr><td colspan="6">Aucun élève enregistré.</td></tr>';
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{if(confirm("Supprimer cet élève et ses données associées ?")){const id=b.dataset.delete;data.students=data.students.filter(s=>s.id!==id);data.payments=data.payments.filter(x=>x.studentId!==id);data.grades=data.grades.filter(x=>x.studentId!==id);data.attendance=data.attendance.filter(x=>x.studentId!==id);save();toast("Élève supprimé");}});
}
function fillStudentSelects(){
  const options=data.students.map(s=>`<option value="${s.id}">${esc(s.name)} — ${esc(s.class)}</option>`).join("");
  ["paymentStudent","gradeStudent","attendanceStudent"].forEach(id=>document.getElementById(id).innerHTML=options||'<option value="">Aucun élève</option>');
}
function renderPayments(){
  document.getElementById("paymentsBody").innerHTML=data.payments.slice().reverse().map(p=>`<tr><td>${p.date}</td><td>${esc(studentName(p.studentId))}</td><td>${esc(p.reason)}</td><td>${money(p.amount)}</td></tr>`).join("")||'<tr><td colspan="4">Aucun paiement.</td></tr>';
}
function renderGrades(){
  document.getElementById("gradesBody").innerHTML=data.grades.slice().reverse().map(g=>`<tr><td>${esc(studentName(g.studentId))}</td><td>${esc(g.subject)}</td><td>${g.value}/100</td><td>${g.date}</td></tr>`).join("")||'<tr><td colspan="4">Aucune note.</td></tr>';
}
function renderAttendance(){
  document.getElementById("attendanceBody").innerHTML=data.attendance.slice().reverse().slice(0,100).map(a=>`<tr><td>${a.date}</td><td>${esc(studentName(a.studentId))}</td><td>${esc(a.status)}</td></tr>`).join("")||'<tr><td colspan="3">Aucune présence.</td></tr>';
}
function renderFinance(){
  let requested=0,paid=0;
  const rows=data.students.map(s=>{const p=data.payments.filter(x=>x.studentId===s.id).reduce((a,x)=>a+Number(x.amount),0);requested+=Number(s.requested);paid+=p;return `<tr><td>${esc(s.name)}</td><td>${money(s.requested)}</td><td>${money(p)}</td><td>${money(Math.max(0,Number(s.requested)-p))}</td></tr>`}).join("");
  document.getElementById("financeBody").innerHTML=rows||'<tr><td colspan="4">Aucun élève.</td></tr>';
  document.getElementById("financeRequested").textContent=money(requested);
  document.getElementById("financePaid").textContent=money(paid);
  document.getElementById("financeBalance").textContent=money(Math.max(0,requested-paid));
  document.getElementById("statRevenue").textContent=money(paid);
  document.getElementById("statBalance").textContent=money(Math.max(0,requested-paid));
}
function renderDashboard(){
  document.getElementById("statStudents").textContent=data.students.length;
  document.getElementById("statAttendance").textContent=data.attendance.filter(a=>a.date===today()).length;
}
function renderAll(){renderStudents();fillStudentSelects();renderPayments();renderGrades();renderAttendance();renderFinance();renderDashboard()}

document.getElementById("studentForm").addEventListener("submit",e=>{
 e.preventDefault();
 data.students.push({id:uid(),name:studentName.value.trim(),class:studentClass.value,phone:studentPhone.value.trim(),requested:Number(studentAmount.value)||0});
 e.target.reset();studentAmount.value=0;save();toast("Élève ajouté");
});
document.getElementById("studentSearch").addEventListener("input",renderStudents);

document.getElementById("paymentForm").addEventListener("submit",e=>{
 e.preventDefault();
 const sid=paymentStudent.value;if(!sid){toast("Ajoutez d'abord un élève");return}
 data.payments.push({id:uid(),studentId:sid,amount:Number(paymentAmount.value),reason:paymentReason.value,date:today()});
 e.target.reset();save();toast("Paiement enregistré");
});
document.getElementById("gradeForm").addEventListener("submit",e=>{
 e.preventDefault();data.grades.push({id:uid(),studentId:gradeStudent.value,subject:gradeSubject.value.trim(),value:Number(gradeValue.value),date:today()});e.target.reset();save();toast("Note enregistrée");
});
document.getElementById("attendanceForm").addEventListener("submit",e=>{
 e.preventDefault();data.attendance.push({id:uid(),studentId:attendanceStudent.value,status:attendanceStatus.value,date:today()});save();toast("Présence enregistrée");
});

document.getElementById("exportBtn").onclick=()=>{
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`IMDS-sauvegarde-${today()}.json`;a.click();URL.revokeObjectURL(a.href);
 document.getElementById("securityMessage").textContent="Sauvegarde exportée.";
};
document.getElementById("importFile").onchange=e=>{
 const file=e.target.files[0];if(!file)return;
 const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.students||!x.payments||!x.grades||!x.attendance)throw Error();data=x;save();toast("Sauvegarde importée")}catch{alert("Fichier de sauvegarde invalide.")}};r.readAsText(file);
};
document.getElementById("clearBtn").onclick=()=>{
 if(confirm("ATTENTION : effacer toutes les données locales de cette application ?")){data=structuredClone(defaultData);save();toast("Données locales effacées")}
};

let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;document.getElementById("installBtn").classList.remove("hidden")});
document.getElementById("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.getElementById("installBtn").classList.add("hidden")}};

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.error))}
renderAll();
