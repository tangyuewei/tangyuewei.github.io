---
title: 来一卦
icon: fas fa-gamepad
order: 7
---
#### 一般什么时候占卜？

古代中国占卜的时间和场合多种多样，主要包括：
1. 重大决策之前
比如出征打仗、迁徙定居、建造房屋、结婚、生子等，都会先占卜，看看吉凶。
古代帝王和将军常在战争或国家大事前请卜官占卜。
2. 节令节气时
有些特定节日或节气，祭祀活动多，通常也会占卜，祈求风调雨顺、五谷丰登。
3. 遇到疑难事情或不顺时
遭遇灾难、疾病、家庭矛盾时，民间也会求神问卜，寻找化解办法。
4. 日常小事
有些人会在平常日子里占卜，比如问问今天是否适合出门、做某件事。

> 占卜是辅助决策的工具，不是迷信，要理性看待，不能盲目依赖。

<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>梅花易数</title>
  <!-- 引入 solarlunar.js 用于公历⇆农历转换 -->
  <script src="/assets/js/dist/solarlunar.js"></script>
  <script src="/assets/js/dist/bagua.js"></script>
  <style>
    /* 重置 */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body {
      font-family: "KaiTi", "STKaiti", "楷体", serif;
      /*background: linear-gradient(to bottom, #f0f4f8, #e2e8f0);*/
      color: #3b2f2f;
      padding: 1em;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .container {
      max-width: 400px;
      width: 100%;
      background: #fff;
      padding: 1.5em;
      border-radius: 1em;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e4e8;
    }
    h1 {
      font-size: 1.6rem;
      text-align: center;
      margin-bottom: 1em;
      color: #2c3e50;
    }
    form {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5em;
    }
    label {
      display: flex;
      flex-direction: column;
      font-size: 0.9rem;
      color: #4a5568;
    }
    input {
      margin-top: 0.25em;
      padding: 0.5em;
      font-size: 1rem;
      border: 1px solid #cbd5e0;
      border-radius: 0.5em;
      transition: border-color 0.2s;
    }
    input:focus {
      border-color: #3182ce;
      outline: none;
    }
    button {
      grid-column: 1 / -1;
      padding: 0.75em;
      font-size: 1rem;
      background: #3182ce;
      color: #fff;
      border: none;
      border-radius: 0.75em;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(49, 130, 206, 0.3);
      transition: background 0.2s, transform 0.1s;
    }
    button:hover {
      background: #2b6cb0;
      transform: translateY(-1px);
    }
    #result {
      display: none;
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    #result.show {
      display: block;
      opacity: 1;
    }
    .hexagram-block {
      background: #fafafa;
      padding: 1em;
      border-radius: 0.75em;
      margin-bottom: 1em;
      border: 1px solid #e2e8f0;
      font-size: 0.9rem;
      line-height: 1.4;
      cursor: pointer;
    }
    .hexagram-block.collapsed > :not(.section-title) {
      display: none;
    }
    .section-title {
      font-size: 1.2rem;
      text-align: center;
      margin-bottom: 0.75em;
      color: #2c3e50;
    }
    .hexagram-title {
      font-weight: bold;
      margin-bottom: 0.5em;
      font-size: 1.1rem;
      color: #2d3748;
    }
    .hexagram-text, .hexagram-info, .hexagram-comment {
      margin-bottom: 0.5em;
      color: #4a5568;
    }
    .hexagram-symbols {
      font-family: monospace;
      white-space: pre;
      text-align: center;
      margin-bottom: 0.75em;
      color: #2d3748;
    }
    .yao-list {
      list-style: none;
      padding-left: 0;
      margin-bottom: 0.5em;
    }
    .yao-list li {
      margin-bottom: 0.4em;
      padding-left: 0.5em;
      position: relative;
    }
    .yao-list li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #3182ce;
    }
    .info-row {
      margin-bottom: 0.5em;
      color: #4a5568;
    }
    .info-label {
      font-weight: bold;
      color: #2d3748;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate {
      animation: fadeInUp 0.5s ease-out;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>梅花易数</h1>
    <form id="form">
      <label>公历年<input type="number" id="year" value="2025" required></label>
      <label>月<input type="number" id="month" min="1" max="12" value="6" required></label>
      <label>日<input type="number" id="day" min="1" max="31" value="13" required></label>
      <label>时（0-23）<input type="number" id="hour" min="0" max="23" value="13" required></label>
      <button type="submit">起卦</button>
    </form>
    <div id="result">
      <!-- 用户信息 -->
      <div id="inputInfo" class="hexagram-block animate">
        <div class="section-title">输入及转换</div>
        <div class="info-row"><span class="info-label">公历：</span><span id="inputSolar"></span></div>
        <div class="info-row"><span class="info-label">农历：</span><span id="inputLunar"></span></div>
        <div class="info-row"><span class="info-label">年地支：</span><span id="infoYearBranch"></span></div>
        <div class="info-row"><span class="info-label">时地支：</span><span id="infoHourBranch"></span></div>
        <!-- 计算方法 -->
        <div id="calcInfo">
          <div class="section-title">计算方法</div>
          <div class="info-row" id="mainCalc"></div>
          <div class="info-row" id="changeCalc"></div>
          <!-- 变卦方法说明 -->
          <div id="method">
            <div class="section-title">变卦方法</div>
            <div id="methodText" class="hexagram-text"></div>
          </div>
        </div>
      </div>
      <!-- 主卦 -->
      <div id="hexagramMain" class="hexagram-block animate">
        <div class="section-title">主卦信息</div>
        <div id="mainTitle" class="hexagram-title"></div>
        <div class="info-row"><span class="info-label">上卦：</span><span id="upperInfo"></span></div>
        <div class="info-row"><span class="info-label">下卦：</span><span id="lowerInfo"></span></div>
        <div id="mainText" class="hexagram-text"></div>
        <div id="mainComment" class="hexagram-comment"></div>
        <div id="mainSymbols" class="hexagram-symbols"></div>
        <ul id="mainYaoList" class="yao-list"></ul>
           <!-- 变卦 -->
        <div id="hexagramChanged">
          <div class="section-title">变卦信息</div>
          <div id="changedTitle" class="hexagram-title"></div>
          <div id="changedIcon" class="hexagram-symbols"></div>
          <div class="info-row"><span class="info-label">上卦：</span><span id="bg_upperInfo"></span></div>
          <div class="info-row"><span class="info-label">下卦：</span><span id="bg_lowerInfo"></span></div>
          <div id="changedText" class="hexagram-text"></div>
          <div id="changedComment" class="hexagram-comment"></div>
          <ul id="changedYaoList" class="yao-list"></ul>
        </div>
        <!-- 综合解读 -->
        <div id="interpretation">
          <div class="section-title">综合解读</div>
          <div id="interpretText" class="hexagram-text"></div>
        </div>
      </div>
      <!-- 说明与免责声明 -->
      <div id="notes" class="hexagram-block animate">
        <div class="section-title">说明</div>
        <ul class="hexagram-text">
          <li>下卦(也称为内卦)位于下方，上卦(也称为外卦)位于上方。</li>
          <li>上卦代表外部环境，下卦代表内部状态。</li>
          <li>每个卦象由六个爻组成，从下往上数。</li>
          <li>主卦由上卦和下卦组合形成，代表当前整体局势。</li>
          <li>动爻是变动的关键爻，提示关注的焦点。</li>
          <li>变卦是动爻变化后形成的新卦，显示未来趋势。</li>
        </ul>
        <p class="hexagram-text">请结合具体情境和易经经典继续研判，并不保证其提供的任何预测或建议的真实性和准确性。</p>
      </div>
    </div>
  </div>
  <script>
  // 页面加载后调用一次
    window.onload = function () {
      setDefaultTime();
    };
    (function(){
      'use strict';
      const xianTian={1:{name:"乾",sym:"☰",hex:"111"},2:{name:"兑",sym:"☱",hex:"110"},3:{name:"离",sym:"☲",hex:"101"},4:{name:"震",sym:"☳",hex:"100"},5:{name:"巽",sym:"☴",hex:"011"},6:{name:"坎",sym:"☵",hex:"010"},7:{name:"艮",sym:"☶",hex:"001"},8:{name:"坤",sym:"☷",hex:"000"}};
      const dizhiMap={子:1,丑:2,寅:3,卯:4,辰:5,巳:6,午:7,未:8,申:9,酉:10,戌:11,亥:12};
      function hourToDizhi(h){const arr=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];return dizhiMap[arr[Math.floor(((h+1)%24)/2)]];}
      function mod(n,m){const r=n%m;return r===0?m:r;}

       // 模块点击切换
      function setupToggle(id){
        const el = document.getElementById(id);
        el.addEventListener('click', ()=> el.classList.toggle('collapsed'));
      }
      ['inputInfo','calcInfo','method','notes','hexagramMain','hexagramChanged','interpretation'].forEach(setupToggle);
      document.getElementById('form').addEventListener('submit',function(e){
        e.preventDefault();
        // 获取并显示输入信息
        const y=+year.value,m=+month.value,d=+day.value,h=+hour.value;
        document.getElementById('inputSolar').textContent = `${y}年${m}月${d}日 ${h}时`;
        if(m<1||m>12||d<1||d>31||h<0||h>23){alert('请输入有效的年月日时');return;}
        // 农历转换
        const lunar=solarlunar.solar2lunar(y,m,d);
        document.getElementById('inputLunar').textContent = `${lunar.lYear}年${lunar.lMonth}月${lunar.lDay}日`;
        const yearBranch=lunar.gzYear.slice(-1);
        // 不使用年地支
        //const yi=dizhiMap[yearBranch];
        const yi=y;
        const hi=hourToDizhi(h);
        document.getElementById('infoYearBranch').textContent = `${lunar.gzYear}`;
        document.getElementById('infoHourBranch').textContent = `${hi}`;
        const li=lunar.lMonth, di=lunar.lDay;
        const up=mod(yi+li+di,8), lo=mod(yi+li+di+hi,8), yIdx=mod(yi+li+di+hi,6);
        document.getElementById('mainCalc').textContent = `主卦计算：上卦 = (${yi} + ${li} + ${di}) mod8 = ${up}；下卦 = (${li} + ${di} + ${hi}) mod8 = ${lo}；序号 = ${(up-1)*8+lo}`;
        document.getElementById('changeCalc').textContent = `变卦计算：动爻 = (${yi} + ${li} + ${di} + ${hi}) mod6 = ${yIdx}`;
        // 填充上卦下卦信息
        document.getElementById('upperInfo').textContent = `${xianTian[up].name} ${xianTian[up].sym} `;
        document.getElementById('lowerInfo').textContent = `${xianTian[lo].name} ${xianTian[lo].sym} `;
        // 主卦与变卦
        let mainNum=(up-1)*8+lo;
        let mainHex=hexagrams64[mainNum];
        const mainHex2= xianTian[lo].hex+xianTian[up].hex;
        // 示例：根据“000111”获取相关值
        const hexagram = getHexagramByKey(mainHex2);
        if(hexagram){
          mainHex = hexagram;
          mainNum = hexagram.id;
        }
        //const changedNum=getChangedHexagram(mainNum,yIdx), changedHex=hexagrams64[changedNum];
        let changedNum=reverseBit(mainHex2,yIdx), changedHex=getHexagramByKey(changedNum);
        const originLine=hexagramsStructure[mainNum][yIdx-1];
        const bitDesc=originLine? '阳爻变阴爻':'阴爻变阳爻';
        document.getElementById('methodText').textContent = `将主卦第${yIdx}爻（${bitDesc}），得到变卦：${changedHex.name}`;
        document.getElementById('mainTitle').textContent = `主卦：${mainHex.name}`;
        document.getElementById('mainText').textContent = mainHex.text;
        document.getElementById('mainComment').textContent = mainHex.comment||'';
        document.getElementById('mainSymbols').textContent = xianTian[up].sym.repeat(1) + ' ' + xianTian[lo].sym.repeat(1);
        const mainList=document.getElementById('mainYaoList'); mainList.innerHTML='';
        binaryStringToArray(changedNum).forEach((bit,i)=>{ const liEl=document.createElement('li'); const idx=i+1; liEl.textContent=`第${idx}爻：${(yaoTexts[mainNum]||{})[idx]||''}`; if(idx===yIdx) liEl.style.fontWeight='bold'; mainList.appendChild(liEl); });
        document.getElementById('changedTitle').textContent = `变卦：${changedHex.name}`;
        const iconHex = reverseBinaryString(changedNum);
        document.getElementById('changedIcon').textContent = binaryStringToArray(iconHex).map(b=>b?'━━━':'━ ━').join('\n');
         // 填充上卦下卦信息
        document.getElementById('bg_upperInfo').textContent = `${changedHex.up}`;
        document.getElementById('bg_lowerInfo').textContent = `${changedHex.down}`;
        document.getElementById('changedText').textContent = changedHex.text;
        document.getElementById('changedComment').textContent = changedHex.comment||'';
        const changedList=document.getElementById('changedYaoList'); changedList.innerHTML='';
        binaryStringToArray(changedNum).forEach((bit,i)=>{ const liEl=document.createElement('li'); const idx=i+1; liEl.textContent=`第${idx}爻：${(yaoTexts[changedHex.id]||{})[idx]||''}`; changedList.appendChild(liEl); });
        document.getElementById('interpretText').textContent = `综合解读：主卦${mainHex.comment||mainHex.text}；动爻第${yIdx}爻提示${(yaoTexts[mainNum]||{})[yIdx]||''}；变卦${changedHex.name}意义${changedHex.comment||changedHex.text}`;
        document.getElementById('result').style.display='block';
        document.querySelectorAll('.animate').forEach(el=>{ el.classList.remove('animate'); void el.offsetWidth; el.classList.add('animate'); });
        // 延迟展示 result
        setTimeout(()=>{
          document.getElementById('result').classList.add('show');
          // 默认折叠非关键模块
          //['inputInfo','calcInfo','method','notes'].forEach(id=> document.getElementById(id).classList.add('collapsed'));
           ['inputInfo','notes'].forEach(id=> document.getElementById(id).classList.add('collapsed'));
        },1000);
      });
    })();
  </script>
</body>
</html>
