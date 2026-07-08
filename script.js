const KEY='guideline-fitout-erp-v1';
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const today=()=>new Date().toISOString().slice(0,10);
const money=n=>'AED '+Number(n||0).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2});
const demo={
  companies:[
    {id:'gi',name:'Guideline Interiors',type:'Main office',role:'Quotations, client approvals, project management'},
    {id:'gd',name:'Guideline Decor',type:'Joinery factory',role:'Joinery job orders, purchase requests, labour production'}
  ],
  quotations:[
    {id:'q1',no:'GI-Q-1001',client:'Palm Villa Client',date:today(),amount:185000,status:'Approved',scope:'Villa interior fit-out with wardrobes and kitchen'},
    {id:'q2',no:'GI-Q-1002',client:'Downtown Office',date:today(),amount:72000,status:'Draft',scope:'Office partitions, doors, reception counter'}
  ],
  projects:[
    {id:'p1',quotationId:'q1',no:'GI-P-2401',name:'Palm Villa Fit-Out',client:'Palm Villa Client',start:today(),status:'Active',budget:185000}
  ],
  jobOrders:[
    {id:'j1',no:'GD-JO-501',projectId:'p1',fromCompany:'gi',toCompany:'gd',date:today(),scope:'Kitchen cabinets, wardrobes, vanity counters',status:'Issued',quotedValue:68500}
  ],
  purchaseRequests:[
    {id:'pr1',no:'PR-8001',jobOrderId:'j1',date:today(),requestedBy:'Factory Supervisor',supplier:'Wood Supplier LLC',item:'MDF boards, laminate, hardware',amount:12600,status:'Approved'}
  ],
  purchases:[
    {id:'po1',no:'LPO-3001',prId:'pr1',jobOrderId:'j1',date:today(),supplier:'Wood Supplier LLC',amount:12600,hasLpo:'Yes',status:'Issued'}
  ],
  labour:[
    {id:'l1',jobOrderId:'j1',date:today(),worker:'Carpenter A',trade:'Carpentry',hours:8,rate:28},
    {id:'l2',jobOrderId:'j1',date:today(),worker:'Painter B',trade:'Painting',hours:6,rate:24}
  ],
  expenses:[
    {id:'e1',projectId:'p1',jobOrderId:'j1',date:today(),category:'Transport',amount:350,note:'Delivery to site'}
  ]
};
let db=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(demo);
let view='dashboard';
const $=s=>document.querySelector(s);
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
const quotation=id=>db.quotations.find(x=>x.id===id)||{};
const project=id=>db.projects.find(x=>x.id===id)||{};
const job=id=>db.jobOrders.find(x=>x.id===id)||{};
const pr=id=>db.purchaseRequests.find(x=>x.id===id)||{};
const jobMaterialCost=id=>db.purchases.filter(x=>x.jobOrderId===id).reduce((s,x)=>s+(+x.amount||0),0);
const jobLabourCost=id=>db.labour.filter(x=>x.jobOrderId===id).reduce((s,x)=>s+(+x.hours||0)*(+x.rate||0),0);
const jobExpenseCost=id=>db.expenses.filter(x=>x.jobOrderId===id).reduce((s,x)=>s+(+x.amount||0),0);
const projectCost=id=>db.jobOrders.filter(j=>j.projectId===id).reduce((s,j)=>s+jobMaterialCost(j.id)+jobLabourCost(j.id)+jobExpenseCost(j.id),0)+db.expenses.filter(e=>e.projectId===id&&!e.jobOrderId).reduce((s,e)=>s+(+e.amount||0),0);
const nav=[['dashboard','▣','Dashboard'],['quotations','Q','Quotations'],['projects','P','Projects'],['joborders','J','Job orders'],['requests','R','Purchase requests'],['purchases','L','LPO / purchases'],['labour','H','Labour costing'],['reports','▤','Cost reports']];
function init(){
  $('#today').textContent=new Date().toLocaleDateString('en-AE',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  $('#nav').innerHTML=nav.map(n=>`<button class="nav-btn ${n[0]===view?'active':''}" data-view="${n[0]}"><span>${n[1]}</span>${n[2]}</button>`).join('');
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render()});
  $('#resetDemo').onclick=()=>{if(confirm('Start fresh? This removes demo quotations, projects, job orders, purchases, labour and expenses.')){db={...structuredClone(demo),quotations:[],projects:[],jobOrders:[],purchaseRequests:[],purchases:[],labour:[],expenses:[]};save();render();toast('Fresh ERP ready.')}};
  render();
}
function render(){
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  $('#pageTitle').textContent=nav.find(x=>x[0]===view)[2];
  $('#app').innerHTML=({dashboard,quotations,projects,joborders,requests,purchases,labour,reports})[view]();
  bindForms();
}
function dashboard(){
  const approved=db.quotations.filter(q=>q.status==='Approved').reduce((s,q)=>s+(+q.amount||0),0), projectBudget=db.projects.reduce((s,p)=>s+(+p.budget||0),0), cost=db.projects.reduce((s,p)=>s+projectCost(p.id),0), labourCost=db.labour.reduce((s,l)=>s+(+l.hours||0)*(+l.rate||0),0);
  return `<div class="grid stats"><div class="card stat"><small>Approved quotations</small><strong>${money(approved)}</strong><span class="hint">Guideline Interiors</span></div><div class="card stat"><small>Project budgets</small><strong>${money(projectBudget)}</strong><span class="hint">Active project value</span></div><div class="card stat"><small>Total tracked cost</small><strong>${money(cost)}</strong><span class="hint">Materials, labour, expenses</span></div><div class="card stat"><small>Labour cost</small><strong>${money(labourCost)}</strong><span class="hint">Factory/site manpower</span></div></div><section class="card"><div class="section-head"><h2>Company workflow</h2></div><div class="flow"><div class="flow-step"><strong>Guideline Interiors</strong>Quotation</div><div class="flow-step"><strong>Client approval</strong>Project</div><div class="flow-step"><strong>Joinery scope</strong>Job order to Decor</div><div class="flow-step"><strong>Guideline Decor</strong>Purchase request / LPO</div><div class="flow-step"><strong>Cost control</strong>Materials + labour</div></div></section><div class="grid two" style="margin-top:18px"><section class="card"><div class="section-head"><h2>Active projects</h2></div>${projectTable(db.projects)}</section><section class="card"><div class="section-head"><h2>Open job orders</h2></div>${jobTable(db.jobOrders)}</section></div>`;
}
function quotationTable(rows){return `<table><thead><tr><th>No.</th><th>Client</th><th>Scope</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(q=>`<tr><td><b>${q.no}</b><br><small>${q.date}</small></td><td>${q.client}</td><td>${q.scope}</td><td class="money">${money(q.amount)}</td><td><span class="badge ${q.status.toLowerCase()}">${q.status}</span></td><td>${q.status==='Approved'?`<button class="ghost" data-create-project="${q.id}">Make project</button>`:''}<button class="danger-link" data-delete-quotation="${q.id}">Remove</button></td></tr>`).join('')}</tbody></table>`}
function projectTable(rows){return rows.length?`<table><thead><tr><th>Project</th><th>Client</th><th>Budget</th><th>Tracked cost</th><th>Status</th></tr></thead><tbody>${rows.map(p=>`<tr><td><b>${p.no}</b><br><small>${p.name}</small></td><td>${p.client}</td><td class="money">${money(p.budget)}</td><td class="money">${money(projectCost(p.id))}</td><td><span class="badge ${p.status.toLowerCase()}">${p.status}</span></td></tr>`).join('')}</tbody></table>`:'<p class="empty">No projects yet.</p>'}
function jobTable(rows){return rows.length?`<table><thead><tr><th>Job order</th><th>Project</th><th>Scope</th><th>Value</th><th>Cost</th><th>Status</th></tr></thead><tbody>${rows.map(j=>`<tr><td><b>${j.no}</b><br><small>Interiors → Decor</small></td><td>${project(j.projectId).name||'—'}</td><td>${j.scope}</td><td class="money">${money(j.quotedValue)}</td><td class="money">${money(jobMaterialCost(j.id)+jobLabourCost(j.id)+jobExpenseCost(j.id))}</td><td><span class="badge ${j.status.toLowerCase()}">${j.status}</span></td></tr>`).join('')}</tbody></table>`:'<p class="empty">No job orders yet.</p>'}
function quotations(){
  return `<section class="card form-card"><div class="section-head"><h2>Add quotation — Guideline Interiors</h2></div><form id="quotationForm" class="form-grid"><label>Quotation no.<input name="no" required placeholder="GI-Q-1003"></label><label>Client<input name="client" required></label><label>Date<input name="date" type="date" value="${today()}" required></label><label>Amount<input name="amount" type="number" step="0.01" required></label><label>Status<select name="status"><option>Draft</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></label><label class="wide">Scope<textarea name="scope" required></textarea></label><button class="btn">Add quotation</button></form></section><section class="card">${quotationTable(db.quotations)}</section>`;
}
function projects(){
  return `<section class="card form-card"><div class="section-head"><h2>Add project manually</h2></div><form id="projectForm" class="form-grid"><label>Project no.<input name="no" required placeholder="GI-P-2402"></label><label>Project name<input name="name" required></label><label>Client<input name="client" required></label><label>Start date<input name="start" type="date" value="${today()}"></label><label>Budget<input name="budget" type="number" step="0.01" required></label><label>Status<select name="status"><option>Active</option><option>On Hold</option><option>Closed</option></select></label><button class="btn">Add project</button></form></section><section class="card">${projectTable(db.projects)}</section>`;
}
function joborders(){
  return `<section class="card form-card"><div class="section-head"><h2>Issue job order — Interiors to Decor</h2></div><form id="jobForm" class="form-grid"><label>Job order no.<input name="no" required placeholder="GD-JO-502"></label><label>Project<select name="projectId" required>${db.projects.map(p=>`<option value="${p.id}">${p.no} · ${p.name}</option>`).join('')}</select></label><label>Date<input name="date" type="date" value="${today()}" required></label><label>Value / internal budget<input name="quotedValue" type="number" step="0.01"></label><label>Status<select name="status"><option>Issued</option><option>In Production</option><option>Delivered</option><option>Closed</option></select></label><label class="wide">Joinery scope<textarea name="scope" required></textarea></label><button class="btn">Issue job order</button></form></section><section class="grid three">${db.jobOrders.map(j=>`<article class="card job-card"><div class="section-head"><div><h2>${j.no}</h2><span class="badge factory">Guideline Decor</span></div><button class="danger-link" data-delete-job="${j.id}">Remove</button></div><p><b>Project:</b> ${project(j.projectId).name||'—'}</p><p>${j.scope}</p><table><tbody><tr><td>Materials</td><td class="money">${money(jobMaterialCost(j.id))}</td></tr><tr><td>Labour</td><td class="money">${money(jobLabourCost(j.id))}</td></tr><tr><td>Other</td><td class="money">${money(jobExpenseCost(j.id))}</td></tr></tbody></table><p><span class="badge ${j.status.toLowerCase().replaceAll(' ','-')}">${j.status}</span></p></article>`).join('')||'<section class="card empty">No joinery job orders yet.</section>'}</section>`;
}
function requests(){
  return `<section class="card form-card"><div class="section-head"><h2>Purchase request — Guideline Decor</h2></div><form id="prForm" class="form-grid"><label>PR no.<input name="no" required placeholder="PR-8002"></label><label>Job order<select name="jobOrderId" required>${db.jobOrders.map(j=>`<option value="${j.id}">${j.no} · ${project(j.projectId).name}</option>`).join('')}</select></label><label>Date<input name="date" type="date" value="${today()}" required></label><label>Requested by<input name="requestedBy"></label><label>Supplier<input name="supplier"></label><label>Amount<input name="amount" type="number" step="0.01" required></label><label>Status<select name="status"><option>Pending</option><option>Approved</option><option>Rejected</option></select></label><label class="wide">Items / materials<textarea name="item" required></textarea></label><button class="btn">Add purchase request</button></form></section><section class="card"><table><thead><tr><th>PR</th><th>Job order</th><th>Supplier</th><th>Items</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${db.purchaseRequests.map(r=>`<tr><td><b>${r.no}</b><br><small>${r.date}</small></td><td>${job(r.jobOrderId).no||'—'}</td><td>${r.supplier||'—'}</td><td>${r.item}</td><td class="money">${money(r.amount)}</td><td><span class="badge ${r.status.toLowerCase()}">${r.status}</span></td><td><button class="danger-link" data-delete-pr="${r.id}">Remove</button></td></tr>`).join('')}</tbody></table></section>`;
}
function purchases(){
  return `<section class="card form-card"><div class="section-head"><h2>LPO / purchase</h2></div><form id="purchaseForm" class="form-grid"><label>LPO / Ref no.<input name="no" required placeholder="LPO-3002 or Cash"></label><label>Purchase request<select name="prId">${db.purchaseRequests.map(r=>`<option value="${r.id}">${r.no} · ${r.item.slice(0,35)}</option>`).join('')}<option value="">No PR</option></select></label><label>Job order<select name="jobOrderId" required>${db.jobOrders.map(j=>`<option value="${j.id}">${j.no} · ${project(j.projectId).name}</option>`).join('')}</select></label><label>Date<input name="date" type="date" value="${today()}" required></label><label>Supplier<input name="supplier"></label><label>Amount<input name="amount" type="number" step="0.01" required></label><label>With LPO?<select name="hasLpo"><option>Yes</option><option>No</option></select></label><label>Status<select name="status"><option>Issued</option><option>Delivered</option><option>Paid</option></select></label><button class="btn">Add purchase</button></form></section><section class="card"><table><thead><tr><th>Ref</th><th>PR</th><th>Job order</th><th>Supplier</th><th>LPO?</th><th>Amount</th><th></th></tr></thead><tbody>${db.purchases.map(p=>`<tr><td><b>${p.no}</b><br><small>${p.date}</small></td><td>${pr(p.prId).no||'—'}</td><td>${job(p.jobOrderId).no||'—'}</td><td>${p.supplier||'—'}</td><td><span class="badge">${p.hasLpo}</span></td><td class="money">${money(p.amount)}</td><td><button class="danger-link" data-delete-purchase="${p.id}">Remove</button></td></tr>`).join('')}</tbody></table></section>`;
}
function labour(){
  return `<section class="card form-card"><div class="section-head"><h2>Track labour per job order</h2></div><form id="labourForm" class="form-grid"><label>Job order<select name="jobOrderId" required>${db.jobOrders.map(j=>`<option value="${j.id}">${j.no} · ${project(j.projectId).name}</option>`).join('')}</select></label><label>Date<input name="date" type="date" value="${today()}" required></label><label>Worker<input name="worker" required></label><label>Trade<input name="trade" placeholder="Carpentry / painting / polish"></label><label>Hours<input name="hours" type="number" step="0.5" required></label><label>Hourly rate<input name="rate" type="number" step="0.01" required></label><button class="btn">Add labour cost</button></form></section><section class="card"><table><thead><tr><th>Date</th><th>Job order</th><th>Worker</th><th>Trade</th><th>Hours</th><th>Rate</th><th>Total</th><th></th></tr></thead><tbody>${db.labour.slice().reverse().map(l=>`<tr><td>${l.date}</td><td>${job(l.jobOrderId).no||'—'}</td><td><b>${l.worker}</b></td><td>${l.trade||'—'}</td><td>${l.hours}</td><td class="money">${money(l.rate)}</td><td class="money">${money((+l.hours||0)*(+l.rate||0))}</td><td><button class="danger-link" data-delete-labour="${l.id}">Remove</button></td></tr>`).join('')}</tbody></table></section>`;
}
function reports(){
  const rows=db.jobOrders.map(j=>({j,project:project(j.projectId),materials:jobMaterialCost(j.id),labour:jobLabourCost(j.id),expenses:jobExpenseCost(j.id),value:+j.quotedValue||0}));
  return `<section class="card"><div class="section-head"><h2>Job order costing report</h2><button class="btn secondary no-print" onclick="window.print()">Save / print PDF</button></div><table><thead><tr><th>Job order</th><th>Project</th><th>Value</th><th>Materials</th><th>Labour</th><th>Other</th><th>Total cost</th><th>Balance / margin</th></tr></thead><tbody>${rows.map(x=>{const total=x.materials+x.labour+x.expenses;return `<tr><td><b>${x.j.no}</b><br><small>${x.j.status}</small></td><td>${x.project.name||'—'}</td><td class="money">${money(x.value)}</td><td class="money">${money(x.materials)}</td><td class="money">${money(x.labour)}</td><td class="money">${money(x.expenses)}</td><td class="money">${money(total)}</td><td class="money">${money(x.value-total)}</td></tr>`}).join('')}<tr class="report-total"><td colspan="2">Total</td><td class="money">${money(rows.reduce((s,x)=>s+x.value,0))}</td><td class="money">${money(rows.reduce((s,x)=>s+x.materials,0))}</td><td class="money">${money(rows.reduce((s,x)=>s+x.labour,0))}</td><td class="money">${money(rows.reduce((s,x)=>s+x.expenses,0))}</td><td class="money">${money(rows.reduce((s,x)=>s+x.materials+x.labour+x.expenses,0))}</td><td class="money">${money(rows.reduce((s,x)=>s+x.value-x.materials-x.labour-x.expenses,0))}</td></tr></tbody></table></section><section class="card" style="margin-top:18px"><div class="section-head"><h2>Project cost summary</h2></div>${projectTable(db.projects)}</section>`;
}
function bindForms(){
  const bind=(id,fn)=>{const f=$(id);if(f)f.onsubmit=e=>{e.preventDefault();fn(Object.fromEntries(new FormData(f)));save();render();toast('Saved')}};
  bind('#quotationForm',d=>db.quotations.unshift({...d,id:uid('q'),amount:+d.amount}));
  bind('#projectForm',d=>db.projects.unshift({...d,id:uid('p'),budget:+d.budget}));
  bind('#jobForm',d=>db.jobOrders.unshift({...d,id:uid('j'),fromCompany:'gi',toCompany:'gd',quotedValue:+d.quotedValue||0}));
  bind('#prForm',d=>db.purchaseRequests.unshift({...d,id:uid('pr'),amount:+d.amount}));
  bind('#purchaseForm',d=>db.purchases.unshift({...d,id:uid('po'),amount:+d.amount}));
  bind('#labourForm',d=>db.labour.unshift({...d,id:uid('l'),hours:+d.hours,rate:+d.rate}));
  document.querySelectorAll('[data-create-project]').forEach(b=>b.onclick=()=>{const q=quotation(b.dataset.createProject);db.projects.unshift({id:uid('p'),quotationId:q.id,no:'GI-P-'+Date.now().toString().slice(-4),name:q.scope.slice(0,45),client:q.client,start:today(),status:'Active',budget:+q.amount||0});save();view='projects';render();toast('Project created from approved quotation')});
  document.querySelectorAll('[data-delete-quotation]').forEach(b=>b.onclick=()=>remove('quotations',b.dataset.deleteQuotation));
  document.querySelectorAll('[data-delete-job]').forEach(b=>b.onclick=()=>remove('jobOrders',b.dataset.deleteJob));
  document.querySelectorAll('[data-delete-pr]').forEach(b=>b.onclick=()=>remove('purchaseRequests',b.dataset.deletePr));
  document.querySelectorAll('[data-delete-purchase]').forEach(b=>b.onclick=()=>remove('purchases',b.dataset.deletePurchase));
  document.querySelectorAll('[data-delete-labour]').forEach(b=>b.onclick=()=>remove('labour',b.dataset.deleteLabour));
}
function remove(collection,id){if(confirm('Remove this record?')){db[collection]=db[collection].filter(x=>x.id!==id);save();render();toast('Removed')}}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),1800)}
init();
