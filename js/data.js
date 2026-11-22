/* AZRA — ürün verisi */
const C = {
  pembe:{n:'Toz Gül',h:'#d8a7a7'}, pudra:{n:'Pudra',h:'#efdcd8'}, siyah:{n:'Siyah',h:'#2b2b2e'},
  beyaz:{n:'Kırık Beyaz',h:'#f3efe9'}, gri:{n:'Taş Grisi',h:'#a39e98'}, krem:{n:'Ekru',h:'#e8dfd2'},
  lila:{n:'Lila',h:'#c7b5d6'}, mocha:{n:'Mocha',h:'#8b6b5a'}, adacayi:{n:'Adaçayı',h:'#b5c2a5'},
  bebekmavi:{n:'Bebek Mavisi',h:'#bbd0e3'}, tereyagi:{n:'Tereyağı',h:'#f0de9e'}
};
const CATS = [
  {id:'elbise',name:'Elbise'},{id:'ust',name:'Üst Giyim'},{id:'alt',name:'Alt Giyim'},
  {id:'dis',name:'Dış Giyim'},{id:'ayakkabi',name:'Ayakkabı'},{id:'aksesuar',name:'Aksesuar'}
];
const S = ['XS','S','M','L','XL'], SHOE = ['36','37','38','39','40','41'], ONE = ['Standart'];
const mk = (id,name,cat,type,price,old,cols,sizes,rating,reviews,sold,desc,stock=40) =>
  ({id,name,cat,type,price,old,colors:cols.map(k=>({k,...C[k]})),sizes,rating,reviews,sold,desc,stock,order:id});

let PRODUCTS = [
  mk(1,'Saten Slip Elbise','elbise','dress',1290,1790,['pembe','adacayi'],S,4.8,214,1860,'Işıltılı saten dokusu ve vücuda akan kesimiyle gece ve gündüz kombinlerinin vazgeçilmezi. Ayarlanabilir askılı.'),
  mk(2,'Oversize Blazer Ceket','dis','jacket',2190,null,['pudra','mocha'],S,4.9,342,2410,'Omuzları belirgin, rahat kalıplı blazer. İş kombinlerinden sokak stiline her yerde şık durur.'),
  mk(3,'Crop Basic Tişört','ust','tshirt',390,520,['beyaz','lila'],S,4.6,891,5230,'%100 organik pamuk, yumuşak dokulu crop tişört. Yüksek bel pantolonlarla kusursuz.'),
  mk(4,'Yüksek Bel Wide Leg Pantolon','alt','pants',990,1290,['adacayi'],S,4.7,456,3120,'Akışkan kumaşlı, geniş paça pantolon. Bacakları uzun gösteren yüksek bel kesim.'),
  mk(5,'Kapüşonlu Sweatshirt','ust','hoodie',890,null,['gri','bebekmavi'],S,4.8,623,4010,'İçi şardonlu, oversize kalıplı kapüşonlu sweatshirt. Kanguru cepli.'),
  mk(6,'Midi Pileli Etek','alt','skirt',760,990,['pudra','lila'],S,4.5,178,1420,'Hareketli pileli midi etek. Beli lastikli, her bedene uyum sağlar.'),
  mk(7,'Uzun Trençkot','dis','coat',2890,3490,['krem'],S,4.9,267,1330,'Su itici kumaş, kemerli ve çift sıra düğmeli klasik trençkot.'),
  mk(8,'Chunky Platform Sneaker','ayakkabi','shoe',1790,2190,['beyaz','pembe'],SHOE,4.8,512,2760,'Kalın tabanlı, gün boyu konfor sunan platform sneaker.'),
  mk(9,'Mini Omuz Çantası','aksesuar','bag',950,null,['krem','pembe'],ONE,4.7,388,2980,'Zincir askılı, mıknatıslı kapaklı mini çanta. Telefon ve kartlık için ideal.'),
  mk(10,'Çiçekli Midi Elbise','elbise','dress',1450,null,['beyaz','pudra'],S,4.6,129,870,'Hafif viskon kumaş, V yaka ve belden büzgülü romantik midi elbise.'),
  mk(11,'Oversize Gömlek','ust','shirt',720,null,['beyaz','bebekmavi'],S,4.5,301,1990,'Poplin dokulu, düşük omuzlu oversize gömlek.'),
  mk(12,'Deri Görünümlü Biker Ceket','dis','jacket',2450,2990,['siyah','mocha'],S,4.7,198,1180,'Vegan deri, asimetrik fermuarlı biker ceket.'),
  mk(13,'Mom Fit Jean','alt','pants',1090,null,['beyaz','gri'],S,4.8,774,4620,'Yüksek bel, rahat paça mom fit denim. Esnek ve dayanıklı.'),
  mk(14,'Triko Crop Kazak','ust','hoodie',840,1090,['krem','lila'],S,4.6,254,1540,'Yumuşak örgü dokulu, kısa kesim triko kazak.'),
  mk(15,'Bodycon Mini Elbise','elbise','dress',990,1390,['lila'],S,4.7,602,3680,'Vücuda oturan esnek kumaş, mini boy parti elbisesi.'),
  mk(16,'Kargo Pantolon','alt','pants',1150,null,['krem','adacayi'],S,4.6,340,2205,'Geniş cepli, bel bağcıklı parachute kargo pantolon.'),
  mk(17,'Kısa Puffer Mont','dis','jacket',2790,3290,['pembe','krem'],S,4.9,415,2890,'Hafif dolgulu, kısa kesim puffer mont. Kış sokaklarının yıldızı.'),
  mk(18,'Retro Koşu Ayakkabısı','ayakkabi','shoe',1590,null,['pudra','gri'],SHOE,4.5,233,1210,'Süet detaylı, hafif tabanlı retro koşu modeli.'),
  mk(19,'Pamuklu Oversize Tişört','ust','tshirt',450,null,['beyaz','tereyagi'],S,4.7,1204,6840,'Düşük omuz, kalın pamuk. Yaz kışın en çok tercih edilen basic.'),
  mk(20,'Deri Cüzdan','aksesuar','bag',590,790,['pembe','mocha'],ONE,4.6,167,980,'Kompakt, 8 kart gözlü fermuarlı cüzdan.'),
  mk(21,'Saten Mini Etek','alt','skirt',690,null,['krem','lila'],S,4.5,142,1070,'Parlak saten, eğik kesim mini etek.'),
  mk(22,'Şal Yün Atkı','aksesuar','scarf',420,550,['gri','pembe'],ONE,4.8,298,2150,'Yumuşak yün karışımlı geniş atkı.'),
  mk(23,'Kruvaze Blazer Elbise','elbise','dress',1890,null,['pudra','mocha'],S,4.8,96,640,'Kruvaze yaka, kemerli blazer elbise. Ofis ve davet şıklığı bir arada.'),
  mk(24,'Bucket Şapka','aksesuar','hat',380,null,['adacayi'],ONE,4.4,205,1730,'Pamuklu, iki taraflı kullanılabilen bucket şapka.')
];
/* Gerçek ürün fotoğrafları: img/urun/<id 2 hane>-<renk>.webp. Listede olmayan ürün/renk SVG çizimine düşer (örn. 12 Biker Ceket). */
const PHOTOS = new Set('1-adacayi,1-pembe,2-mocha,2-pudra,3-beyaz,3-lila,4-adacayi,5-bebekmavi,5-gri,6-lila,6-pudra,7-krem,8-beyaz,8-pembe,9-krem,9-pembe,10-beyaz,10-pudra,11-bebekmavi,11-beyaz,12-mocha,12-siyah,13-beyaz,13-gri,14-krem,14-lila,15-lila,16-adacayi,16-krem,17-krem,17-pembe,18-gri,18-pudra,19-beyaz,19-tereyagi,20-mocha,20-pembe,21-krem,21-lila,22-gri,22-pembe,23-mocha,23-pudra,24-adacayi'.split(','));
const photoUrl = (id, k) => PHOTOS.has(id + '-' + k) ? `img/urun/${String(id).padStart(2, '0')}-${k}.webp` : null;
try{
  const extra = JSON.parse(localStorage.getItem('azra_custom')||'[]');
  extra.forEach(p=>PRODUCTS.push(p));
}catch(e){}

const COUPONS = {
  AZRA10:{t:'pct',v:10,d:'%10 indirim'},
  HOSGELDIN:{t:'pct',v:15,d:'%15 hoş geldin indirimi'},
  PEMBE200:{t:'flat',v:200,min:1000,d:'1000₺ üzeri 200₺ indirim'}
};
const FREE_SHIP = 1500, SHIP = {standart:{n:'Standart Kargo (2-4 iş günü)',p:49.9}, hizli:{n:'Hızlı Kargo (1-2 iş günü)',p:89.9}};
const STATUS = ['Sipariş Alındı','Hazırlanıyor','Kargoya Verildi','Teslim Edildi'];
