// API va SQLite: quyen truy cap luon duoc kiem tra tren server.
const express = require('express');
const cors = require('cors');
const { DatabaseSync } = require('node:sqlite');
const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const { mkdirSync } = require('node:fs');
const path = require('node:path');
mkdirSync(path.join(__dirname, 'data'), { recursive: true });
const db = new DatabaseSync(path.join(__dirname, 'data', 'farmart.db'));
db.exec(`PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer', phone TEXT DEFAULT '', address TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, expires INTEGER);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price INTEGER NOT NULL, oldPrice INTEGER NOT NULL, stock INTEGER NOT NULL, image TEXT NOT NULL, unit TEXT NOT NULL, description TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), total INTEGER NOT NULL, address TEXT NOT NULL, items TEXT NOT NULL, created TEXT DEFAULT CURRENT_TIMESTAMP);`);
function hash(password) { const salt = randomBytes(16).toString('hex'); return salt + ':' + scryptSync(password, salt, 64).toString('hex'); }
function verify(password, stored) { const [salt, key] = stored.split(':'); return timingSafeEqual(Buffer.from(key, 'hex'), scryptSync(password, salt, 64)); }
const safe = u => { const { password, ...rest } = u; return rest; };
if (!db.prepare('SELECT id FROM users LIMIT 1').get()) {
  db.prepare('INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)').run('Farmart Admin', 'admin@farmart.vn', hash('Admin@12345'), 'admin');
}
if (!db.prepare('SELECT id FROM products LIMIT 1').get()) {
  const seeds = [
    ['Bơ sáp Đắk Lắk','Rau củ & trái cây',65000,79000,45,'photo-1523049673857-eb18f1d7b578','1 kg'],
    ['Dâu tây Đà Lạt','Rau củ & trái cây',89000,119000,30,'photo-1464965911861-746a04b4bca6','Hộp 500 g'],
    ['Cam vàng mọng nước','Rau củ & trái cây',49000,65000,70,'photo-1547514701-42782101795e','1 kg'],
    ['Bánh mì nguyên cám','Bánh mì & ngũ cốc',35000,42000,22,'photo-1509440159596-0249088772ff','Ổ 400 g'],
    ['Sữa tươi organic','Sữa & trứng',42000,52000,50,'photo-1563636619-e9143da7973b','Chai 1 lít'],
    ['Trứng gà thả vườn','Sữa & trứng',38000,45000,60,'photo-1518569656558-1f25e69d93d7','Hộp 10 quả'],
    ['Cà phê rang mộc','Đồ uống',125000,155000,25,'photo-1559525839-b184a4d698c7','Túi 250 g'],
    ['Cá hồi tươi','Thịt & hải sản',189000,220000,18,'photo-1510130387422-82bed34b37e9','Khay 500 g'],
  ];
  const insert = db.prepare('INSERT INTO products(name,category,price,oldPrice,stock,image,unit,description) VALUES(?,?,?,?,?,?,?,?)');
  seeds.forEach(p => insert.run(...p.slice(0,5), `https://images.unsplash.com/${p[5]}?auto=format&fit=crop&w=640&q=85`, p[6], 'Sản phẩm được tuyển chọn mỗi ngày, nguồn gốc rõ ràng. Bảo quản nơi thoáng mát hoặc trong ngăn mát tủ lạnh.'));
}
const app = express();
app.use(cors({ origin: ['http://localhost:8081','http://localhost:8082','http://127.0.0.1:8081'] }));
app.use(express.json({ limit: '100kb' }));
const wrap = fn => (req,res,next) => { try { fn(req,res,next); } catch(e) { next(e); } };
function auth(req,res,next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /,'');
  const session = db.prepare('SELECT user_id FROM sessions WHERE token=? AND expires>?').get(token, Date.now());
  if (!session) return res.status(401).json({error:'Vui lòng đăng nhập lại.'});
  req.user = db.prepare('SELECT * FROM users WHERE id=?').get(session.user_id); req.token=token; next();
}
function admin(req,res,next) { if(req.user.role!=='admin') return res.status(403).json({error:'Bạn không có quyền quản trị.'}); next(); }
app.get('/api/products', (req,res) => res.json(db.prepare('SELECT * FROM products ORDER BY id').all()));
app.post('/api/auth/:mode', wrap((req,res) => {
  const {name,password} = req.body; const email = String(req.body.email||'').trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(email) || typeof password!=='string' || password.length<8 || password.length>128) return res.status(400).json({error:'Email hợp lệ và mật khẩu từ 8 đến 128 ký tự.'});
  if(req.params.mode==='register') {
    if(typeof name!=='string'||!name.trim()) return res.status(400).json({error:'Vui lòng nhập họ tên.'});
    if(db.prepare('SELECT id FROM users WHERE email=?').get(email)) return res.status(409).json({error:'Email đã được đăng ký.'});
    db.prepare('INSERT INTO users(name,email,password) VALUES(?,?,?)').run(name.trim(),email,hash(password));
  } else if(req.params.mode!=='login') return res.sendStatus(404);
  const user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if(!user || !verify(password,user.password)) return res.status(401).json({error:'Email hoặc mật khẩu không đúng.'});
  const token=randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(token,user.id,Date.now()+7*86400000);
  res.json({token,user:safe(user)});
}));
app.get('/api/me',auth,(req,res)=>res.json(safe(req.user)));
app.put('/api/me',auth,wrap((req,res)=>{
  const {name,phone,address}=req.body;
  if(typeof name!=='string'||!name.trim()||typeof phone!=='string'||typeof address!=='string') return res.status(400).json({error:'Hồ sơ không hợp lệ.'});
  db.prepare('UPDATE users SET name=?,phone=?,address=? WHERE id=?').run(name.trim(),phone,address,req.user.id);
  res.json(safe(db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id)));
}));
app.post('/api/logout',auth,(req,res)=>{ db.prepare('DELETE FROM sessions WHERE token=?').run(req.token); res.json({ok:true}); });
app.get('/api/orders',auth,(req,res)=>res.json(db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY id DESC').all(req.user.id)));
// Transaction tranh tru kho mot phan khi mot mat hang het hang.
app.post('/api/orders',auth,wrap((req,res)=>{
  const {items,address}=req.body;
  if(!Array.isArray(items)||!items.length||typeof address!=='string'||address.trim().length<10) return res.status(400).json({error:'Giỏ hàng và địa chỉ giao hàng (ít nhất 10 ký tự) là bắt buộc.'});
  db.exec('BEGIN IMMEDIATE');
  try {
    let total=0; const lines=[]; const seen=new Set();
    for(const item of items) {
      const p=db.prepare('SELECT * FROM products WHERE id=?').get(item.id);
      if(!p||seen.has(item.id)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>p.stock) throw Error('Số lượng hoặc tồn kho không hợp lệ. Hãy kiểm tra lại giỏ hàng.');
      seen.add(item.id); total+=p.price*item.quantity; lines.push({name:p.name,price:p.price,quantity:item.quantity});
      db.prepare('UPDATE products SET stock=stock-? WHERE id=?').run(item.quantity,p.id);
    }
    const result=db.prepare('INSERT INTO orders(user_id,total,address,items) VALUES(?,?,?,?)').run(req.user.id,total,address.trim(),JSON.stringify(lines));
    db.exec('COMMIT');res.json({id:Number(result.lastInsertRowid),total});
  } catch(e) { db.exec('ROLLBACK');res.status(400).json({error:e.message}); }
}));
function product(body) {
  const {name,category,price,oldPrice,stock,image,unit,description}=body;
  if(![name,category,image,unit,description].every(v=>typeof v==='string'&&v.trim()) || ![price,oldPrice,stock].every(v=>Number.isSafeInteger(v)&&v>=0) || price<1 || oldPrice<price || !/^https:\/\//.test(image)) throw Error('Kiểm tra tên, ảnh HTTPS, giá và tồn kho. Giá gốc phải >= giá bán.');
  return [name.trim(),category,price,oldPrice,stock,image,unit,description];
}
app.post('/api/products',auth,admin,wrap((req,res)=>{const p=product(req.body); const r=db.prepare('INSERT INTO products(name,category,price,oldPrice,stock,image,unit,description) VALUES(?,?,?,?,?,?,?,?)').run(...p);res.json({id:Number(r.lastInsertRowid)});}));
app.put('/api/products/:id',auth,admin,wrap((req,res)=>{const p=product(req.body);db.prepare('UPDATE products SET name=?,category=?,price=?,oldPrice=?,stock=?,image=?,unit=?,description=? WHERE id=?').run(...p,req.params.id);res.json({ok:true});}));
app.delete('/api/products/:id',auth,admin,wrap((req,res)=>{db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);res.json({ok:true});}));
app.get('/api/users',auth,admin,(req,res)=>res.json(db.prepare('SELECT id,name,email,role,phone,address FROM users').all()));
app.put('/api/users/:id',auth,admin,wrap((req,res)=>{
  if(!['customer','admin'].includes(req.body.role)) return res.status(400).json({error:'Vai trò không hợp lệ.'});
  if(Number(req.params.id)===req.user.id) return res.status(400).json({error:'Không thể đổi quyền của chính bạn.'});
  db.prepare('UPDATE users SET role=? WHERE id=?').run(req.body.role,req.params.id);res.json({ok:true});
}));
app.delete('/api/users/:id',auth,admin,wrap((req,res)=>{
  if(Number(req.params.id)===req.user.id) return res.status(400).json({error:'Không thể xóa chính bạn.'});
  if(db.prepare('SELECT id FROM orders WHERE user_id=? LIMIT 1').get(req.params.id)) return res.status(400).json({error:'Người dùng có đơn hàng, không thể xóa.'});
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);res.json({ok:true});
}));
app.use((err,req,res,next)=>res.status(400).json({error:err.message||'Yêu cầu không hợp lệ.'}));
app.listen(3001,'127.0.0.1',()=>console.log('Farmart API: http://localhost:3001'));
