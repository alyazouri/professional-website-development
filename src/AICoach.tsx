import { useState } from "react";
import { useLang } from "./LanguageContext";
import type { Sens } from "./sensitivity";
import type { SensParams } from "./sensitivity";

type Message = {
  role: "user" | "coach";
  text: string;
  type: "info" | "warning" | "success" | "tip";
  icon: string;
};

type Analysis = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  trainingRoutine: string[];
};

export function AICoach({ sens, params }: { sens: Sens; params: SensParams }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [messages, setMessages] = useState<Message[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [showCoach, setShowCoach] = useState(false);

  const translations = {
    ar: {
      title: "المدرب الذكي AI",
      subtitle: "تحليل ذكي لأداءك وتوصيات مخصصة",
      startAnalysis: "ابدأ التحليل",
      analyzing: "جارٍ التحليل...",
      overallScore: "النتيجة الإجمالية",
      strengths: "نقاط القوة",
      weaknesses: "نقاط الضعف",
      recommendations: "التوصيات",
      training: "روتين التدريب",
      close: "إغلاق",
      chat: "محادثة المدرب",
      welcome: "مرحباً! أنا مدربك الذكي. اضغط 'ابدأ التحليل' للحصول على توصيات مخصصة.",
      support: "تحتاج مساعدة إضافية؟",
      email: "تواصل معنا",
      emailDesc: "إذا لم تجد الحل، راسلنا على:",
      tips: {
        highFps: "✅ جهازك يدعم FPS عالي - ممتاز للأداء",
        lowFps: "⚠️ FPS منخفض - قلل الرسوميات للحصول على أداء أفضل",
        highTouch: "✅ معدل لمس عالي - دقة ممتازة",
        lowTouch: "⚠️ معدل لمس منخفض - قد يؤثر على الدقة",
        goodGyro: "✅ جودة جايرو ممتازة - استخدمه للتحكم الدقيق",
        poorGyro: "⚠️ جودة جايرو ضعيفة - ركز على التحكم باللمس",
        fourFingers: "✅ 4 أصابع - إعداد مثالي للتحكم",
        fiveSixFingers: "🌟 5-6 أصابع - مستوى محترف!",
        twoThreeFingers: "💪 2-3 أصابع - جيد للمبتدئين، جرب 4 أصابع",
        aggressiveStyle: "⚡ أسلوب عدواني - ركز على CQC و SMG",
        balancedStyle: "⚖️ أسلوب متوازن - ممتاز للمباريات الطويلة",
        headshotStyle: "🎯 أسلوب رأس - دقة عالية، تمرن على التصويب",
        sprayStyle: "💧 أسلوب رش - تحكم ممتاز بالارتداد",
        highRecoilWeapon: "⚠️ سلاح بارتداد عالي - تمرن على التحكم",
        lowRecoilWeapon: "✅ سلاح بارتداد منخفض - سهل التحكم",
        sniperWeapon: "🎯 سلاح قناص - تمرن على التصويب الدقيق",
        gyroAlways: "🔄 جايرو دائم - ممتاز للتتبع",
        gyroScope: "🎯 جايرو سكوب - جيد للبداية",
        gyroOff: "⭕ جايرو معطل - جرب تفعيله للدقة",
      },
    },
    en: {
      title: "AI Coach",
      subtitle: "Smart analysis of your performance & personalized recommendations",
      startAnalysis: "Start Analysis",
      analyzing: "Analyzing...",
      overallScore: "Overall Score",
      strengths: "Strengths",
      weaknesses: "Weaknesses",
      recommendations: "Recommendations",
      training: "Training Routine",
      close: "Close",
      chat: "Coach Chat",
      welcome: "Hi! I'm your AI coach. Click 'Start Analysis' to get personalized recommendations.",
      support: "Need more help?",
      email: "Contact Us",
      emailDesc: "If you can't find a solution, email us at:",
      tips: {
        highFps: "✅ Your device supports high FPS - excellent for performance",
        lowFps: "⚠️ Low FPS - reduce graphics for better performance",
        highTouch: "✅ High touch rate - excellent precision",
        lowTouch: "⚠️ Low touch rate - may affect precision",
        goodGyro: "✅ Excellent gyro quality - use it for precise control",
        poorGyro: "⚠️ Poor gyro quality - focus on touch control",
        fourFingers: "✅ 4 fingers - perfect setup for control",
        fiveSixFingers: "🌟 5-6 fingers - pro level!",
        twoThreeFingers: "💪 2-3 fingers - good for beginners, try 4 fingers",
        aggressiveStyle: "⚡ Aggressive style - focus on CQC and SMG",
        balancedStyle: "⚖️ Balanced style - excellent for long matches",
        headshotStyle: "🎯 Headshot style - high precision, practice aiming",
        sprayStyle: "💧 Spray style - excellent recoil control",
        highRecoilWeapon: "⚠️ High recoil weapon - practice control",
        lowRecoilWeapon: "✅ Low recoil weapon - easy to control",
        sniperWeapon: "🎯 Sniper weapon - practice precise aiming",
        gyroAlways: "🔄 Always-on gyro - excellent for tracking",
        gyroScope: "🎯 Scope gyro - good starting point",
        gyroOff: "⭕ Gyro disabled - try enabling it for precision",
      },
    },
    tr: {
      title: "AI Koç",
      subtitle: "Performansınızın akıllı analizi ve kişiselleştirilmiş öneriler",
      startAnalysis: "Analizi Başlat",
      analyzing: "Analiz ediliyor...",
      overallScore: "Genel Skor",
      strengths: "Güçlü Yönler",
      weaknesses: "Zayıf Yönler",
      recommendations: "Öneriler",
      training: "Antrenman Rutini",
      close: "Kapat",
      chat: "Koç Sohbeti",
      welcome: "Merhaba! Ben AI koçunuz. Kişiselleştirilmiş öneriler almak için 'Analizi Başlat'a tıklayın.",
      support: "Daha fazla yardıma mı ihtiyacınız var?",
      email: "Bize Ulaşın",
      emailDesc: "Çözüm bulamazsanız, bize e-posta gönderin:",
      tips: {
        highFps: "✅ Cihazınız yüksek FPS destekliyor - performans için mükemmel",
        lowFps: "⚠️ Düşük FPS - daha iyi performans için grafikleri azaltın",
        highTouch: "✅ Yüksek dokunma hızı - mükemmel hassasiyet",
        lowTouch: "⚠️ Düşük dokunma hızı - hassasiyeti etkileyebilir",
        goodGyro: "✅ Mükemmel gyro kalitesi - hassas kontrol için kullanın",
        poorGyro: "⚠️ Düşük gyro kalitesi - dokunmatik kontrole odaklanın",
        fourFingers: "✅ 4 parmak - kontrol için mükemmel düzen",
        fiveSixFingers: "🌟 5-6 parmak - profesyonel seviye!",
        twoThreeFingers: "💪 2-3 parmak - yeni başlayanlar için iyi, 4 parmak deneyin",
        aggressiveStyle: "⚡ Agresif stil - CQC ve SMG'ye odaklanın",
        balancedStyle: "⚖️ Dengeli stil - uzun maçlar için mükemmel",
        headshotStyle: "🎯 Kafa vuruşu stili - yüksek hassasiyet, nişan prac",
        sprayStyle: "💧 Sprey stili - mükemmel geri tepme kontrolü",
        highRecoilWeapon: "⚠️ Yüksek geri tepme silahı - kontrol prac",
        lowRecoilWeapon: "✅ Düşük geri tepme silahı - kontrolü kolay",
        sniperWeapon: "🎯 Keskin nişancı silahı - hassas nişan prac",
        gyroAlways: "🔄 Her zaman açık gyro - takip için mükemmel",
        gyroScope: "🎯 Dürbün gyro - iyi başlangıç noktası",
        gyroOff: "⭕ Gyro kapalı - hassasiyet için açmayı deneyin",
      },
    },
    ru: {
      title: "AI Тренер",
      subtitle: "Умный анализ вашей производительности и персональные рекомендации",
      startAnalysis: "Начать анализ",
      analyzing: "Анализ...",
      overallScore: "Общий балл",
      strengths: "Сильные стороны",
      weaknesses: "Слабые стороны",
      recommendations: "Рекомендации",
      training: "Режим тренировки",
      close: "Закрыть",
      chat: "Чат с тренером",
      welcome: "Привет! Я ваш AI тренер. Нажмите 'Начать анализ' для персональных рекомендаций.",
      support: "Нужна дополнительная помощь?",
      email: "Свяжитесь с нами",
      emailDesc: "Если не нашли решение, напишите нам:",
      tips: {
        highFps: "✅ Ваше устройство поддерживает высокий FPS - отлично для производительности",
        lowFps: "⚠️ Низкий FPS - уменьшите графику для лучшей производительности",
        highTouch: "✅ Высокая частота касания - отличная точность",
        lowTouch: "⚠️ Низкая частота касания - может повлиять на точность",
        goodGyro: "✅ Отличное качество гироскопа - используйте для точного контроля",
        poorGyro: "⚠️ Плохое качество гироскопа - сосредоточьтесь на сенсорном управлении",
        fourFingers: "✅ 4 пальца - идеальная настройка для контроля",
        fiveSixFingers: "🌟 5-6 пальцев - профессиональный уровень!",
        twoThreeFingers: "💪 2-3 пальца - хорошо для новичков, попробуйте 4 пальца",
        aggressiveStyle: "⚡ Агрессивный стиль - сосредоточьтесь на CQC и SMG",
        balancedStyle: "⚖️ Сбалансированный стиль - отлично для долгих матчей",
        headshotStyle: "🎯 Стиль хедшота - высокая точность, тренируйте прицеливание",
        sprayStyle: "💧 Стиль спрея - отличный контроль отдачи",
        highRecoilWeapon: "⚠️ Оружие с высокой отдачей - тренируйте контроль",
        lowRecoilWeapon: "✅ Оружие с низкой отдачей - легко контролировать",
        sniperWeapon: "🎯 Снайперское оружие - тренируйте точное прицеливание",
        gyroAlways: "🔄 Гироскоп всегда включен - отлично для отслеживания",
        gyroScope: "🎯 Гироскоп прицела - хорошая начальная точка",
        gyroOff: "⭕ Гироскоп выключен - попробуйте включить для точности",
      },
    },
    es: {
      title: "Entrenador AI",
      subtitle: "Análisis inteligente de tu rendimiento y recomendaciones personalizadas",
      startAnalysis: "Iniciar Análisis",
      analyzing: "Analizando...",
      overallScore: "Puntuación General",
      strengths: "Fortalezas",
      weaknesses: "Debilidades",
      recommendations: "Recomendaciones",
      training: "Rutina de Entrenamiento",
      close: "Cerrar",
      chat: "Chat del Entrenador",
      welcome: "¡Hola! Soy tu entrenador AI. Haz clic en 'Iniciar Análisis' para obtener recomendaciones personalizadas.",
      support: "¿Necesitas más ayuda?",
      email: "Contáctanos",
      emailDesc: "Si no encuentras solución, envíanos un email:",
      tips: {
        highFps: "✅ Tu dispositivo soporta alto FPS - excelente para rendimiento",
        lowFps: "⚠️ Bajo FPS - reduce gráficos para mejor rendimiento",
        highTouch: "✅ Alta tasa de toque - excelente precisión",
        lowTouch: "⚠️ Baja tasa de toque - puede afectar precisión",
        goodGyro: "✅ Excelente calidad de giro - úsalo para control preciso",
        poorGyro: "⚠️ Mala calidad de giro - enfócate en control táctil",
        fourFingers: "✅ 4 dedos - configuración perfecta para control",
        fiveSixFingers: "🌟 5-6 dedos - nivel profesional!",
        twoThreeFingers: "💪 2-3 dedos - bueno para principiantes, prueba 4 dedos",
        aggressiveStyle: "⚡ Estilo agresivo - enfócate en CQC y SMG",
        balancedStyle: "⚖️ Estilo equilibrado - excelente para partidas largas",
        headshotStyle: "🎯 Estilo headshot - alta precisión, practica puntería",
        sprayStyle: "💧 Estilo spray - excelente control de retroceso",
        highRecoilWeapon: "⚠️ Arma con alto retroceso - practica control",
        lowRecoilWeapon: "✅ Arma con bajo retroceso - fácil de controlar",
        sniperWeapon: "🎯 Arma de francotirador - practica puntería precisa",
        gyroAlways: "🔄 Giro siempre activo - excelente para seguimiento",
        gyroScope: "🎯 Giro de mira - buen punto de partida",
        gyroOff: "⭕ Giro desactivado - prueba activarlo para precisión",
      },
    },
  };

  const t = translations[lang];

  const analyzePerformance = () => {
    setAnalyzing(true);
    setMessages([{ role: "coach", text: t.welcome, type: "info", icon: "🤖" }]);

    setTimeout(() => {
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      const recommendations: string[] = [];
      const trainingRoutine: string[] = [];

      // Analyze FPS
      if (params.device.fps >= 90) {
        strengths.push(t.tips.highFps);
      } else {
        weaknesses.push(t.tips.lowFps);
        recommendations.push(isAr ? "قلل إعدادات الرسوميات للحصول على FPS أعلى" : "Reduce graphics settings for higher FPS");
      }

      // Analyze Touch Rate
      if (params.device.touchRate >= 240) {
        strengths.push(t.tips.highTouch);
      } else {
        weaknesses.push(t.tips.lowTouch);
      }

      // Analyze Gyro
      if (params.device.gyroQuality === "excellent") {
        strengths.push(t.tips.goodGyro);
        if (params.gyroMode === "always") {
          strengths.push(t.tips.gyroAlways);
        } else if (params.gyroMode === "scope") {
          recommendations.push(t.tips.gyroScope);
        }
      } else {
        weaknesses.push(t.tips.poorGyro);
      }

      if (params.gyroMode === "off") {
        recommendations.push(t.tips.gyroOff);
      }

      // Analyze Fingers
      if (params.fingers >= 5) {
        strengths.push(t.tips.fiveSixFingers);
      } else if (params.fingers === 4) {
        strengths.push(t.tips.fourFingers);
      } else {
        recommendations.push(t.tips.twoThreeFingers);
      }

      // Analyze Style
      if (params.styleId === "aggressive") {
        recommendations.push(t.tips.aggressiveStyle);
        trainingRoutine.push(isAr ? "5 دقائق TDM سريع" : "5 min fast TDM");
        trainingRoutine.push(isAr ? "تدريب CQC لمدة 10 دقائق" : "10 min CQC drill");
      } else if (params.styleId === "balanced") {
        strengths.push(t.tips.balancedStyle);
        trainingRoutine.push(isAr ? "تدريب متوازن 15 دقيقة" : "15 min balanced training");
        trainingRoutine.push(isAr ? "مباراة ترتيب واحدة" : "1 ranked match");
      } else if (params.styleId === "headshot") {
        recommendations.push(t.tips.headshotStyle);
        trainingRoutine.push(isAr ? "تدريب رأس 20 دقيقة" : "20 min headshot drill");
        trainingRoutine.push(isAr ? "تدريب تتبع رأس 6x" : "6x head tracking drill");
      } else if (params.styleId === "spray") {
        strengths.push(t.tips.sprayStyle);
        trainingRoutine.push(isAr ? "تدريب رش 4x لمدة 10 دقائق" : "10 min 4x spray drill");
        trainingRoutine.push(isAr ? "تدريب تحكم الارتداد" : "Recoil control drill");
      }

      // Analyze Weapon
      if (params.weaponRecoil >= 70) {
        weaknesses.push(t.tips.highRecoilWeapon);
        trainingRoutine.push(isAr ? "تدريب تحكم الارتداد 15 دقيقة" : "15 min recoil control drill");
      } else if (params.weaponRecoil <= 40) {
        strengths.push(t.tips.lowRecoilWeapon);
      }

      if (params.weaponType === "sniper") {
        recommendations.push(t.tips.sniperWeapon);
        trainingRoutine.push(isAr ? "تدريب تصويب 8x لمدة 10 دقائق" : "10 min 8x aiming drill");
      }

      // Calculate overall score
      const score = Math.min(100, sens.aiScore + (strengths.length * 3) - (weaknesses.length * 2));

      const newAnalysis: Analysis = {
        score,
        strengths,
        weaknesses,
        recommendations,
        trainingRoutine,
      };

      setAnalysis(newAnalysis);
      setAnalyzing(false);

      // Add analysis messages
      const newMessages: Message[] = [
        ...messages,
        { role: "coach", text: `${t.overallScore}: ${score}/100`, type: "success", icon: "📊" },
      ];

      if (strengths.length > 0) {
        newMessages.push({ role: "coach", text: `${t.strengths}:`, type: "success", icon: "✅" });
        strengths.forEach((s) => {
          newMessages.push({ role: "coach", text: s, type: "info", icon: "•" });
        });
      }

      if (weaknesses.length > 0) {
        newMessages.push({ role: "coach", text: `${t.weaknesses}:`, type: "warning", icon: "⚠️" });
        weaknesses.forEach((w) => {
          newMessages.push({ role: "coach", text: w, type: "warning", icon: "•" });
        });
      }

      if (recommendations.length > 0) {
        newMessages.push({ role: "coach", text: `${t.recommendations}:`, type: "tip", icon: "💡" });
        recommendations.forEach((r) => {
          newMessages.push({ role: "coach", text: r, type: "tip", icon: "→" });
        });
      }

      if (trainingRoutine.length > 0) {
        newMessages.push({ role: "coach", text: `${t.training}:`, type: "info", icon: "🏋️" });
        trainingRoutine.forEach((tr) => {
          newMessages.push({ role: "coach", text: tr, type: "info", icon: "✓" });
        });
      }

      newMessages.push({
        role: "coach",
        text: `${t.support}\n${t.emailDesc}\n📧 saeedjor11@gmail.com`,
        type: "info",
        icon: "📧",
      });

      setMessages(newMessages);
    }, 1500);
  };

  return (
    <div className="card neon-box rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-display text-lg font-bold text-white">{t.title}</h3>
            <p className="text-xs text-white/50">{t.subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCoach(!showCoach)}
          className="btn-primary rounded-lg px-4 py-2 text-xs"
        >
          {showCoach ? t.close : t.chat}
        </button>
      </div>

      {showCoach && (
        <div className="space-y-3">
          {!analysis && (
            <button
              onClick={analyzePerformance}
              disabled={analyzing}
              className="btn-primary w-full rounded-xl px-5 py-3 text-sm disabled:opacity-50"
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  {t.analyzing}
                </span>
              ) : (
                t.startAnalysis
              )}
            </button>
          )}

          {analysis && (
            <>
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-emerald-300">
                  {t.overallScore}
                </div>
                <div className="font-display text-4xl font-black text-emerald-300 tabular-nums">
                  {analysis.score}/100
                </div>
              </div>

              {analysis.strengths.length > 0 && (
                <div className="rounded-xl border border-emerald-400/10 bg-emerald-500/5 p-3">
                  <div className="mb-2 text-xs font-bold text-emerald-300">✅ {t.strengths}</div>
                  <div className="space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <div key={i} className="text-xs text-white/70">{s}</div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.weaknesses.length > 0 && (
                <div className="rounded-xl border border-amber-400/10 bg-amber-500/5 p-3">
                  <div className="mb-2 text-xs font-bold text-amber-300">⚠️ {t.weaknesses}</div>
                  <div className="space-y-1">
                    {analysis.weaknesses.map((w, i) => (
                      <div key={i} className="text-xs text-white/70">{w}</div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.recommendations.length > 0 && (
                <div className="rounded-xl border border-sky-400/10 bg-sky-500/5 p-3">
                  <div className="mb-2 text-xs font-bold text-sky-300">💡 {t.recommendations}</div>
                  <div className="space-y-1">
                    {analysis.recommendations.map((r, i) => (
                      <div key={i} className="text-xs text-white/70">{r}</div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.trainingRoutine.length > 0 && (
                <div className="rounded-xl border border-purple-400/10 bg-purple-500/5 p-3">
                  <div className="mb-2 text-xs font-bold text-purple-300">🏋️ {t.training}</div>
                  <div className="space-y-1">
                    {analysis.trainingRoutine.map((tr, i) => (
                      <div key={i} className="text-xs text-white/70">✓ {tr}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-orange-400/20 bg-orange-500/5 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📧</span>
                  <div>
                    <div className="text-xs font-bold text-white">{t.support}</div>
                    <div className="text-[10px] text-white/60">{t.emailDesc}</div>
                    <a
                      href="mailto:saeedjor11@gmail.com"
                      className="mt-1 inline-block font-display text-sm font-bold text-orange-300 hover:text-orange-200"
                    >
                      saeedjor11@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
