import React, { useMemo, useState } from "react";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const initialPlayer = {
  day: 1,
  money: 300,
  rank: "ヒョロ期",
  muscle: 8,
  power: 8,
  stamina: 8,
  mental: 12,
  bodyFat: 18,
  fatigue: 10,
  nutrition: 45,
  fistPower: 5,
  fistSpeed: 5,
  core: 5,
  stomach: 8,
  eatingSpeed: 7,
  digestion: 8,
  titles: [],
  log: ["ガチマッチョ育成、開始！まずは無理せず鍛えよう。"],
};

const statLabels = {
  muscle: "筋肉量",
  power: "パワー",
  stamina: "持久力",
  mental: "メンタル",
  bodyFat: "体脂肪率",
  fatigue: "疲労度",
  nutrition: "栄養状態",
  fistPower: "拳力",
  fistSpeed: "拳速",
  core: "体幹力",
  stomach: "胃袋容量",
  eatingSpeed: "食速",
  digestion: "消化力",
};

const trainingMenus = [
  {
    name: "ベンチプレス",
    icon: "🏋️",
    cost: 20,
    effect: { muscle: 4, power: 5, fatigue: 14, nutrition: -8 },
    text: "胸板とパワーを鍛える王道メニュー。",
  },
  {
    name: "スクワット",
    icon: "🦵",
    cost: 20,
    effect: { muscle: 3, power: 4, stamina: 3, core: 2, fatigue: 16, nutrition: -10 },
    text: "脚と体幹を鍛える。パンチの踏み込みにも効く。",
  },
  {
    name: "サンドバッグ打ち",
    icon: "🥊",
    cost: 25,
    effect: { fistPower: 5, fistSpeed: 3, power: 2, fatigue: 15, nutrition: -8 },
    text: "拳力と拳速を鍛えるパンチ大会向けメニュー。",
  },
  {
    name: "体幹トレーニング",
    icon: "🔥",
    cost: 15,
    effect: { core: 5, stamina: 2, fatigue: 10, nutrition: -5 },
    text: "ブレない身体を作る。全大会にじわっと効く。",
  },
  {
    name: "食事トレーニング",
    icon: "🍚",
    cost: 20,
    effect: { stomach: 5, eatingSpeed: 3, digestion: 2, bodyFat: 2, fatigue: 8, nutrition: -4 },
    text: "胃袋容量と食速を鍛える早食い大会向けメニュー。",
  },
];

const meals = [
  {
    name: "鶏むね定食",
    icon: "🍗",
    cost: 35,
    effect: { nutrition: 24, muscle: 2, bodyFat: -1 },
    text: "高たんぱくで筋肉成長を後押し。",
  },
  {
    name: "牛肉メガ盛り丼",
    icon: "🥩",
    cost: 55,
    effect: { nutrition: 35, power: 3, stomach: 2, bodyFat: 3 },
    text: "パワーと胃袋は伸びるが、体脂肪も増えやすい。",
  },
  {
    name: "プロテイン",
    icon: "🥤",
    cost: 25,
    effect: { nutrition: 16, muscle: 1, fatigue: -3 },
    text: "手軽に栄養補給。財布にも筋肉にも優しめ。",
  },
  {
    name: "激辛カレー",
    icon: "🍛",
    cost: 40,
    effect: { nutrition: 22, mental: 4, digestion: 2, bodyFat: 1, fatigue: 5 },
    text: "メンタルと消化力を鍛える。ちょっと危険な香り。",
  },
];

const restMenus = [
  {
    name: "しっかり睡眠",
    icon: "😴",
    cost: 0,
    effect: { fatigue: -28, mental: 5, nutrition: -4 },
    text: "筋肉にも有給休暇が必要。",
  },
  {
    name: "温泉回復",
    icon: "♨️",
    cost: 45,
    effect: { fatigue: -40, mental: 10, digestion: 2 },
    text: "疲労とメンタルを大きく回復。贅沢は筋肉を救う。",
  },
  {
    name: "軽い散歩",
    icon: "🚶",
    cost: 0,
    effect: { fatigue: -12, stamina: 1, bodyFat: -1, digestion: 2 },
    text: "コンディション調整に便利。地味に強い。",
  },
];

const rankRules = [
  { name: "神域マッチョ期", min: 170 },
  { name: "レジェンドマッチョ期", min: 135 },
  { name: "ガチマッチョ期", min: 105 },
  { name: "バルクアップ期", min: 75 },
  { name: "細マッチョ期", min: 50 },
  { name: "初心者トレーニー期", min: 30 },
  { name: "ヒョロ期", min: 0 },
];

function applyEffect(player, effect) {
  const next = { ...player };
  Object.entries(effect).forEach(([key, value]) => {
    next[key] = (next[key] ?? 0) + value;
  });

  for (const key of [
    "muscle",
    "power",
    "stamina",
    "mental",
    "fistPower",
    "fistSpeed",
    "core",
    "stomach",
    "eatingSpeed",
    "digestion",
  ]) {
    next[key] = clamp(next[key], 0, 220);
  }

  next.bodyFat = clamp(next.bodyFat, 5, 45);
  next.fatigue = clamp(next.fatigue, 0, 100);
  next.nutrition = clamp(next.nutrition, 0, 100);

  const total = next.muscle + next.power + next.stamina + next.fistPower + next.core + next.stomach;
  next.rank = rankRules.find((rule) => total >= rule.min)?.name ?? "ヒョロ期";
  return next;
}

function addLog(player, message) {
  return { ...player, log: [message, ...player.log].slice(0, 8) };
}

function nextDay(player) {
  let next = applyEffect(player, {
    fatigue: player.fatigue > 75 ? 4 : -2,
    nutrition: -5,
    mental: player.fatigue > 80 ? -3 : 1,
  });
  next.day += 1;

  if (next.nutrition < 15) {
    next = applyEffect(next, { muscle: -2, power: -1, mental: -1 });
    next = addLog(next, "栄養不足で筋肉がしぼんだ……食わせよう。");
  }

  if (next.fatigue > 90) {
    next = applyEffect(next, { power: -2, fistPower: -2, stamina: -2, mental: -3 });
    next = addLog(next, "疲労が限界！筋肉が『今日は寝ろ』と言っている。");
  }

  return next;
}

function scoreBody(player) {
  const fatBonus = Math.max(0, 30 - Math.abs(player.bodyFat - 12) * 2);
  return Math.round(player.muscle * 1.4 + player.core * 0.6 + player.mental * 0.4 + fatBonus - player.fatigue * 0.7);
}

function scorePunch(player) {
  return Math.round(
    player.fistPower * 1.25 +
      player.power * 0.8 +
      player.core * 0.7 +
      player.fistSpeed * 0.6 +
      player.mental * 0.4 -
      player.fatigue * 0.75
  );
}

function scoreEating(player) {
  return Math.round(
    player.eatingSpeed * 1.15 +
      player.stomach * 1.05 +
      player.digestion * 0.8 +
      player.mental * 0.5 -
      player.fatigue * 0.45 -
      Math.max(0, player.bodyFat - 28) * 0.5
  );
}

const competitions = [
  {
    name: "ボディメイク大会",
    icon: "🏆",
    target: 95,
    reward: 150,
    score: scoreBody,
    winTitle: "地方ボディメイク王",
    description: "筋肉量・体脂肪率・体幹・メンタルで勝負。",
  },
  {
    name: "パンチ大会",
    icon: "🥊",
    target: 105,
    reward: 170,
    score: scorePunch,
    winTitle: "拳で語るマッチョ",
    description: "拳力・パワー・体幹・拳速で勝負。腕だけでは勝てない。",
  },
  {
    name: "早食い大会",
    icon: "🍚",
    target: 100,
    reward: 165,
    score: scoreEating,
    winTitle: "胃袋ブラックホール",
    description: "食速・胃袋容量・消化力・メンタルで勝負。",
  },
];

function ProgressBar({ label, value, max = 100 }) {
  const percent = clamp((value / max) * 100, 0, 100);
  return (
    <div>
      <div className="stat-label">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="bar">
        <div className="bar-inner" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function Mascot({ player }) {
  const size = clamp(90 + player.muscle * 0.55, 90, 190);
  const belly = clamp(player.bodyFat * 1.4, 16, 55);
  const arm = clamp(12 + player.power * 0.12, 12, 38);

  return (
    <div className="card mascot-card">
      <div className="mascot">
        <div className="head">筋</div>
        <div className="body-row">
          <div className="arm" style={{ width: arm, height: size * 0.65 }} />
          <div className="body" style={{ width: size * 0.72 + belly, height: size }}>
            <div className="abs">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="arm" style={{ width: arm, height: size * 0.65 }} />
        </div>
        <div className="legs">
          <div className="leg" />
          <div className="leg" />
        </div>
      </div>
      <div className="rank">
        <strong>{player.rank}</strong>
        <span>Day {player.day} / 所持金 {player.money}G</span>
      </div>
    </div>
  );
}

function ActionCard({ item, onClick, disabled }) {
  return (
    <div className="card action-card">
      <h3>
        <span>{item.icon}</span> {item.name}
      </h3>
      <p>{item.text}</p>
      <div className="effects">
        {Object.entries(item.effect).map(([key, value]) => (
          <span key={key}>
            {statLabels[key] ?? key}
            {value > 0 ? "+" : ""}
            {value} {" "}
          </span>
        ))}
      </div>
      <button className="btn primary" onClick={onClick} disabled={disabled}>
        {item.cost > 0 ? `${item.cost}Gで実行` : "実行"}
      </button>
    </div>
  );
}

export default function App() {
  const [player, setPlayer] = useState(initialPlayer);
  const [tab, setTab] = useState("train");
  const [lastResult, setLastResult] = useState(null);

  const conditionText = useMemo(() => {
    if (player.fatigue > 85) return "危険：今日は休ませたい。筋肉が労基に駆け込みそう。";
    if (player.nutrition < 20) return "栄養不足：食事を入れないと筋肉が育たない。";
    if (player.mental < 15) return "メンタル低下：温泉か睡眠で整えたい。";
    return "良好：今なら鍛えるか、大会に挑戦できる。";
  }, [player]);

  function performAction(item, type) {
    if (player.money < item.cost) return;
    let next = { ...player, money: player.money - item.cost };
    next = applyEffect(next, item.effect);
    const typeText = type === "train" ? "トレーニング" : type === "meal" ? "食事" : "休養";
    next = addLog(next, `${item.name}を実行。${typeText}の成果が出た！`);
    next = nextDay(next);
    setPlayer(next);
    setLastResult(null);
  }

  function enterCompetition(comp) {
    const baseScore = comp.score(player);
    const random = Math.floor(Math.random() * 31) - 10;
    const finalScore = baseScore + random;
    const win = finalScore >= comp.target;
    let next = { ...player };

    if (win) {
      next.money += comp.reward;
      next.mental = clamp(next.mental + 8, 0, 220);
      if (!next.titles.includes(comp.winTitle)) next.titles = [...next.titles, comp.winTitle];
      next = addLog(next, `${comp.name}で勝利！称号「${comp.winTitle}」を獲得。`);
    } else {
      next.mental = clamp(next.mental - 4, 0, 220);
      next = addLog(next, `${comp.name}は惜しくも敗北。筋肉会議で反省しよう。`);
    }

    next = applyEffect(next, { fatigue: 12, nutrition: -8 });
    next = nextDay(next);
    setPlayer(next);
    setLastResult({ name: comp.name, score: finalScore, target: comp.target, win, reward: win ? comp.reward : 0 });
  }

  const tabs = [
    { id: "train", label: "鍛える", icon: "🏋️" },
    { id: "meal", label: "食べる", icon: "🍗" },
    { id: "rest", label: "休む", icon: "😴" },
    { id: "battle", label: "大会", icon: "🏆" },
  ];

  const items = tab === "train" ? trainingMenus : tab === "meal" ? meals : restMenus;

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div>
            <span className="badge">育成シミュレーション・プロトタイプ</span>
            <h1>育てろ！ガチマッチョくん</h1>
            <p className="subtitle">鍛えろ、食わせろ、休ませろ。拳と胃袋で世界を取れ。</p>
          </div>
          <button className="btn" onClick={() => { setPlayer(initialPlayer); setLastResult(null); setTab("train"); }}>
            ↻ 最初から
          </button>
        </header>

        <main className="grid">
          <section className="side">
            <Mascot player={player} />

            <div className="card">
              <h2>コンディション</h2>
              <p className="subtitle">{conditionText}</p>
              <div className="stats">
                <ProgressBar label="筋肉量" value={player.muscle} max={180} />
                <ProgressBar label="パワー" value={player.power} max={180} />
                <ProgressBar label="持久力" value={player.stamina} max={180} />
                <ProgressBar label="メンタル" value={player.mental} max={180} />
                <ProgressBar label="拳力" value={player.fistPower} max={180} />
                <ProgressBar label="拳速" value={player.fistSpeed} max={180} />
                <ProgressBar label="体幹力" value={player.core} max={180} />
                <ProgressBar label="胃袋容量" value={player.stomach} max={180} />
                <ProgressBar label="食速" value={player.eatingSpeed} max={180} />
                <ProgressBar label="消化力" value={player.digestion} max={180} />
                <ProgressBar label="栄養状態" value={player.nutrition} max={100} />
                <ProgressBar label="疲労度" value={player.fatigue} max={100} />
              </div>
            </div>

            <div className="card">
              <h2>称号</h2>
              {player.titles.length === 0 ? (
                <p className="subtitle">まだ称号なし。大会で筋肉の名を刻もう。</p>
              ) : (
                <div className="title-list">
                  {player.titles.map((title) => <span key={title}>{title}</span>)}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="tabs">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  className={`btn ${tab === t.id ? "active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {lastResult && (
              <div className="card result">
                <span className="subtitle">大会結果</span>
                <strong>{lastResult.name}：{lastResult.win ? "勝利！" : "敗北……"}</strong>
                <p>
                  スコア {lastResult.score} / 目標 {lastResult.target}
                  {lastResult.reward > 0 && `　報酬 ${lastResult.reward}G`}
                </p>
              </div>
            )}

            {tab === "battle" ? (
              <div className="action-grid">
                {competitions.map((comp) => {
                  const predicted = comp.score(player);
                  return (
                    <div className="card action-card" key={comp.name}>
                      <h3>{comp.icon} {comp.name}</h3>
                      <p>{comp.description}</p>
                      <div className="effects">
                        予想スコア {predicted} / 勝利目標 {comp.target}<br />
                        勝利報酬 {comp.reward}G
                      </div>
                      <button className="btn primary" onClick={() => enterCompetition(comp)}>出場する</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="action-grid">
                {items.map((item) => (
                  <ActionCard
                    key={item.name}
                    item={item}
                    onClick={() => performAction(item, tab)}
                    disabled={player.money < item.cost}
                  />
                ))}
              </div>
            )}

            <div className="card" style={{ marginTop: 16 }}>
              <h2>育成ログ</h2>
              <div className="log">
                {player.log.map((line, index) => (
                  <div key={`${line}-${index}`}>{line}</div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
