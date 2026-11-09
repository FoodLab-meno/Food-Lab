(()=>{
 const cats=[
  {id:'breakfast',name:'صبحانه',icon:'🍳',image:'assets/category-breakfast.jpg'},
  {id:'sandwich',name:'ساندویچ',icon:'🥪',image:'assets/category-sandwich.jpg'},
  {id:'appetizer',name:'پیش‌غذا',icon:'🍟',image:'assets/category-appetizer.jpg'},
  {id:'cafe',name:'کافه',icon:'☕',image:'assets/category-cafe.jpg'},
  {id:'drinks',name:'نوشیدنی',icon:'🥤',image:'assets/category-drinks.jpg'}
 ];
 const seed=[
  ['breakfast','نیمرو'],['breakfast','املت'],['breakfast','سوسیس تخم‌مرغ'],['breakfast','عدسی'],['breakfast','لوبیا'],
  ['sandwich','همبرگر دستی'],['sandwich','دوبل برگر'],['sandwich','ماشروم برگر'],['sandwich','رویال برگر'],['sandwich','هات‌داگ'],['sandwich','هات‌داگ رویال'],['sandwich','کوکتل'],['sandwich','کوکتل پنیر'],['sandwich','کوکتل دودی'],['sandwich','بلغاری'],['sandwich','بندری'],['sandwich','فیله مرغ'],['sandwich','ژامبون مرغ'],['sandwich','ژامبون گوشت'],
  ['appetizer','سیب‌زمینی ساده'],['appetizer','سیب‌زمینی ویژه'],
  ['cafe','اسپرسو تک'],['cafe','اسپرسو دوبل'],['cafe','چای ماسالا'],['cafe','چای سیاه'],['cafe','هات‌چاکلت'],['cafe','آمریکانو'],['cafe','کاپوچینو'],['cafe','ریسترتو'],['cafe','کیک'],
  ['drinks','لیموناد'],['drinks','نوشابه بطری'],['drinks','نوشابه قوطی'],['drinks','نوشابه شیشه‌ای'],['drinks','آب معدنی']
 ].map((x,i)=>({id:'demo'+i,category_id:x[0],name:x[1],description:'',price:null,active:true,sort_order:i}));
 let chosen='breakfast',products=seed;
 const c=window.FOODLAB_CONFIG||{};  
 const configured=c.SUPABASE_URL&&!c.SUPABASE_URL.includes('YOUR-')&&c.SUPABASE_ANON_KEY&&!c.SUPABASE_ANON_KEY.includes('YOUR_');
 const db=configured&&window.supabase?window.supabase.createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY):null;
 const tabs=document.querySelector('#tabs'),items=document.querySelector('#items');
 const money=n=>n==null||n===''?'قیمت به‌زودی':Number(n).toLocaleString('fa-IR')+' تومان';
 const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function render(){
  tabs.innerHTML=cats.map(x=>`<button class="category-card ${x.id===chosen?'active':''}" type="button" data-id="${x.id}" aria-pressed="${x.id===chosen}"><img src="${x.image}" alt="" loading="lazy"><span>${x.name}</span></button>`).join('');
  tabs.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{chosen=b.dataset.id;render();document.querySelector('.menu-section').scrollIntoView({behavior:'smooth',block:'start'})}));
  const cat=cats.find(x=>x.id===chosen);document.querySelector('#heading').textContent=cat.name;
  const list=products.filter(p=>p.category_id===chosen&&p.active!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  items.innerHTML=list.map(p=>{
   const isFries=chosen==='appetizer';const src=p.name.includes('ویژه')?'assets/fries-special.jpg':'assets/fries-simple.jpg';
   const art=isFries?`<img class="product-art" src="${src}" alt="${escapeHTML(p.name)}" loading="lazy">`:`<div class="product-placeholder" aria-hidden="true">${cat.icon}</div>`;
   return `<article class="product-card">${art}<div class="product-info"><h3>${escapeHTML(p.name)}</h3>${p.description?`<p>${escapeHTML(p.description)}</p>`:''}<span class="price-pill ${p.price==null?'empty':''}">${money(p.price)}</span></div></article>`;
  }).join('');
  document.querySelector('#status').textContent=list.length?'':'در این دسته هنوز محصولی ثبت نشده است.';
 }
 async function load(){
  if(db){const {data,error}=await db.from('products').select('*').eq('active',true).order('sort_order');if(!error&&Array.isArray(data))products=data;else document.querySelector('#status').textContent='نمایش فهرست اولیه؛ دریافت قیمت‌های آنلاین با مشکل روبه‌رو شد.';}
  render();
 }
 load();
})();
