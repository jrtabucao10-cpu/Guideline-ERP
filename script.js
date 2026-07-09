const KEY='guideline-fitout-erp-v3';
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const today=()=>new Date().toISOString().slice(0,10);
const money=n=>'AED '+Number(n||0).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2});
const companies=[
  {id:'gi',name:'Guideline Interiors',type:'Main office',prefix:'GI',hasJobOrders:false,role:'Quotations, projects, purchases, labour, cost control'},
  {id:'gd',name:'Guideline Decor',type:'Joinery factory',prefix:'GD',hasJobOrders:true,role:'Quotations, projects, job orders, purchases, labour, cost control'}
];
const demo={
  clients:[
    {id:'c1',companyId:'gi',name:'Palm Villa Client',trn:'100123456700003',phone:'',email:'',address:'Dubai',status:'Valid'},
    {id:'c2',companyId:'gd',name:'Guideline Interiors / Palm Villa',trn:'100987654300003',phone:'',email:'',address:'Dubai',status:'Valid'}
  ],
  suppliers:[
    {id:'s1',companyId:'gd',name:'Wood Supplier LLC',trn:'100222333400003',phone:'',email:'',address:'Sharjah Industrial Area',status:'Valid'},
    {id:'s2',companyId:'gi',name:'Site Materials LLC',trn:'100555666700003',phone:'',email:'',address:'Dubai',status:'Valid'}
  ],
  materialCodes:[
    {id:'m1',code:'JOIN-MDF-18',description:'MDF board 18mm',category:'Joinery board',unit:'sheet'},
    {id:'m2',code:'JOIN-LAM-01',description:'Laminate sheet',category:'Finishing material',unit:'sheet'},
    {id:'m3',code:'HDW-HNG-SS',description:'Soft-close hinge',category:'Hardware',unit:'pc'},
    {id:'m4',code:'SITE-GYP-12',description:'Gypsum board 12mm',category:'Site material',unit:'sheet'}
  ],
  quotations:[
    {id:'q1',companyId:'gi',no:'GI-Q-1001',client:'Palm Villa Client',date:today(),amount:185000,status:'Approved',scope:'Villa interior fit-out with wardrobes and kitchen'},
    {id:'q2',companyId:'gd',no:'GD-Q-2001',client:'Guideline Interiors / Palm Villa',date:today(),amount:68500,status:'Approved',scope:'Joinery package: kitchen cabinets, wardrobes, vanity counters'}
  ],
  projects:[
    {id:'p1',companyId:'gi',quotationId:'q1',no:'GI-P-2401',name:'Palm Villa Fit-Out',client:'Palm Villa Client',start:today(),status:'Active',budget:185000},
    {id:'p2',companyId:'gd',quotationId:'q2',no:'GD-P-2401',name:'Palm Villa Joinery Works',client:'Guideline Interiors / Palm Villa',start:today(),status:'Active',budget:68500}
  ],
  jobOrders:[
    {id:'j1',companyId:'gd',no:'GD-JO-501',projectId:'p2',sourceProjectId:'p1',fromCompany:'gi',toCompany:'gd',date:today(),scope:'Kitchen cabinets, wardrobes, vanity counters',status:'Issued',quotedValue:68500}
  ],
  purchaseRequests:[
    {id:'pr1',companyId:'gd',no:'PR-8001',projectId:'p2',jobOrderId:'j1',date:today(),requestedBy:'Factory Supervisor',supplier:'Wood Supplier LLC',item:'MDF boards, laminate, hardware',amount:12600,status:'Approved'},
    {id:'pr2',companyId:'gi',no:'PR-7001',projectId:'p1',jobOrderId:'',date:today(),requestedBy:'Site Engineer',supplier:'Site Materials LLC',item:'Gypsum consumables and paint materials',amount:4300,status:'Pending'}
  ],
  purchases:[
    {id:'po1',companyId:'gd',no:'LPO-3001',prId:'pr1',projectId:'p2',jobOrderId:'j1',date:today(),supplier:'Wood Supplier LLC',amount:12600,hasLpo:'Yes',status:'Issued'},
    {id:'po2',companyId:'gi',no:'Cash-1001',prId:'pr2',projectId:'p1',jobOrderId:'',date:today(),supplier:'Site Materials LLC',amount:1200,hasLpo:'No',status:'Delivered'}
  ],
  labour:[
    {id:'l1',companyId:'gd',projectId:'p2',jobOrderId:'j1',date:today(),worker:'Carpenter A',trade:'Carpentry',hours:8,rate:28},
    {id:'l2',companyId:'gi',projectId:'p1',jobOrderId:'',date:today(),worker:'Site Labour A',trade:'Site installation',hours:8,rate:22}
  ],
  expenses:[
    {id:'e1',companyId:'gd',projectId:'p2',jobOrderId:'j1',date:today(),category:'Transport',amount:350,note:'Delivery to site'},
    {id:'e2',companyId:'gi',projectId:'p1',jobOrderId:'',date:today(),category:'Site expense',amount:500,note:'Site consumables'}
  ]
};
let db=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(demo);
db.clients ||= [];
db.suppliers ||= [];
db.materialCodes ||= [];
let view='dashboard';
let currentCompany=localStorage.getItem('guideline-current-company')||'gi';
const $=s=>document.querySelector(s);
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
const company=()=>companies.find(c=>c.id===currentCompany)||companies[0];
const scoped=(name)=>db[name].filter(x=>(x.companyId||'gi')===currentCompany);
const quotation=id=>db.quotations.find(x=>x.id===id)||{};
const project=id=>db.projects.find(x=>x.id===id)||{};
const job=id=>db.jobOrders.find(x=>x.id===id)||{};
const pr=id=>db.purchaseRequests.find(x=>x.id===id)||{};
const client=id=>db.clients.find(x=>x.id===id)||{};
const supplier=id=>db.suppliers.find(x=>x.id===id)||{};
const material=id=>db.materialCodes.find(x=>x.id===id)||{};
const trnStatus=trn=>/^\d{15}$/.test((trn||'').trim())?'Valid':'Invalid';
const jobMaterialCost=id=>db.purchases.filter(x=>x.jobOrderId===id).reduce((s,x)=>s+(+x.amount||0),0);
const jobLabourCost=id=>db.labour.filter(x=>x.jobOrderId===id).reduce((s,x)=>s+(+x.hours||0)*(+x.rate||0),0);
const jobExpenseCost=id=>db.expenses.filter(x=>x.jobOrderId===id).reduce((s,x)=>s+(+x.amount||0),0);
const projectDirectCost=id=>db.purchases.filter(x=>x.projectId===id&&!x.jobOrderId).reduce((s,x)=>s+(+x.amount||0),0)+db.labour.filter(x=>x.projectId===id&&!x.jobOrderId).reduce((s,x)=>s+(+x.hours||0)*(+x.rate||0),0)+db.expenses.filter(e=>e.projectId===id&&!e.jobOrderId).reduce((s,e)=>s+(+e.amount||0),0);
const projectJobCost=id=>db.jobOrders.filter(j=>j.projectId===id).reduce((s,j)=>s+jobMaterialCost(j.id)+jobLabourCost(j.id)+jobExpenseCost(j.id),0);
const projectCost=id=>projectDirectCost(id)+projectJobCost(id);
const baseNav=[['dashboard','▣','Dashboard'],['clients','C','Clients / customers'],['suppliers','S','Vendors / suppliers'],['materials','M','Material codes'],['quotations','Q','Quotations'],['projects','P','Projects'],['joborders','J','Job orders'],['requests','R','Purchase requests'],['purchases','L','LPO / purchases'],['labour','H','Labour costing'],['reports','▤','Cost reports']];
const activeNav=()=>baseNav.filter(n=>company().hasJobOrders||n[0]!=='joborders');
function init(){
  $('#today').innerHTML=companyToggle();
  drawNav();
  $('#resetDemo').onclick=()=>{if(confirm('Start fresh? This removes demo records but keeps the ERP structure.')){db={clients:[],suppliers:[],materialCodes:[],quotations:[],projects:[],jobOrders:[],purchaseRequests:[],purchases:[],labour:[],expenses:[]};save();render();toast('Fresh ERP ready.')}};
  render();
}
function drawNav(){
  if(!company().hasJobOrders&&view==='joborders')view='dashboard';
  $('#nav').innerHTML=activeNav().map(n=>`<button class="nav-btn ${n[0]===view?'active':''}" data-view="${n[0]}"><span>${n[1]}</span>${n[2]}</button>`).join('');
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render()});
}
function companyToggle(){
  return `<div class="company-switch"><span class="online-dot"></span><select id="companySelect">${companies.map(c=>`<option value="${c.id}" ${c.id===currentCompany?'selected':''}>${c.name}</option>`).join('')}</select><small>${company().type}</small></div>`;
}
function render(){
  $('#today').innerHTML=companyToggle();
  $('#companySelect').onchange=e=>{currentCompany=e.target.value;localStorage.setItem('guideline-current-company',currentCompany);if(!company().hasJobOrders&&view==='joborders')view='dashboard';drawNav();render()};
  drawNav();
  const nav=activeNav(), active=nav.find(x=>x[0]===view)||nav[0];
  $('#pageTitle').textContent=active[2];
  $('#app').innerHTML=companyBanner()+({dashboard,clients,suppliers,materials,quotations,projects,joborders,requests,purchases,labour,reports})[view]();
  bindForms();
}
function companyBanner(){
  return `<div class="company-banner"><div><b>${company().name}</b> · ${company().role}</div>${company().hasJobOrders?'<span class="badge factory">Job Orders Enabled</span>':'<span class="badge">No Job Orders — costs link directly to projects</span>'}</div>`;
}
function dashboard(){
  const qs=scoped('quotations'), ps=scoped('projects'), js=scoped('jobOrders'), labourRows=scoped('labour');
  const approved=qs.filter(q=>q.status==='Approved').reduce((s,q)=>s+(+q.amount||0),0), projectBudget=ps.reduce((s,p)=>s+(+p.budget||0),0), cost=ps.reduce((s,p)=>s+projectCost(p.id),0), labourCost=labourRows.reduce((s,l)=>s+(+l.hours||0)*(+l.rate||0),0);
  return `<div class="grid stats"><div class="card stat"><small>Approved quotations</small><strong>${money(approved)}</strong><span class="hint">${company().name}</span></div><div class="card stat"><small>Project budgets</small><strong>${money(projectBudget)}</strong><span class="hint">Selected company</span></div><div class="card stat"><small>Total tracked cost</small><strong>${money(cost)}</strong><span class="hint">Materials, labour, expenses</span></div><div class="card stat"><small>Labour cost</small><strong>${money(labourCost)}</strong><span class="hint">Manpower cost</span></div></div><section class="card"><div class="section-head"><h2>Company workflow</h2></div><div class="flow">${company().hasJobOrders?'<div class="flow-step"><strong>Quotation</strong>Client/internal quote</div><div class="flow-step"><strong>Project</strong>Approved work</div><div class="flow-step"><strong>Job order</strong>Factory production</div><div class="flow-step"><strong>PR / LPO</strong>Materials</div><div class="flow-step"><strong>Costing</strong>Labour + expenses</div>':'<div class="flow-step"><strong>Quotation</strong>Client quote</div><div class="flow-step"><strong>Project</strong>Approved work</div><div class="flow-step"><strong>PR / LPO</strong>Materials</div><div class="flow-step"><strong>Labour</strong>Project manpower</div><div class="flow-step"><strong>Costing</strong>Project margin</div>'}</div></section><div class="grid two" style="margin-top:18px"><section class="card"><div class="section-head"><h2>Active projects</h2></div>${projectTable(ps)}</section><section class="card"><div class="section-head"><h2>${company().hasJobOrders?'Open job orders':'Recent purchase requests'}</h2></div>${company().hasJobOrders?jobTable(js):requestTable(scoped('purchaseRequests'))}</section></div>`;
}
function quotationTable(rows){return rows.length?`<table><thead><tr><th>No.</th><th>Client</th><th>Scope</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(q=>`<tr><td><b>${q.no}</b><br><small>${q.date}</small></td><td>${client(q.clientId).name||q.client||'—'}</td><td>${q.scope}</td><td class="money">${money(q.amount)}</td><td><span class="badge ${q.status.toLowerCase()}">${q.status}</span></td><td>${q.status==='Approved'?`<button class="ghost" data-create-project="${q.id}">Make project</button>`:''}<button class="danger-link" data-delete-quotation="${q.id}">Remove</button></td></tr>`).join('')}</tbody></table>`:'<p class="empty">No quotations yet.</p>'}
function projectTable(rows){return rows.length?`<table><thead><tr><th>Project</th><th>Client</th><th>Budget</th><th>Tracked cost</th><th>Status</th></tr></thead><tbody>${rows.map(p=>`<tr><td><b>${p.no}</b><br><small>${p.name}</small></td><td>${client(p.clientId).name||p.client||'—'}</td><td class="money">${money(p.budget)}</td><td class="money">${money(projectCost(p.id))}</td><td><span class="badge ${p.status.toLowerCase()}">${p.status}</span></td></tr>`).join('')}</tbody></table>`:'<p class="empty">No projects yet.</p>'}
function jobTable(rows){return rows.length?`<table><thead><tr><th>Job order</th><th>Project</th><th>Scope</th><th>Value</th><th>Cost</th><th>Status</th></tr></thead><tbody>${rows.map(j=>`<tr><td><b>${j.no}</b><br><small>${company().name}</small></td><td>${project(j.projectId).name||'—'}</td><td>${j.scope}</td><td class="money">${money(j.quotedValue)}</td><td class="money">${money(jobMaterialCost(j.id)+jobLabourCost(j.id)+jobExpenseCost(j.id))}</td><td><span class="badge ${j.status.toLowerCase()}">${j.status}</span></td></tr>`).join('')}</tbody></table>`:'<p class="empty">No job orders yet.</p>'}
function requestTable(rows){return rows.length?`<table><thead><tr><th>PR</th><th>${company().hasJobOrders?'Job order':'Project'}</th><th>Supplier</th><th>Material code</th><th>Items</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r.no}</b><br><small>${r.date}</small></td><td>${company().hasJobOrders?(job(r.jobOrderId).no||'—'):(project(r.projectId).name||'—')}</td><td>${supplier(r.supplierId).name||r.supplier||'—'}</td><td><b>${material(r.materialId).code||'—'}</b><br><small>${material(r.materialId).description||''}</small></td><td>${r.item}</td><td class="money">${money(r.amount)}</td><td><span class="badge ${r.status.toLowerCase()}">${r.status}</span></td></tr>`).join('')}</tbody></table>`:'<p class="empty">No purchase requests yet.</p>'}
function projectOptions(){return scoped('projects').map(p=>`<option value="${p.id}">${p.no} · ${p.name}</option>`).join('')}
function jobOptions(){return scoped('jobOrders').map(j=>`<option value="${j.id}">${j.no} · ${project(j.projectId).name}</option>`).join('')}
function clientOptions(selected=''){return scoped('clients').map(c=>`<option value="${c.id}" ${selected===c.id?'selected':''}>${c.name}${c.trn?` · TRN ${c.trn}`:''}</option>`).join('')}
function supplierOptions(selected=''){return scoped('suppliers').map(s=>`<option value="${s.id}" ${selected===s.id?'selected':''}>${s.name}${s.trn?` · TRN ${s.trn}`:''}</option>`).join('')}
function materialOptions(selected=''){return db.materialCodes.map(m=>`<option value="${m.id}" ${selected===m.id?'selected':''}>${m.code} · ${m.description}</option>`).join('')}
function clients(){
  return `<section class="card form-card"><div class="section-head"><h2>Add client / customer — ${company().name}</h2></div><form id="clientForm" class="form-grid"><label>Name<input name="name" required></label><label>TRN<input name="trn" placeholder="15-digit TRN"></label><label>Phone<input name="phone"></label><label>Email<input name="email" type="email"></label><label class="wide">Address<input name="address"></label><button type="button" class="ghost validate-trn">Validate TRN</button><button class="btn">Add client</button></form></section><section class="card"><table><thead><tr><th>Client</th><th>TRN</th><th>Status</th><th>Contact</th><th>Address</th><th></th></tr></thead><tbody>${scoped('clients').map(c=>`<tr><td><b>${c.name}</b></td><td>${c.trn||'—'}</td><td><span class="badge ${trnStatus(c.trn).toLowerCase()==='valid'?'approved':'closed'}">${c.trn?trnStatus(c.trn):'No TRN'}</span></td><td>${c.phone||'—'}<br><small>${c.email||''}</small></td><td>${c.address||'—'}</td><td><button class="danger-link" data-delete-client="${c.id}">Remove</button></td></tr>`).join('')}</tbody></table></section>`;
}
function suppliers(){
  return `<section class="card form-card"><div class="section-head"><h2>Add vendor / supplier — ${company().name}</h2></div><form id="supplierForm" class="form-grid"><label>Name<input name="name" required></label><label>TRN<input name="trn" placeholder="15-digit TRN"></label><label>Phone<input name="phone"></label><label>Email<input name="email" type="email"></label><label class="wide">Address<input name="address"></label><button type="button" class="ghost validate-trn">Validate TRN</button><button class="btn">Add supplier</button></form></section><section class="card"><table><thead><tr><th>Supplier</th><th>TRN</th><th>Status</th><th>Contact</th><th>Address</th><th></th></tr></thead><tbody>${scoped('suppliers').map(s=>`<tr><td><b>${s.name}</b></td><td>${s.trn||'—'}</td><td><span class="badge ${trnStatus(s.trn).toLowerCase()==='valid'?'approved':'closed'}">${s.trn?trnStatus(s.trn):'No TRN'}</span></td><td>${s.phone||'—'}<br><small>${s.email||''}</small></td><td>${s.address||'—'}</td><td><button class="danger-link" data-delete-supplier="${s.id}">Remove</button></td></tr>`).join('')}</tbody></table></section>`;
}
function materials(){
  return `<section class="card form-card"><div class="section-head"><h2>Add material code</h2></div><form id="materialForm" class="form-grid"><label>Code<input name="code" required placeholder="e.g. JOIN-MDF-18"></label><label>Description<input name="description" required></label><label>Category<input name="category"></label><label>Unit<input name="unit" placeholder="pcs / sheet / lm"></label><button class="btn">Add material</button></form></section><section class="card form-card"><div class="section-head"><h2>Paste material codes from Excel</h2></div><form id="materialImportForm"><label>Paste rows as: Code, Description, Category, Unit<textarea name="rows" placeholder="CODE001, MDF 18mm, Board, sheet"></textarea></label><button class="btn secondary" style="margin-top:10px">Import pasted codes</button></form></section><section class="card"><table><thead><tr><th>Code</th><th>Description</th><th>Category</th><th>Unit</th><th></th></tr></thead><tbody>${db.materialCodes.map(m=>`<tr><td><b>${m.code}</b></td><td>${m.description}</td><td>${m.category||'—'}</td><td>${m.unit||'—'}</td><td><button class="danger-link" data-delete-material="${m.id}">Remove</button></td></tr>`).join('')}</tbody></table></section>`;
}
function quotations(){
  return `<section class="card form-card"><div class="section-head"><h2>Add quotation — ${company().name}</h2></div><form id="quotationForm" class="form-grid"><label>Quotation no.<input name="no" required placeholder="${company().prefix}-Q-1001"></label><label>Client / customer<select name="clientId" required>${clientOptions()}</select></label><label>Date<input name="date" type="date" value="${today()}" required></label><label>Amount<input name="amount" type="number" step="0.01" required></label><label>Status<select name="status"><option>Draft</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></label><label class="wide">Scope<textarea name="scope" required></textarea></label><button class="btn">Add quotation</button></form></section><section class="card">${quotationTable(scoped('quotations'))}</section>`;
}
function projects(){
  return `<section class="card form-card"><div class="section-head"><h2>Add project — ${company().name}</h2></div><form id="projectForm" class="form-grid"><label>Project no.<input name="no" required placeholder="${company().prefix}-P-2401"></label><label>Project name<input name="name" required></label><label>Client / customer<select name="clientId" required>${clientOptions()}</select></label><label>Start date<input name="start" type="date" value="${today()}"></label><label>Budget<input name="budget" type="number" step="0.01" required></label><label>Status<select name="status"><option>Active</option><option>On Hold</option><option>Closed</option></select></label><button class="btn">Add project</button></form></section><section class="card">${projectTable(scoped('projects'))}</section>`;
}
function joborders(){
  if(!company().hasJobOrders)return `<section class="card"><h2>No job order module for ${company().name}</h2><p>Costs for this company are linked directly to projects.</p></section>`;
  return `<section class="card form-card"><div class="section-head"><h2>Create job order — ${company().name}</h2></div><form id="jobForm" class="form-grid"><label>Job order no.<input name="no" required placeholder="${company().prefix}-JO-501"></label><label>Project<select name="projectId" required>${projectOptions()}</select></label><label>Date<input name="date" type="date" value="${today()}" required></label><label>Value / budget<input name="quotedValue" type="number" step="0.01"></label><label>Status<select name="status"><option>Issued</option><option>In Production</option><option>Delivered</option><option>Closed</option></select></label><label class="wide">Scope<textarea name="scope" required></textarea></label><button class="btn">Create job order</button></form></section><section class="grid three">${scoped('jobOrders').map(j=>`<article class="card job-card"><div class="section-head"><div><h2>${j.no}</h2><span class="badge factory">${company().name}</span></div><button class="danger-link" data-delete-job="${j.id}">Remove</button></div><p><b>Project:</b> ${project(j.projectId).name||'—'}</p><p>${j.scope}</p><table><tbody><tr><td>Materials</td><td class="money">${money(jobMaterialCost(j.id))}</td></tr><tr><td>Labour</td><td class="money">${money(jobLabourCost(j.id))}</td></tr><tr><td>Other</td><td class="money">${money(jobExpenseCost(j.id))}</td></tr></tbody></table><p><span class="badge ${j.status.toLowerCase().replaceAll(' ','-')}">${j.status}</span></p></article>`).join('')||'<section class="card empty">No job orders yet.</section>'}</section>`;
}
function requests(){
  const linkField=company().hasJobOrders?`<label>Job order<select name="jobOrderId" required>${jobOptions()}</select></label>`:`<label>Project<select name="projectId" required>${projectOptions()}</select></label>`;
  return `<section class="card form-card"><div class="section-head"><h2>Purchase request — ${company().name}</h2></div><form id="prForm" class="form-grid"><label>PR no.<input name="no" required placeholder="PR-8002"></label>${linkField}<label>Date<input name="date" type="date" value="${today()}" required></label><label>Requested by<input name="requestedBy"></label><label>Vendor / supplier<select name="supplierId" required>${supplierOptions()}</select></label><label>Material code<select name="materialId" required>${materialOptions()}</select></label><label>Amount<input name="amount" type="number" step="0.01" required></label><label>Status<select name="status"><option>Pending</option><option>Approved</option><option>Rejected</option></select></label><label class="wide">Items / materials<textarea name="item" required></textarea></label><button class="btn">Add purchase request</button></form></section><section class="card">${requestTable(scoped('purchaseRequests'))}</section>`;
}
function purchases(){
  const prs=scoped('purchaseRequests'), linkField=company().hasJobOrders?`<label>Job order<select name="jobOrderId" required>${jobOptions()}</select></label>`:`<label>Project<select name="projectId" required>${projectOptions()}</select></label>`;
  return `<section class="card form-card"><div class="section-head"><h2>LPO / purchase — ${company().name}</h2></div><form id="purchaseForm" class="form-grid"><label>LPO / Ref no.<input name="no" required placeholder="LPO-3002 or Cash"></label><label>Purchase request<select name="prId">${prs.map(r=>`<option value="${r.id}">${r.no} · ${r.item.slice(0,35)}</option>`).join('')}<option value="">No PR</option></select></label>${linkField}<label>Date<input name="date" type="date" value="${today()}" required></label><label>Vendor / supplier<select name="supplierId" required>${supplierOptions()}</select></label><label>Amount<input name="amount" type="number" step="0.01" required></label><label>With LPO?<select name="hasLpo"><option>Yes</option><option>No</option></select></label><label>Status<select name="status"><option>Issued</option><option>Delivered</option><option>Paid</option></select></label><button class="btn">Add purchase</button></form></section><section class="card"><table><thead><tr><th>Ref</th><th>PR</th><th>${company().hasJobOrders?'Job order':'Project'}</th><th>Supplier</th><th>LPO?</th><th>Amount</th><th></th></tr></thead><tbody>${scoped('purchases').map(p=>`<tr><td><b>${p.no}</b><br><small>${p.date}</small></td><td>${pr(p.prId).no||'—'}</td><td>${company().hasJobOrders?(job(p.jobOrderId).no||'—'):(project(p.projectId).name||'—')}</td><td>${supplier(p.supplierId).name||p.supplier||'—'}</td><td><span class="badge">${p.hasLpo}</span></td><td class="money">${money(p.amount)}</td><td><button class="danger-link" data-delete-purchase="${p.id}">Remove</button></td></tr>`).join('')}</tbody></table></section>`;
}
function labour(){
  const linkField=company().hasJobOrders?`<label>Job order<select name="jobOrderId" required>${jobOptions()}</select></label>`:`<label>Project<select name="projectId" required>${projectOptions()}</select></label>`;
  return `<section class="card form-card"><div class="section-head"><h2>Track labour — ${company().name}</h2></div><form id="labourForm" class="form-grid">${linkField}<label>Date<input name="date" type="date" value="${today()}" required></label><label>Worker<input name="worker" required></label><label>Trade<input name="trade" placeholder="Carpentry / painting / site work"></label><label>Hours<input name="hours" type="number" step="0.5" required></label><label>Hourly rate<input name="rate" type="number" step="0.01" required></label><button class="btn">Add labour cost</button></form></section><section class="card"><table><thead><tr><th>Date</th><th>${company().hasJobOrders?'Job order':'Project'}</th><th>Worker</th><th>Trade</th><th>Hours</th><th>Rate</th><th>Total</th><th></th></tr></thead><tbody>${scoped('labour').slice().reverse().map(l=>`<tr><td>${l.date}</td><td>${company().hasJobOrders?(job(l.jobOrderId).no||'—'):(project(l.projectId).name||'—')}</td><td><b>${l.worker}</b></td><td>${l.trade||'—'}</td><td>${l.hours}</td><td class="money">${money(l.rate)}</td><td class="money">${money((+l.hours||0)*(+l.rate||0))}</td><td><button class="danger-link" data-delete-labour="${l.id}">Remove</button></td></tr>`).join('')}</tbody></table></section>`;
}
function reports(){
  const ps=scoped('projects'), js=scoped('jobOrders');
  if(company().hasJobOrders){
    const rows=js.map(j=>({j,project:project(j.projectId),materials:jobMaterialCost(j.id),labour:jobLabourCost(j.id),expenses:jobExpenseCost(j.id),value:+j.quotedValue||0}));
    return `<section class="card"><div class="section-head"><h2>Job order costing report — ${company().name}</h2><button class="btn secondary no-print" onclick="window.print()">Save / print PDF</button></div><table><thead><tr><th>Job order</th><th>Project</th><th>Value</th><th>Materials</th><th>Labour</th><th>Other</th><th>Total cost</th><th>Balance / margin</th></tr></thead><tbody>${rows.map(x=>{const total=x.materials+x.labour+x.expenses;return `<tr><td><b>${x.j.no}</b><br><small>${x.j.status}</small></td><td>${x.project.name||'—'}</td><td class="money">${money(x.value)}</td><td class="money">${money(x.materials)}</td><td class="money">${money(x.labour)}</td><td class="money">${money(x.expenses)}</td><td class="money">${money(total)}</td><td class="money">${money(x.value-total)}</td></tr>`}).join('')}<tr class="report-total"><td colspan="2">Total</td><td class="money">${money(rows.reduce((s,x)=>s+x.value,0))}</td><td class="money">${money(rows.reduce((s,x)=>s+x.materials,0))}</td><td class="money">${money(rows.reduce((s,x)=>s+x.labour,0))}</td><td class="money">${money(rows.reduce((s,x)=>s+x.expenses,0))}</td><td class="money">${money(rows.reduce((s,x)=>s+x.materials+x.labour+x.expenses,0))}</td><td class="money">${money(rows.reduce((s,x)=>s+x.value-x.materials-x.labour-x.expenses,0))}</td></tr></tbody></table></section><section class="card" style="margin-top:18px"><div class="section-head"><h2>Project cost summary</h2></div>${projectTable(ps)}</section>`;
  }
  return `<section class="card"><div class="section-head"><h2>Project costing report — ${company().name}</h2><button class="btn secondary no-print" onclick="window.print()">Save / print PDF</button></div><table><thead><tr><th>Project</th><th>Budget</th><th>Purchases</th><th>Labour</th><th>Other expenses</th><th>Total cost</th><th>Balance / margin</th></tr></thead><tbody>${ps.map(p=>{const purchases=db.purchases.filter(x=>x.projectId===p.id&&!x.jobOrderId).reduce((s,x)=>s+(+x.amount||0),0), labour=db.labour.filter(x=>x.projectId===p.id&&!x.jobOrderId).reduce((s,x)=>s+(+x.hours||0)*(+x.rate||0),0), expenses=db.expenses.filter(x=>x.projectId===p.id&&!x.jobOrderId).reduce((s,x)=>s+(+x.amount||0),0), total=purchases+labour+expenses;return `<tr><td><b>${p.no}</b><br><small>${p.name}</small></td><td class="money">${money(p.budget)}</td><td class="money">${money(purchases)}</td><td class="money">${money(labour)}</td><td class="money">${money(expenses)}</td><td class="money">${money(total)}</td><td class="money">${money((+p.budget||0)-total)}</td></tr>`}).join('')}</tbody></table></section>`;
}
function bindForms(){
  const bind=(id,fn)=>{const f=$(id);if(f)f.onsubmit=e=>{e.preventDefault();fn(Object.fromEntries(new FormData(f)));save();render();toast('Saved')}};
  bind('#clientForm',d=>db.clients.unshift({...d,id:uid('c'),companyId:currentCompany,status:trnStatus(d.trn)}));
  bind('#supplierForm',d=>db.suppliers.unshift({...d,id:uid('s'),companyId:currentCompany,status:trnStatus(d.trn)}));
  bind('#materialForm',d=>db.materialCodes.unshift({...d,id:uid('m')}));
  bind('#materialImportForm',d=>{(d.rows||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(row=>{const [code,description,category,unit]=row.split(',').map(x=>x?.trim()||'');if(code&&description)db.materialCodes.push({id:uid('m'),code,description,category,unit})})});
  bind('#quotationForm',d=>db.quotations.unshift({...d,id:uid('q'),companyId:currentCompany,client:client(d.clientId).name||'',amount:+d.amount}));
  bind('#projectForm',d=>db.projects.unshift({...d,id:uid('p'),companyId:currentCompany,client:client(d.clientId).name||'',budget:+d.budget}));
  bind('#jobForm',d=>db.jobOrders.unshift({...d,id:uid('j'),companyId:currentCompany,fromCompany:currentCompany,toCompany:currentCompany,quotedValue:+d.quotedValue||0}));
  bind('#prForm',d=>{const projectId=company().hasJobOrders?job(d.jobOrderId).projectId:d.projectId;db.purchaseRequests.unshift({...d,id:uid('pr'),companyId:currentCompany,projectId,jobOrderId:d.jobOrderId||'',supplier:supplier(d.supplierId).name||'',item:d.item||material(d.materialId).description||'',amount:+d.amount})});
  bind('#purchaseForm',d=>{const projectId=company().hasJobOrders?job(d.jobOrderId).projectId:d.projectId;db.purchases.unshift({...d,id:uid('po'),companyId:currentCompany,projectId,jobOrderId:d.jobOrderId||'',supplier:supplier(d.supplierId).name||'',amount:+d.amount})});
  bind('#labourForm',d=>{const projectId=company().hasJobOrders?job(d.jobOrderId).projectId:d.projectId;db.labour.unshift({...d,id:uid('l'),companyId:currentCompany,projectId,jobOrderId:d.jobOrderId||'',hours:+d.hours,rate:+d.rate})});
  document.querySelectorAll('[data-create-project]').forEach(b=>b.onclick=()=>{const q=quotation(b.dataset.createProject);db.projects.unshift({id:uid('p'),companyId:currentCompany,quotationId:q.id,no:company().prefix+'-P-'+Date.now().toString().slice(-4),name:q.scope.slice(0,45),clientId:q.clientId,client:client(q.clientId).name||q.client,start:today(),status:'Active',budget:+q.amount||0});save();view='projects';render();toast('Project created from approved quotation')});
  const materialSelect=document.querySelector('[name="materialId"]');if(materialSelect)materialSelect.onchange=()=>{const m=material(materialSelect.value),item=document.querySelector('[name="item"]');if(item&&!item.value)item.value=`${m.code||''} - ${m.description||''}`.trim()};
  document.querySelectorAll('.validate-trn').forEach(b=>b.onclick=()=>{const input=b.closest('form')?.querySelector('[name="trn"]'),status=trnStatus(input?.value);toast(status==='Valid'?'TRN format is valid':'TRN must be 15 digits')});
  document.querySelectorAll('[data-delete-client]').forEach(b=>b.onclick=()=>remove('clients',b.dataset.deleteClient));
  document.querySelectorAll('[data-delete-supplier]').forEach(b=>b.onclick=()=>remove('suppliers',b.dataset.deleteSupplier));
  document.querySelectorAll('[data-delete-material]').forEach(b=>b.onclick=()=>remove('materialCodes',b.dataset.deleteMaterial));
  document.querySelectorAll('[data-delete-quotation]').forEach(b=>b.onclick=()=>remove('quotations',b.dataset.deleteQuotation));
  document.querySelectorAll('[data-delete-job]').forEach(b=>b.onclick=()=>remove('jobOrders',b.dataset.deleteJob));
  document.querySelectorAll('[data-delete-pr]').forEach(b=>b.onclick=()=>remove('purchaseRequests',b.dataset.deletePr));
  document.querySelectorAll('[data-delete-purchase]').forEach(b=>b.onclick=()=>remove('purchases',b.dataset.deletePurchase));
  document.querySelectorAll('[data-delete-labour]').forEach(b=>b.onclick=()=>remove('labour',b.dataset.deleteLabour));
}
function remove(collection,id){if(confirm('Remove this record?')){db[collection]=db[collection].filter(x=>x.id!==id);save();render();toast('Removed')}}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),1800)}
init();
