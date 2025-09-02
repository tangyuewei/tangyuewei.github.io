---
#layout: zhanbu
title: 占卜
icon: fas fa-gift
order: 6
---
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="/assets/js/dist/solarlunar.js"></script>
  <script src="/assets/js/dist/bagua.js"></script>
  <title>周易占卜</title>
  <style>
    body {
      /*background: #fdf5e6;*/
      color: #3a2e1b;
      font-family: "KaiTi", "STKaiti", "楷体", serif;
      margin: 0;
      padding: 0;
    }

    .container {
      width: 360px;
      margin: 30px auto;
      padding: 24px;
      border: 6px solid #b08968;
      border-radius: 12px;
      background: rgba(255, 245, 230, 0.95);
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    h1 {
      font-size: 26px;
      letter-spacing: 2px;
    }

    /* 时间输入区域 */
    .input-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 20px;
    }

    .input-group label {
      flex: 1 1 45%;
      text-align: left;
      font-weight: bold;
    }

    .input-group input,
    .input-group select {
      width: 100%;
      padding: 6px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    /* 卦象显示 */
    #hexagram {
      margin-left: 20%;
      margin-right: 20%;
      margin-bottom: 5%;
    }

    .line {
      width: 100%;
      height: 16px;
      margin: 6px 0;
      opacity: 0;
    }

    .yang {
      background-color: #3a2e1b;
    }

    .yang_dong {
    background-color: #dc3545;
    }

    .yin {
      background-image: linear-gradient(to right,
          #000 47%,
          #000 47%, /* 黑色线条宽度为43% */
          transparent 47%, /* 间隔开始 */
          transparent 54%, /* 间隔结束 */
          #000 48%, /* 另一段黑色线条开始 */
          #000 48% /* 第二条黑线的结束 */
        )
    }

    .yin_dong {
    background-image: linear-gradient(to right,
    #dc3545 47%,
    #dc3545 47%, /* 黑色线条宽度为43% */
    transparent 47%, /* 间隔开始 */
    transparent 54%, /* 间隔结束 */
    #dc3545 48%, /* 另一段黑色线条开始 */
    #dc3545 48% /* 第二条黑线的结束 */
    )
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* 按钮 */
    #drawBtn {
      padding: 10px 30px;
      font-size: 16px;
      color: #fff;
      background-color: #b08968;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    #drawBtn:hover {
      background-color: #99734d;
    }

    /* 结果展示区 */
    #result {
      margin-top: 24px;
      text-align: left;
      line-height: 1.6;
    }

    #result h2 {
      font-size: 20px;
      /* margin: 0 0 8px; */
      border-bottom: 1px dashed #b08968;
      padding-bottom: 4px;
      font-family: 'Lato', 'Microsoft Yahei', sans-serif;
    }

    #result p {
      margin: 6px 0;
    }

    hr {
      margin: 16px 0;
    }
  </style>
</head>
<body>

<div class="container">
  <h3 style="font-family: 'Lato', 'Microsoft Yahei', sans-serif;">起卦时间设置</h3>
  <!-- 时间输入 -->
  <div class="input-group">
    <label>年：<input type="number" id="year" value="2025" style="width: 50%;"></label>
    <label>月：<input type="number" id="month" value="6" style="width: 50%;"></label>
    <label>日：<input type="number" id="day" value="13" style="width: 50%;"></label>
    <label>时辰：
      <select id="hour"  style="width: 40%;">
        <option value="0">子 (23:00-1:00)</option>
        <option value="1">丑 (1:00-3:00)</option>
        <option value="2">寅 (3:00-5:00)</option>
        <option value="3">卯 (5:00-7:00)</option>
        <option value="4">辰 (7:00-9:00)</option>
        <option value="5">巳 (9:00-11:00)</option>
        <option value="6">午 (11:00-13:00)</option>
        <option value="7">未 (13:00-15:00)</option>
        <option value="8">申 (15:00-17:00)</option>
        <option value="9">酉 (17:00-19:00)</option>
        <option value="10">戌 (19:00-21:00)</option>
        <option value="11">亥 (21:00-23:00)</option>
      </select>
    </label>
  </div>

  <!-- 六爻卦象 -->
  <div id="hexagram"></div>

  <!-- 按钮 -->
<button id="drawBtn">起卦</button>

  <!-- 占卜结果 -->
  <div id="result"></div>

  <!-- 流年卦盘 -->
  <div class="section">
    <div id="annualHexagram"></div>
  </div>
</div>

<script>
  // 三爻八卦定义
  const trigrams = [
    { name: "坤", bin: "000", sym:"(☷)" },
    { name: "艮", bin: "001", sym:"(☶)" },
    { name: "坎", bin: "010", sym:"(☵)" },
    { name: "巽", bin: "011", sym:"(☴)" },
    { name: "震", bin: "100", sym:"(☳)" },
    { name: "离", bin: "101", sym:"(☲)" },
    { name: "兑", bin: "110", sym:"(☱)" },
    { name: "乾", bin: "111", sym:"(☰)" }
  ];

  function getHexagramFromTime(year, month, day, hour) {
    const upperIndex = (year + month + day) % 8;
    const lowerIndex = (month + day + hour) % 8;

    const fullBinary = trigrams[lowerIndex].bin + trigrams[upperIndex].bin;
    const movingLine = ((year + month + day + hour) % 6) + 1;

    return {
      binary: fullBinary,
      upper: trigrams[upperIndex].name,
      upSym: trigrams[upperIndex].sym,
      lower: trigrams[lowerIndex].name,
      lowSym: trigrams[lowerIndex].sym,
      movingLine
    };
  }

  function drawHexagram() {
    const year = parseInt(document.getElementById('year').value) || new Date().getFullYear();
    const month = parseInt(document.getElementById('month').value) || new Date().getMonth() + 1;
    const day = parseInt(document.getElementById('day').value) || new Date().getDate();
    const hour = parseInt(document.getElementById('hour').value);

    const { binary, upper, lower, movingLine , upSym, lowSym} = getHexagramFromTime(year, month, day, hour);

    const hexagramDiv = document.getElementById('hexagram');
    hexagramDiv.innerHTML = '';

    const bits = binary.split('');
    for (let i = 0; i < bits.length; i++) {
      const div = document.createElement('div');
      //爻是从下往上数的，画是从上往下画的  001 010 得 010 100 画出来
      if((5-i) === (movingLine-1)){
        div.className = 'line ' + (bits[5-i] === '1' ? 'yang_dong' : 'yin_dong');
      }else{
        div.className = 'line ' + (bits[5-i] === '1' ? 'yang' : 'yin');
      }
      div.style.animation = `fadeInUp 0.5s ease forwards ${i * 0.3}s`;
      hexagramDiv.appendChild(div);
    }
    // bits.forEach((bit, idx) => {
    //   const div = document.createElement('div');
    //   div.className = 'line ' + (bit === '1' ? 'yang' : 'yin');
    //   div.style.animation = `fadeInUp 0.5s ease forwards ${idx * 0.3}s`;
    //   hexagramDiv.appendChild(div);
    // });

    setTimeout(() => {
      const info = hexagrams[binary] || {
        name: "未知卦象",
        text: "此卦未收录，解释待补充。"
      };

      let changedBin = '';
      for (let i = 0; i < binary.length; i++) {
        if (i === (movingLine - 1)) {
          changedBin += binary[i] === '1' ? '0' : '1';
        } else {
          changedBin += binary[i];
        }
        // if (i === 5 - (movingLine - 1)) {
        //   changedBin += binary[i] === '1' ? '0' : '1';
        // } else {
        //   changedBin += binary[i];
        // }
      }

      const changedInfo = hexagrams[changedBin] || {
        name: "未知卦象",
        text: "此卦未收录，解释待补充。"
      };

      document.getElementById('result').innerHTML = `
        <h2>主卦：${info.name}</h2>
        <p><strong>上下卦：</strong>上卦为${upper}${upSym}，下卦为${lower}${lowSym}。</p>
        <p><strong>动爻：</strong>第${movingLine}爻变动。</p>
        <p>${info.text}${info.modern_text}</p>
        <hr>
        <h2>变卦：${changedInfo.name}</h2>
        <p>${changedInfo.text}${changedInfo.modern_text}</p>
        <hr>
      `;
    }, 6 * 300 + 500);
  }

  function drawAnnualHexagram() {
    const now = new Date();
    const year = now.getFullYear();

    const baseYear = year; // 固定年份做演示
    const hexagramKey = (baseYear % 64).toString(2).padStart(6, '0');

    const info = hexagrams[hexagramKey] || {
      name: "未知卦象",
      text: "此卦未收录，解释待补充。",
      modern_text: ""
    };

    document.getElementById('annualHexagram').innerHTML = `
      <div class="card">
        <h3>流年卦象：${info.name}</h3>
        <p>${info.text}；${info.modern_text}</p>
      </div>
    `;
  }

  document.getElementById('drawBtn').addEventListener('click', drawHexagram);
  drawAnnualHexagram(); // 自动加载流年卦盘

  // 改进的流年卦盘功能，允许用户选择任意年份
  function drawAnnualHexagram(year) {
    if(!year){
      year = new Date().getFullYear();
    }
    const hexagramKey = (year % 64).toString(2).padStart(6, '0');
    const info = hexagrams[hexagramKey] || {
      name: "未知卦象",
      text: "此卦未收录，解释待补充。",
      modern_text: ""
    };

    document.getElementById('annualHexagram').innerHTML = `
      <div class="card">
        <h3>流年卦象：${info.name}</h3>
        <p>${info.text}；${info.modern_text}</p>
      </div>
    `;
  }

  // 按钮点击事件，用于重新生成卦象
  document.getElementById('drawBtn').addEventListener('click', function() {
    drawHexagram(); // 重新绘制卦象
    drawAnnualHexagram(parseInt(document.getElementById('year').value)); // 更新流年卦
  });

function setDefaultTime() {
  const now = new Date();

  const year = now.getFullYear();           // 年
  const month = now.getMonth() + 1;         // 月（从0开始）
  const day = now.getDate();                // 日
  const hour24 = now.getHours();            // 小时（24小时制）

  // 计算时辰（子时：23~1点，丑时：1~3点……亥时：21~23点）
  let chineseHourIndex = Math.floor((hour24 + 1) / 2) % 12;

  // 设置输入框内容
  document.getElementById("year").value = year;
  document.getElementById("month").value = month;
  document.getElementById("day").value = day;
  document.getElementById("hour").value = chineseHourIndex;
}

  // 页面加载后调用一次
  window.onload = function () {
    setDefaultTime();
  };
</script>

</body>
</html>
