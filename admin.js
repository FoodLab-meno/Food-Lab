(()=>{
 const c=window.FOODLAB_CONFIG||{};
 const configured=c.SUPABASE_URL&&!c.SUPABASE_URL.includes('YOUR-')&&c.SUPABASE_ANON_KEY&&!c.SUPABASE_ANON_KEY.includes('YOUR_');
 const db=configured&&window.supabase?window.supabase.createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY):null;
 const cats={breakfast:'صبحانه',sandwich:'ساندویچ',appetizer:'پیش‌غذا',cafe:'کافه',drinks:'نوشیدنی'};
 const $=s=>document.querySelector(s),say=(s,bad=false)=>{$('#msg').textContent=s;$('#msg').style.color=bad?'#b42318':'#176b3a'};
 function showLogin(message=''){ $('#manager').classList.add('hidden');$('#login').classList.remove('hidden');if(message)$('#loginmsg').textContent=message; }
 async function loadManager(){
  const {data:{session}}=await db.auth.getSession();
  if(!session){showLogin();return;}
  if(c.ADMIN_USER_ID&&c.ADMIN_USER_ID!=='PASTE_ADMIN_USER_ID_HERE'&&session.user.id!==c.ADMIN_USER_ID){await db.auth.signOut();showLogin('این حساب اجازه مدیریت این منو را ندارد.');return;}
  $('#login').classList.add('hidden');$('#manager').classList.remove('hidden');
  const {data,error}=await db.from('products').select('*').order('sort_order');
  if(error){say('دریافت محصولات ناموفق بود. دسترسی مدیر و سیاست‌های امنیتی دیتابیس را بررسی کن.',true);return;}
  render(data||[]);
 }
 $('#loginform').addEventListener('submit',async e=>{e.preventDefault();if(!db){$('#loginmsg').textContent='ابتدا آدرس و کلید عمومی Supabase را در config.js تنظیم کن.';return;}const button=e.submitter;button.disabled=true;const {error}=await db.auth.signInWithPassword({email:$('#email').value.trim(),password:$('#password').value});button.disabled=false;if(error){$('#loginmsg').textContent='ورود ناموفق بود؛ ایمیل و رمز عبور را بررسی کن.';return;}await loadManager();});
 function render(data){
  const draw=()=>{
   const term=$('#search').value.trim().toLocaleLowerCase('fa'),cat=$('#filter').value;
   const filtered=data.filter(p=>(cat==='all'||p.category_id===cat)&&p.name.toLocaleLowerCase('fa').includes(term));
   $('#rows').innerHTML=filtered.map(p=>`<div class="editrow" data-id="${p.id}"><div><strong>${p.name}</strong><small>${cats[p.category_id]||''}</small></div><label>قیمت (تومان)<input class="price" type="number" min="0" step="1000" value="${p.price??''}" placeholder="مثلاً 85000"></label><label><input class="visible" type="checkbox" ${p.active?'checked':''}> نمایش در منو</label><button class="admin-button save" type="button">ذخیره</button></div>`).join('')||'<p>محصولی پیدا نشد.</p>';
   $('#rows').querySelectorAll('.save').forEach(button=>button.addEventListener('click',async()=>{
    const row=button.closest('.editrow'),raw=row.querySelector('.price').value.trim(),price=raw===''?null:Number(raw);
    if(price!==null&&(!Number.isSafeInteger(price)||price<0)){say('قیمت باید عدد صحیح و غیرمنفی باشد.',true);return;}
    button.disabled=true;const {error}=await db.from('products').update({price,active:row.querySelector('.visible').checked}).eq('id',row.dataset.id);button.disabled=false;
    say(error?'ذخیره انجام نشد؛ مجوز ویرایش مدیر را در Supabase بررسی کن.':'تغییرات با موفقیت ذخیره شد.',!!error);
   }));
  };
  $('#search').addEventListener('input',draw);$('#filter').addEventListener('change',draw);draw();
 }
 $('#logout').addEventListener('click',async()=>{await db.auth.signOut();showLogin('از حساب مدیریت خارج شدی.');});
 if(db)loadManager();else showLogin('اتصال Supabase هنوز تنظیم نشده است.');
})();
