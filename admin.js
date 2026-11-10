(()=>{
 const c=window.FOODLAB_CONFIG||{};
 const configured=c.SUPABASE_URL&&!c.SUPABASE_URL.includes('YOUR-')&&c.SUPABASE_ANON_KEY&&!c.SUPABASE_ANON_KEY.includes('YOUR_');
 const db=configured&&window.supabase?window.supabase.createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY):null;
 const cats={breakfast:'صبحانه',sandwich:'ساندویچ',appetizer:'پیش‌غذا',cafe:'کافه',drinks:'نوشیدنی'};
 const $=s=>document.querySelector(s);
 const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const say=(s,bad=false)=>{$('#msg').textContent=s;$('#msg').style.color=bad?'#b42318':'#176b3a'};
 const addSay=(s,bad=false)=>{$('#addmsg').textContent=s;$('#addmsg').style.color=bad?'#b42318':'#176b3a'};
 let products=[];
 function showLogin(message=''){ $('#manager').classList.add('hidden');$('#login').classList.remove('hidden');if(message)$('#loginmsg').textContent=message; }
 async function loadManager(){
  const {data:{session},error:sessionError}=await db.auth.getSession();
  if(sessionError){showLogin('بررسی ورود ناموفق بود. دوباره تلاش کن.');return;}
  if(!session){showLogin();return;}
  if(c.ADMIN_USER_ID&&c.ADMIN_USER_ID!=='PASTE_ADMIN_USER_ID_HERE'&&session.user.id!==c.ADMIN_USER_ID){await db.auth.signOut();showLogin('این حساب اجازه مدیریت این منو را ندارد.');return;}
  $('#login').classList.add('hidden');$('#manager').classList.remove('hidden');
  const {data,error}=await db.from('products').select('*').order('sort_order').order('id');
  if(error){say('دریافت محصولات ناموفق بود. SQL و دسترسی مدیر در Supabase را بررسی کن.',true);return;}
  products=data||[];render();
 }
 $('#loginform').addEventListener('submit',async e=>{
  e.preventDefault();if(!db){$('#loginmsg').textContent='ابتدا آدرس و کلید عمومی Supabase را در config.js تنظیم کن.';return;}
  const button=e.submitter;button.disabled=true;
  const {error}=await db.auth.signInWithPassword({email:$('#email').value.trim(),password:$('#password').value});
  button.disabled=false;
  if(error){$('#loginmsg').textContent='ورود ناموفق بود؛ ایمیل و رمز عبور را بررسی کن.';return;}
  await loadManager();
 });
 function render(){
  const term=$('#search').value.trim().toLocaleLowerCase('fa'),cat=$('#filter').value;
  const filtered=products.filter(p=>(cat==='all'||p.category_id===cat)&&String(p.name).toLocaleLowerCase('fa').includes(term));
  $('#rows').innerHTML=filtered.map(p=>`
   <div class="editrow" data-id="${p.id}">
    <div><strong>${escapeHTML(p.name)}</strong><small>شناسه: ${p.id}</small></div>
    <label>نام محصول<input class="name" type="text" maxlength="150" value="${escapeHTML(p.name)}"></label>
    <label>دسته‌بندی<select class="category">${Object.entries(cats).map(([id,name])=>`<option value="${id}" ${p.category_id===id?'selected':''}>${name}</option>`).join('')}</select></label>
    <label>قیمت (تومان)<input class="price" type="number" min="0" step="1" value="${p.price??''}" placeholder="قیمت"></label>
    <label><input class="visible" type="checkbox" ${p.active?'checked':''}> نمایش در منو</label>
    <button class="admin-button save" type="button">ذخیره تغییرات</button>
   </div>`).join('')||'<p>محصولی پیدا نشد.</p>';
  $('#rows').querySelectorAll('.save').forEach(button=>button.addEventListener('click',async()=>{
   const row=button.closest('.editrow'),name=row.querySelector('.name').value.trim(),raw=row.querySelector('.price').value.trim(),price=raw===''?null:Number(raw);
   if(!name){say('نام محصول نمی‌تواند خالی باشد.',true);return;}
   if(price!==null&&(!Number.isSafeInteger(price)||price<0)){say('قیمت باید عدد صحیح و غیرمنفی باشد.',true);return;}
   const update={name,category_id:row.querySelector('.category').value,price,active:row.querySelector('.visible').checked};
   button.disabled=true;button.textContent='در حال ذخیره…';
   const {data,error}=await db.from('products').update(update).eq('id',row.dataset.id).select().single();
   button.disabled=false;button.textContent='ذخیره تغییرات';
   if(error){say('ذخیره انجام نشد. مجوز UPDATE در Supabase را بررسی کن: '+error.message,true);return;}
   products=products.map(p=>String(p.id)===String(data.id)?data:p);render();say('تغییرات محصول ذخیره شد.');
  }));
 }
 $('#addform').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!db){addSay('اتصال Supabase تنظیم نشده است.',true);return;}
  const name=$('#newname').value.trim(),raw=$('#newprice').value.trim(),price=raw===''?null:Number(raw);
  if(!name){addSay('نام محصول را وارد کن.',true);return;}
  if(price!==null&&(!Number.isSafeInteger(price)||price<0)){addSay('قیمت باید عدد صحیح و غیرمنفی باشد.',true);return;}
  const button=$('#addbutton');button.disabled=true;button.textContent='در حال افزودن…';
  const {data,error}=await db.from('products').insert({name,category_id:$('#newcategory').value,price,description:$('#newdescription').value.trim(),active:true,sort_order:products.length+1}).select().single();
  button.disabled=false;button.textContent='افزودن محصول';
  if(error){addSay('افزودن محصول ناموفق بود. مجوز INSERT در Supabase را بررسی کن: '+error.message,true);return;}
  products.push(data);$('#addform').reset();render();addSay('محصول با موفقیت اضافه شد.');
 });
 $('#search').addEventListener('input',render);$('#filter').addEventListener('change',render);
 $('#logout').addEventListener('click',async()=>{await db.auth.signOut();showLogin('از حساب مدیریت خارج شدی.');});
 if(db)loadManager();else showLogin('اتصال Supabase هنوز تنظیم نشده است.');
})();
