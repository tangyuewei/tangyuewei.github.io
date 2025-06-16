---
#layout: zhanbu
title: 遇事不决
icon: fas fa-gift
order: 6
---
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>易经占卜</title>
  <style>
    body {
      /*background: #fdf5e6;*/
      color: #3a2e1b;
      font-family: "KaiTi", "STKaiti", "楷体", serif;
      margin: 0;
      padding: 0;
    }

    .container {
      width: 480px;
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
      margin-bottom: 20px;
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

    .yin {
      background-image: repeating-linear-gradient(
        to right,
        #3a2e1b 0px,
        #3a2e1b 6px,
        transparent 6px,
        transparent 18px
      );
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
    { name: "坤", bin: "000" },
    { name: "艮", bin: "001" },
    { name: "坎", bin: "010" },
    { name: "巽", bin: "011" },
    { name: "震", bin: "100" },
    { name: "离", bin: "101" },
    { name: "兑", bin: "110" },
    { name: "乾", bin: "111" }
  ];

  // 64卦定义（简化版，请替换为你已有的完整数据）
  const hexagrams = {
    "000000": { name: "坤为地（坤卦）", text: "地势坤，君子以厚德载物。此卦象征包容承载，凡事宜谦和顺应。" },
    "000001": { name: "地雷复（复卦）", text: "亨。出入无疾，朋来无咎。反复其道，七日来复，利有攸往。此卦象征阳气初生，万物复苏。" },
    "000010": { name: "地泽通谷（临卦）", text: "元亨利贞，至于八月有凶。此卦象征亲近民众，领导指导，需注意适可而止。" },
    "000011": { name: "地天泰（泰卦）", text: "小往大来，吉亨。此卦象征阴阳交泰，上下互通，万事吉祥。" },
    "000100": { name: "雷地豫（豫卦）", text: "利建侯行师。此卦象征安乐和悦，宜于兴师动众，有所作为。" },
    "000101": { name: "雷雷震（震卦）", text: "震惊百里，不丧匕鬯。此卦象征震动惊惧，需保持镇定从容应对。" },
    "000110": { name: "雷风恒（恒卦）", text: "亨，无咎，利贞，利有攸往。此卦象征持久稳定，做事贵在坚持。" },
    "000111": { name: "雷水解（解卦）", text: "利西南，无所往，其来复吉。有利有攸往，往有功也。此卦象征解除困厄，万象更新。" },
    "001000": { name: "水地比（比卦）", text: "吉。原筮元永贞，无咎。不宁方来，后夫凶。此卦象征相亲相辅，团结互助。" },
    "001001": { name: "水雷屯（屯卦）", text: "磐桓，利居贞，利建侯。此卦象征事物萌芽，需谨慎应对，遇事不可急躁。" },
    "001010": { name: "水泽节（节卦）", text: "亨。苦节不可贞。此卦象征节制适度，过度则凶。" },
    "001011": { name: "水天需（需卦）", text: "有孚光亨，贞吉。利涉大川，利贞。此卦象征等待时机，需耐心待时。" },
    "001100": { name: "泽地萃（萃卦）", text: "亨，王假有庙，致孝于前文人。利见大人，亨利贞。用大牲吉，利有攸往。此卦象征聚集会合，人才荟萃。" },
    "001101": { name: "泽雷随（随卦）", text: "元亨利贞，无咎。此卦象征随从附和，顺时而动。" },
    "001110": { name: "泽风大过（大过卦）", text: "栋桡，利有攸往，亨。此卦象征大有作为，但也容易过度失误。" },
    "001111": { name: "泽水困（困卦）", text: "亨，贞大人吉，无咎，有言不信。此卦象征处于困境，需守正待时。" },
    "010000": { name: "天泽履（履卦）", text: "履虎尾，不咥人，亨。此卦象征小心行事，在危险中保持谨慎。" },
    "010001": { name: "天雷无妄（无妄卦）", text: "元亨利贞。其匪正有眚，不利有攸往。此卦象征诚实无欺，不宜妄动。" },
    "010010": { name: "天山遯（遯卦）", text: "亨小利贞。此卦象征退避隐遁，明哲保身。" },
    "010011": { name: "天地否（否卦）", text: "否之匪人，不利君子贞，大往小来。此卦象征闭塞不通，上下隔阂。" },
    "010100": { name: "火地晋（晋卦）", text: "康侯用锡马蕃庶，昼日三接。此卦象征晋升发展，光明前进。" },
    "010101": { name: "火山旅（旅卦）", text: "小亨，旅贞吉。此卦象征客居外乡，需坚守正道。" },
    "010110": { name: "火风鼎（鼎卦）", text: "元吉亨。此卦象征除旧布新，重立权威。" },
    "010111": { name: "火水未济（未济卦）", text: "小狐汔济，濡其尾，无攸利。此卦象征事未成，需谨慎从事。" },
    "011000": { name: "山地剥（剥卦）", text: "不利有攸往。此卦象征阴盛阳衰，事物将尽。" },
    "011001": { name: "山雷颐（颐卦）", text: "自求口实，观其自养也。观此卦象，当自食其力，审慎修养。" },
    "011010": { name: "山水蒙（蒙卦）", text: "亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。此卦象征启蒙教育，需循序渐进。" },
    "011011": { name: "山天大畜（大畜卦）", text: "利贞，不家食吉，利有攸往。此卦象征积蓄力量，厚积薄发。" },
    "011100": { name: "风地观（观卦）", text: "盥而不荐，有孚颙若。此卦象征观察瞻望，需心怀诚信。" },
    "011101": { name: "风雷益（益卦）", text: "利用为大作，元吉，无咎。此卦象征受益增益，利于有所作为。" },
    "011110": { name: "风火家人（家人卦）", text: "利女贞。此卦象征家庭伦理，和睦相处之道。" },
    "011111": { name: "风水涣（涣卦）", text: "亨，王假有庙，利涉大川，利贞。此卦象征离散化解，重新聚合。" },
    "100000": { name: "天山遯（遯卦）", text: "亨小利贞。此卦象征退避隐遁，明哲保身。" },
    "100001": { name: "天地否（否卦）", text: "否之匪人，不利君子贞，大往小来。此卦象征闭塞不通，上下隔阂。" },
    "100010": { name: "天泽履（履卦）", text: "履虎尾，不咥人，亨。此卦象征小心行事，在危险中保持谨慎。" },
    "100011": { name: "天火同人（同人卦）", text: "同人于野，亨。利涉大川，利君子贞。此卦象征志同道合，天下一家。" },
    "100100": { name: "地火明夷（明夷卦）", text: "利艰贞。此卦象征光明受损，韬光养晦之时。" },
    "100101": { name: "地天泰（泰卦）", text: "小往大来，吉亨。此卦象征阴阳交泰，上下互通，万事吉祥。" },
    "100110": { name: "地泽通谷（临卦）", text: "元亨利贞，至于八月有凶。此卦象征亲近民众，领导指导，需注意适可而止。" },
    "100111": { name: "地雷复（复卦）", text: "亨。出入无疾，朋来无咎。反复其道，七日来复，利有攸往。此卦象征阳气初生，万物复苏。" },
    "101000": { name: "火天大有（大有卦）", text: "元亨。此卦象征大获所有，丰收之象，需守中道。" },
    "101001": { name: "火泽睽（睽卦）", text: "小事吉。此卦象征分离对立，小事可行，大事不宜。" },
    "101010": { name: "火山旅（旅卦）", text: "小亨，旅贞吉。此卦象征客居外乡，需坚守正道。" },
    "101011": { name: "火地晋（晋卦）", text: "康侯用锡马蕃庶，昼日三接。此卦象征晋升发展，光明前进。" },
    "101100": { name: "山水蒙（蒙卦）", text: "亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。此卦象征启蒙教育，需循序渐进。" },
    "101101": { name: "山天大畜（大畜卦）", text: "利贞，不家食吉，利有攸往。此卦象征积蓄力量，厚积薄发。" },
    "101110": { name: "山地剥（剥卦）", text: "不利有攸往。此卦象征阴盛阳衰，事物将尽。" },
    "101111": { name: "山雷颐（颐卦）", text: "自求口实，观其自养也。观此卦象，当自食其力，审慎修养。" },
    "110000": { name: "泽火革（革卦）", text: "己日乃孚，元亨利贞，悔亡。此卦象征变革创新，去除旧弊。" },
    "110001": { name: "泽地萃（萃卦）", text: "亨，王假有庙，致孝于前文人。利见大人，亨利贞。用大牲吉，利有攸往。此卦象征聚集会合，人才荟萃。" },
    "110010": { name: "泽山咸（咸卦）", text: "亨利贞，取女吉。此卦象征感应交流，情感相通。" },
    "110011": { name: "泽风大过（大过卦）", text: "栋桡，利有攸往，亨。此卦象征大有作为，但也容易过度失误。" },
    "110100": { name: "风火家人（家人卦）", text: "利女贞。此卦象征家庭伦理，和睦相处之道。" },
    "110101": { name: "风山渐（渐卦）", text: "女归吉，利贞。此卦象征循序渐进，稳步发展。" },
    "110110": { name: "风雷益（益卦）", text: "利用为大作，元吉，无咎。此卦象征受益增益，利于有所作为。" },
    "110111": { name: "风地观（观卦）", text: "盥而不荐，有孚颙若。此卦象征观察瞻望，需心怀诚信。" },
    "111000": { name: "水天需（需卦）", text: "有孚光亨，贞吉。利涉大川，利贞。此卦象征等待时机，需耐心待时。" },
    "111001": { name: "水泽节（节卦）", text: "亨。苦节不可贞。此卦象征节制适度，过度则凶。" },
    "111010": { name: "水雷屯（屯卦）", text: "磐桓，利居贞，利建侯。此卦象征事物萌芽，需谨慎应对，遇事不可急躁。" },
    "111011": { name: "水地比（比卦）", text: "吉。原筮元永贞，无咎。不宁方来，后夫凶。此卦象征相亲相辅，团结互助。" },
    "111100": { name: "地水师（师卦）", text: "贞丈人吉，无咎。此卦象征统率众人，用兵之道。" },
    "111101": { name: "地火明夷（明夷卦）", text: "利艰贞。此卦象征光明受损，韬光养晦之时。" },
    "111110": { name: "地天泰（泰卦）", text: "小往大来，吉亨。此卦象征阴阳交泰，上下互通，万事吉祥。" },
    "111111": { name: "乾为天（乾卦）", text: "天行健，君子以自强不息。此卦象征始创之力，凡事宜积极进取。" }
  };

  function getHexagramFromTime(year, month, day, hour) {
    const upperIndex = (year + month + day) % 8;
    const lowerIndex = (month + day + hour) % 8;

    const fullBinary = trigrams[lowerIndex].bin + trigrams[upperIndex].bin;
    const movingLine = ((year + month + day + hour) % 6) + 1;

    return {
      binary: fullBinary,
      upper: trigrams[upperIndex].name,
      lower: trigrams[lowerIndex].name,
      movingLine
    };
  }

  function drawHexagram() {
    const year = parseInt(document.getElementById('year').value) || new Date().getFullYear();
    const month = parseInt(document.getElementById('month').value) || new Date().getMonth() + 1;
    const day = parseInt(document.getElementById('day').value) || new Date().getDate();
    const hour = parseInt(document.getElementById('hour').value);

    const { binary, upper, lower, movingLine } = getHexagramFromTime(year, month, day, hour);

    const hexagramDiv = document.getElementById('hexagram');
    hexagramDiv.innerHTML = '';

    const bits = binary.split('');
    bits.forEach((bit, idx) => {
      const div = document.createElement('div');
      div.className = 'line ' + (bit === '1' ? 'yang' : 'yin');
      div.style.animation = `fadeInUp 0.5s ease forwards ${idx * 0.3}s`;
      hexagramDiv.appendChild(div);
    });

    setTimeout(() => {
      const info = hexagrams[binary] || {
        name: "未知卦象",
        text: "此卦未收录，解释待补充。"
      };

      let changedBin = '';
      for (let i = 0; i < binary.length; i++) {
        if (i === 5 - (movingLine - 1)) {
          changedBin += binary[i] === '1' ? '0' : '1';
        } else {
          changedBin += binary[i];
        }
      }

      const changedInfo = hexagrams[changedBin] || {
        name: "未知卦象",
        text: "此卦未收录，解释待补充。"
      };

      document.getElementById('result').innerHTML = `
        <h2>${info.name}</h2>
        <p><strong>上下卦：</strong>下卦为${lower}，上卦为${upper}。</p>
        <p><strong>动爻：</strong>第${movingLine}爻变动。</p>
        <p>${info.text}</p>
        <hr>
        <h2>变卦：${changedInfo.name}</h2>
        <p>${changedInfo.text}</p>
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
      text: "此卦未收录，解释待补充。"
    };

    document.getElementById('annualHexagram').innerHTML = `
      <div class="card">
        <h3>流年卦象：${info.name}</h3>
        <p>${info.text}</p>
      </div>
    `;
  }

  document.getElementById('drawBtn').addEventListener('click', drawHexagram);
  drawAnnualHexagram(); // 自动加载流年卦盘
  // 获取当前时间并设置默认值
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
