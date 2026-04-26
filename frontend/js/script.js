const API_BASE = "/api";

const storage = window.sessionStorage;
const legacyStorage = window.localStorage;

const getStoredValue = (key) => storage.getItem(key) || "";

const clearLegacyAuth = (role) => {
  if (role === "admin") {
    legacyStorage.removeItem("sfds_admin_token");
    legacyStorage.removeItem("sfds_admin");
    return;
  }

  legacyStorage.removeItem("sfds_user_token");
  legacyStorage.removeItem("sfds_user");
};

const clearStoredAuth = (role) => {
  if (role === "admin") {
    storage.removeItem("sfds_admin_token");
    storage.removeItem("sfds_admin");
    clearLegacyAuth("admin");
    appState.adminToken = "";
    return;
  }

  storage.removeItem("sfds_user_token");
  storage.removeItem("sfds_user");
  clearLegacyAuth("user");
  appState.userToken = "";
};

const appState = {
  userToken: getStoredValue("sfds_user_token"),
  adminToken: getStoredValue("sfds_admin_token")
};

const page = document.body.dataset.page;

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

const BRAND_LOGO_PATH = "/assets/icons/brand-logo.png";
const FAVICON_PATH = "/assets/icons/site-favicon.png";

const setMessage = (selector, message, type = "error") => {
  const element = qs(selector);
  if (!element) return;
  element.textContent = message;
  element.className = `message ${type}`;
};

const apiFetch = async (url, options = {}, role = "user") => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = role === "admin" ? appState.adminToken : appState.userToken;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const saveUserSession = (payload) => {
  storage.setItem("sfds_user_token", payload.token);
  storage.setItem("sfds_user", JSON.stringify(payload.user));
  legacyStorage.removeItem("sfds_user_token");
  legacyStorage.removeItem("sfds_user");
  appState.userToken = payload.token;
};

const saveAdminSession = (payload) => {
  storage.setItem("sfds_admin_token", payload.token);
  storage.setItem("sfds_admin", JSON.stringify(payload.admin));
  legacyStorage.removeItem("sfds_admin_token");
  legacyStorage.removeItem("sfds_admin");
  appState.adminToken = payload.token;
};

const logout = (role) => {
  if (role === "admin") {
    clearStoredAuth("admin");
    window.location.href = "/admin/admin-login.html";
    return;
  }

  clearStoredAuth("user");
  window.location.href = "/login.html";
};

const ensureAuth = (role = "user") => {
  if (role === "admin" && !appState.adminToken) {
    window.location.href = "/admin/admin-login.html";
  }

  if (role === "user" && !appState.userToken) {
    window.location.href = "/login.html";
  }
};

const fillText = (selector, value) => {
  const element = qs(selector);
  if (element) {
    element.textContent = value;
  }
};

const renderList = (selector, items, renderer) => {
  const element = qs(selector);
  if (!element) return;
  element.innerHTML = items.length
    ? items.map(renderer).join("")
    : `<div class="list-item">No data available.</div>`;
};

const renderTableRows = (selector, rows) => {
  const element = qs(selector);
  if (!element) return;
  element.innerHTML = rows.length
    ? rows.join("")
    : `<tr><td colspan="8">No records found.</td></tr>`;
};

const formatLabel = (value = "") =>
  String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const WORKOUT_ADMIN_LIBRARY = {
  gym: {
    label: "Gym",
    image: "/assets/images/workout-category-gym.png",
    description: "Machine, dumbbell, barbell, and cardio-focused routines.",
    options: [
      { name: "Treadmill Sprint Intervals", detail: "Cardio fat-burn session" },
      { name: "Lat Pulldown", detail: "Upper-back strength" },
      { name: "Barbell Squats", detail: "Leg power and stability" },
      { name: "Dumbbell Bench Press", detail: "Chest and triceps focus" },
      { name: "Cable Rows", detail: "Posture and pulling strength" },
      { name: "Leg Press", detail: "Lower-body hypertrophy" }
    ]
  },
  yoga: {
    label: "Yoga",
    image: "/assets/images/workout-category-yoga.png",
    description: "Mobility, flexibility, balance, breathing, and recovery-focused practice.",
    options: [
      { name: "Sun Salutation Flow", detail: "Full-body mobility sequence" },
      { name: "Downward Facing Dog", detail: "Posterior chain stretch" },
      { name: "Warrior II", detail: "Leg strength and balance" },
      { name: "Triangle Pose", detail: "Hip and hamstring flexibility" },
      { name: "Boat Pose", detail: "Core stability and control" },
      { name: "Child's Pose", detail: "Recovery and gentle reset" }
    ]
  },
  calisthenics: {
    label: "Calisthenics",
    image: "/assets/images/workout-category-calisthenics.png",
    description: "Bodyweight movements for mobility, control, and endurance.",
    options: [
      { name: "Push-Ups", detail: "Foundational upper-body strength" },
      { name: "Pull-Ups", detail: "Back and grip development" },
      { name: "Pistol Squats", detail: "Single-leg control" },
      { name: "Bench Dips", detail: "Triceps endurance" },
      { name: "Hollow Body Hold", detail: "Core stability" },
      { name: "Burpees", detail: "Full-body conditioning" }
    ]
  }
};

const WORKOUT_CATEGORY_META = {
  gym: {
    image: "/assets/images/workout-category-gym.png"
  },
  yoga: {
    image: "/assets/images/workout-category-yoga.png"
  },
  calisthenics: {
    image: "/assets/images/workout-category-calisthenics.png"
  }
};

const DIET_SLOT_META = {
  breakfast: { label: "Breakfast", time: "7:00 AM to 9:00 AM" },
  lunch: { label: "Lunch", time: "12:30 PM to 2:30 PM" },
  dinner: { label: "Dinner", time: "7:00 PM to 9:00 PM" },
  snacks: { label: "Snacks", time: "4:00 PM to 6:00 PM" }
};

const DIET_CATEGORY_META = {
  pure_veg: {
    label: "Pure Veg",
    image: "/assets/images/diet-category-pure-veg.png",
    description: "High-variety vegetarian plates with fiber-rich carbs and protein-balanced sides.",
    cuisine: "indian",
    accent: "Garden-fresh"
  },
  mix_veg: {
    label: "Mix Veg",
    image: "/assets/images/diet-category-mix-veg.png",
    description: "Vegetarian-forward combinations with eggs and flexible protein add-ons.",
    cuisine: "maharashtrian",
    accent: "Flexible fuel"
  },
  non_veg: {
    label: "Non Veg",
    image: "/assets/images/diet-category-non-veg.png",
    description: "Lean chicken, fish, and egg-based meals built for higher-protein plans.",
    cuisine: "indian",
    accent: "Protein-first"
  }
};

const DIET_OPTION_BLUEPRINTS = {
  pure_veg: {
    breakfast: {
      mains: [
        "Moong chilla",
        "Vegetable poha",
        "Ragi dosa",
        "Paneer bhurji toast",
        "Overnight oats bowl",
        "Stuffed methi paratha",
        "Vegetable upma",
        "Besan cheela roll",
        "Millet idli plate",
        "Greek yogurt parfait"
      ],
      portions: [
        { label: "1 plate", calories: 210 },
        { label: "2 medium servings", calories: 280 },
        { label: "1 bowl", calories: 240 },
        { label: "1 power portion", calories: 320 }
      ],
      boosters: [
        { label: "with mint curd", calories: 45 },
        { label: "with chia seeds", calories: 55 },
        { label: "with sprouts topping", calories: 65 },
        { label: "with seasonal fruit", calories: 75 }
      ]
    },
    lunch: {
      mains: [
        "Rajma rice bowl",
        "Paneer tikka roti set",
        "Dal khichdi platter",
        "Soya chunk pulao",
        "Chole quinoa bowl",
        "Mixed veg curry thali",
        "Tofu stir-fry rice",
        "Palak paneer combo",
        "Curd rice protein bowl",
        "Millet roti dal meal"
      ],
      portions: [
        { label: "1 standard plate", calories: 340 },
        { label: "1 athlete plate", calories: 430 },
        { label: "2 rotis plus bowl", calories: 390 },
        { label: "1 large lunch bowl", calories: 470 }
      ],
      boosters: [
        { label: "with cucumber salad", calories: 35 },
        { label: "with roasted seeds", calories: 60 },
        { label: "with curd side", calories: 85 },
        { label: "with sauteed greens", calories: 70 }
      ]
    },
    dinner: {
      mains: [
        "Paneer stew dinner",
        "Vegetable soup and toast",
        "Dal roti comfort plate",
        "Quinoa khichdi bowl",
        "Tofu bhurji plate",
        "Veg stew with millet",
        "Palak corn curry set",
        "Lauki chana dal meal",
        "Mushroom pepper stir-fry",
        "Light paneer pulao"
      ],
      portions: [
        { label: "1 light plate", calories: 290 },
        { label: "1 balanced plate", calories: 360 },
        { label: "1 bowl plus 2 rotis", calories: 410 },
        { label: "1 recovery serving", calories: 440 }
      ],
      boosters: [
        { label: "with clear soup", calories: 40 },
        { label: "with probiotic curd", calories: 70 },
        { label: "with grilled vegetables", calories: 65 },
        { label: "with lentil side", calories: 90 }
      ]
    },
    snacks: {
      mains: [
        "Roasted makhana mix",
        "Fruit and nut bowl",
        "Protein lassi",
        "Corn chaat cup",
        "Peanut chikki bites",
        "Hummus veggie box",
        "Yogurt berry bowl",
        "Chana jor mix",
        "Trail mix pack",
        "Sprout salad cup"
      ],
      portions: [
        { label: "1 snack cup", calories: 120 },
        { label: "1 mini bowl", calories: 150 },
        { label: "1 hunger-control pack", calories: 180 },
        { label: "1 refuel serving", calories: 210 }
      ],
      boosters: [
        { label: "with flax sprinkle", calories: 30 },
        { label: "with coconut shards", calories: 45 },
        { label: "with banana slices", calories: 55 },
        { label: "with peanut dip", calories: 70 }
      ]
    }
  },
  mix_veg: {
    breakfast: {
      mains: [
        "Egg bhurji toast",
        "Masala omelette wrap",
        "Poha with boiled egg",
        "Protein oats with egg whites",
        "Vegetable uttapam combo",
        "Paneer egg scramble",
        "Millet sandwich stack",
        "Curd granola bowl",
        "Spinach egg dosa",
        "Sprout and egg bowl"
      ],
      portions: [
        { label: "1 plate", calories: 230 },
        { label: "2-piece meal", calories: 290 },
        { label: "1 bowl combo", calories: 260 },
        { label: "1 training portion", calories: 340 }
      ],
      boosters: [
        { label: "with avocado mash", calories: 70 },
        { label: "with fruit side", calories: 60 },
        { label: "with yogurt dip", calories: 50 },
        { label: "with seed topper", calories: 45 }
      ]
    },
    lunch: {
      mains: [
        "Egg curry rice bowl",
        "Paneer and egg wrap meal",
        "Vegetable pulao with egg",
        "Soya egg bhurji combo",
        "Power khichdi plate",
        "Mixed veg thali with egg",
        "Paneer quinoa power bowl",
        "Dal chawal plus egg whites",
        "Methi roti paneer set",
        "Curd rice egg pepper bowl"
      ],
      portions: [
        { label: "1 standard plate", calories: 360 },
        { label: "1 power lunch", calories: 440 },
        { label: "2 wraps", calories: 420 },
        { label: "1 large bowl", calories: 480 }
      ],
      boosters: [
        { label: "with salad crunch", calories: 35 },
        { label: "with buttermilk", calories: 55 },
        { label: "with stir-fry beans", calories: 75 },
        { label: "with extra egg whites", calories: 68 }
      ]
    },
    dinner: {
      mains: [
        "Egg white curry plate",
        "Paneer spinach dinner",
        "Veg soup and egg toast",
        "Light pulao protein set",
        "Tofu egg scramble bowl",
        "Methi paneer roti meal",
        "Vegetable stew and omelette",
        "Quinoa paneer dinner",
        "Masala egg millet bowl",
        "Lentil egg comfort plate"
      ],
      portions: [
        { label: "1 light plate", calories: 300 },
        { label: "1 balanced plate", calories: 370 },
        { label: "1 bowl plus sides", calories: 430 },
        { label: "1 muscle-repair serving", calories: 460 }
      ],
      boosters: [
        { label: "with sauteed peppers", calories: 45 },
        { label: "with Greek yogurt", calories: 80 },
        { label: "with soup side", calories: 50 },
        { label: "with herb salad", calories: 35 }
      ]
    },
    snacks: {
      mains: [
        "Boiled egg snack box",
        "Curd and seed cup",
        "Fruit yogurt shaker",
        "Mini paneer tikka cup",
        "Protein bhel bowl",
        "Roasted chana with egg",
        "Nut and yogurt pot",
        "Egg sandwich half set",
        "Makhana trail bowl",
        "Smoothie snack jar"
      ],
      portions: [
        { label: "1 snack cup", calories: 135 },
        { label: "1 mini meal", calories: 165 },
        { label: "1 post-workout pack", calories: 195 },
        { label: "1 hearty snack", calories: 225 }
      ],
      boosters: [
        { label: "with cacao nibs", calories: 35 },
        { label: "with berries", calories: 40 },
        { label: "with peanut butter", calories: 75 },
        { label: "with roasted seeds", calories: 55 }
      ]
    }
  },
  non_veg: {
    breakfast: {
      mains: [
        "Chicken keema toast",
        "Egg white masala omelette",
        "Tandoori chicken sandwich",
        "Fish cutlet breakfast bowl",
        "Chicken oats scramble",
        "Boiled egg millet plate",
        "Chicken sausage poha",
        "Tuna toast power plate",
        "Pepper chicken wrap",
        "Egg dosa protein combo"
      ],
      portions: [
        { label: "1 plate", calories: 250 },
        { label: "2-piece meal", calories: 310 },
        { label: "1 bowl combo", calories: 285 },
        { label: "1 athlete portion", calories: 360 }
      ],
      boosters: [
        { label: "with fruit side", calories: 60 },
        { label: "with yogurt dip", calories: 50 },
        { label: "with sauteed spinach", calories: 42 },
        { label: "with seed topper", calories: 45 }
      ]
    },
    lunch: {
      mains: [
        "Grilled chicken rice bowl",
        "Chicken curry roti set",
        "Fish tikka millet platter",
        "Chicken quinoa power bowl",
        "Egg curry brown rice",
        "Tandoori fish lunch plate",
        "Chicken stew and rice",
        "Pepper chicken wrap duo",
        "Prawn pulao recovery bowl",
        "Lean chicken thali"
      ],
      portions: [
        { label: "1 standard plate", calories: 390 },
        { label: "1 power lunch", calories: 470 },
        { label: "2 wraps", calories: 450 },
        { label: "1 large bowl", calories: 520 }
      ],
      boosters: [
        { label: "with salad crunch", calories: 35 },
        { label: "with yogurt raita", calories: 70 },
        { label: "with sauteed greens", calories: 65 },
        { label: "with broth cup", calories: 40 }
      ]
    },
    dinner: {
      mains: [
        "Herb chicken dinner plate",
        "Fish curry comfort bowl",
        "Egg white curry meal",
        "Chicken soup and toast",
        "Grilled fish and greens",
        "Chicken stew millet set",
        "Pepper egg rice bowl",
        "Lemon fish quinoa plate",
        "Chicken lettuce wrap dinner",
        "Light prawn curry combo"
      ],
      portions: [
        { label: "1 light plate", calories: 320 },
        { label: "1 balanced plate", calories: 390 },
        { label: "1 bowl plus sides", calories: 440 },
        { label: "1 recovery serving", calories: 480 }
      ],
      boosters: [
        { label: "with soup side", calories: 40 },
        { label: "with herb yogurt", calories: 65 },
        { label: "with grilled vegetables", calories: 60 },
        { label: "with lentil side", calories: 85 }
      ]
    },
    snacks: {
      mains: [
        "Boiled egg duo",
        "Chicken salad cup",
        "Tuna cucumber bites",
        "Protein smoothie jar",
        "Chicken tikka snack box",
        "Egg and fruit combo",
        "Fish cutlet snack",
        "Yogurt chicken dip cup",
        "Protein trail shaker",
        "Pepper egg mini wrap"
      ],
      portions: [
        { label: "1 snack cup", calories: 145 },
        { label: "1 mini meal", calories: 175 },
        { label: "1 post-workout pack", calories: 210 },
        { label: "1 hearty snack", calories: 240 }
      ],
      boosters: [
        { label: "with hummus", calories: 60 },
        { label: "with nuts", calories: 70 },
        { label: "with berries", calories: 40 },
        { label: "with seed crunch", calories: 45 }
      ]
    }
  }
};

const createDietMealOptions = (category, slot) => {
  const blueprint = DIET_OPTION_BLUEPRINTS[category]?.[slot];
  if (!blueprint) return [];

  const options = [];

  blueprint.mains.forEach((main, mainIndex) => {
    blueprint.portions.forEach((portion, portionIndex) => {
      blueprint.boosters.forEach((booster, boosterIndex) => {
        options.push({
          id: `${category}-${slot}-${mainIndex}-${portionIndex}-${boosterIndex}`,
          name: `${main} ${booster.label}`,
          quantity: portion.label,
          calories: portion.calories + booster.calories + mainIndex * 8 + boosterIndex * 6,
          category,
          slot,
          detail: `${DIET_CATEGORY_META[category].label} ${DIET_SLOT_META[slot].label.toLowerCase()} option`
        });
      });
    });
  });

  return options.slice(0, 120);
};

const DIET_ADMIN_LIBRARY = Object.fromEntries(
  Object.entries(DIET_CATEGORY_META).map(([category, item]) => [
    category,
    {
      ...item,
      meals: Object.fromEntries(
        Object.keys(DIET_SLOT_META).map((slot) => [slot, createDietMealOptions(category, slot)])
      )
    }
  ])
);

const TIP_CATEGORY_META = {
  diet: {
    label: "Diet",
    image: "/assets/images/diet-category-pure-veg.png",
    description: "Meal quality, portion control, protein balance, and smarter food choices.",
    accent: "Nutrition-first"
  },
  workout: {
    label: "Workout",
    image: "/assets/images/workout-illustration.png",
    description: "Training quality, technique, recovery, and weekly workout consistency.",
    accent: "Performance"
  },
  hydration: {
    label: "Hydration",
    image: "/assets/images/diet-illustration.png",
    description: "Water timing, electrolyte awareness, and hydration habits through the day.",
    accent: "Fluid balance"
  },
  motivation: {
    label: "Motivation",
    image: "/assets/images/meditation-illustration.png",
    description: "Mindset, discipline, consistency, and confidence-building coaching prompts.",
    accent: "Momentum"
  },
  general: {
    label: "General",
    image: "/assets/images/meditation-illustration.png",
    description: "Lifestyle habits, wellness reminders, and practical all-around guidance.",
    accent: "Everyday wellness"
  }
};

const TIP_LIBRARY_BLUEPRINTS = {
  diet: {
    titlePrefixes: ["Dial In", "Build", "Protect", "Improve", "Upgrade"],
    focuses: ["your breakfast quality", "your lunch balance", "your dinner portions", "your protein intake", "your snack choices"],
    actions: ["Prioritize", "Tighten", "Review", "Improve", "Structure"],
    benefits: ["support steadier energy", "reduce random cravings", "make calorie control easier", "improve recovery from training", "stay consistent through busy days"],
    reminders: ["Keep meals simple enough to repeat.", "Aim for progress instead of perfect eating.", "Plan one strong meal before improving the next.", "Use grocery choices to make discipline easier.", "Let portion awareness guide every plate."],
    audiences: ["all users", "weight-loss clients", "muscle-gain clients", "busy professionals", "beginners"]
  },
  workout: {
    titlePrefixes: ["Train", "Sharpen", "Own", "Improve", "Level Up"],
    focuses: ["your warm-up routine", "your weekly training split", "your exercise technique", "your workout intensity", "your recovery between sessions"],
    actions: ["Clean up", "Review", "Upgrade", "Strengthen", "Standardize"],
    benefits: ["improve session quality", "lower injury risk", "build better movement confidence", "get more from every set", "keep progress moving week to week"],
    reminders: ["Consistency beats one perfect session.", "Strong technique should come before heavier loading.", "Record small wins after every workout.", "Leave enough energy to train well again tomorrow.", "A smart plan is easier to follow than a heroic one."],
    audiences: ["gym members", "beginners", "intermediate trainees", "fat-loss clients", "strength-focused users"]
  },
  hydration: {
    titlePrefixes: ["Hydrate", "Refresh", "Stabilize", "Support", "Protect"],
    focuses: ["your morning water habit", "your workout hydration plan", "your afternoon fluid intake", "your electrolyte awareness", "your daily hydration consistency"],
    actions: ["Strengthen", "Track", "Rebuild", "Upgrade", "Simplify"],
    benefits: ["support better focus", "maintain training performance", "reduce afternoon fatigue", "support digestion and recovery", "make healthy habits easier to sustain"],
    reminders: ["Start hydration before thirst builds up.", "Pair water with routine moments in your day.", "Use a visible bottle as a habit trigger.", "Hot weather and hard training both increase your needs.", "Small frequent sips are easier to sustain than huge catch-up drinks."],
    audiences: ["all users", "active members", "outdoor trainees", "office workers", "high-sweat athletes"]
  },
  motivation: {
    titlePrefixes: ["Stay", "Protect", "Build", "Grow", "Strengthen"],
    focuses: ["your daily discipline", "your confidence in progress", "your commitment to the plan", "your identity as a healthy person", "your consistency after setbacks"],
    actions: ["Reconnect with", "Reinforce", "Upgrade", "Rebuild", "Anchor"],
    benefits: ["stay on track longer", "bounce back faster after missed days", "create more repeatable habits", "make effort feel more purposeful", "keep momentum alive during hard weeks"],
    reminders: ["You do not need motivation to start every action.", "A reset works better than guilt.", "Small daily wins create real confidence.", "Your routine should survive imperfect weeks.", "Discipline becomes easier when your environment supports it."],
    audiences: ["all users", "beginners", "returning members", "busy professionals", "clients rebuilding routine"]
  },
  general: {
    titlePrefixes: ["Improve", "Strengthen", "Simplify", "Support", "Balance"],
    focuses: ["your sleep routine", "your stress management habits", "your daily movement baseline", "your meal and workout planning", "your overall recovery rhythm"],
    actions: ["Review", "Rebuild", "Tighten", "Protect", "Organize"],
    benefits: ["create steadier results", "reduce decision fatigue", "support better overall health", "make healthy choices more automatic", "improve long-term adherence"],
    reminders: ["Health results usually come from stacked small habits.", "Your schedule should match your real life.", "Recovery deserves planning too.", "Use routines to reduce daily guesswork.", "Simple habits are easier to keep than complicated systems."],
    audiences: ["all users", "new members", "families", "working adults", "general wellness clients"]
  }
};

const buildTipLibrary = (category, blueprint) => {
  const items = [];

  blueprint.focuses.forEach((focus, focusIndex) => {
    blueprint.actions.forEach((action, actionIndex) => {
      blueprint.benefits.forEach((benefit, benefitIndex) => {
        const titlePrefix =
          blueprint.titlePrefixes[(focusIndex + actionIndex + benefitIndex) % blueprint.titlePrefixes.length];
        const reminder =
          blueprint.reminders[(focusIndex * 2 + actionIndex + benefitIndex) % blueprint.reminders.length];
        const audience =
          blueprint.audiences[(focusIndex + actionIndex * 2 + benefitIndex) % blueprint.audiences.length];

        items.push({
          id: `${category}-${focusIndex}-${actionIndex}-${benefitIndex}`,
          title: `${titlePrefix} ${focus[0].toUpperCase()}${focus.slice(1)} To ${benefit[0].toUpperCase()}${benefit.slice(1)}`,
          category,
          targetAudience: audience,
          content: `${action} ${focus} to ${benefit}. ${reminder} This is especially helpful for ${audience}.`
        });
      });
    });
  });

  return items.slice(0, 125);
};

const TIP_LIBRARY = Object.fromEntries(
  Object.entries(TIP_LIBRARY_BLUEPRINTS).map(([category, blueprint]) => [category, buildTipLibrary(category, blueprint)])
);

const formatMealDisplay = (meal) => {
  if (!meal) return "-";
  if (typeof meal === "string") return meal;
  return `${meal.name} | ${meal.quantity} | ${meal.calories} kcal`;
};

const normalizeMealSelection = (meal, fallbackCategory = "pure_veg") => {
  if (!meal) return null;

  if (typeof meal === "string") {
    return {
      id: "",
      name: meal,
      quantity: "1 serving",
      calories: 0,
      category: fallbackCategory
    };
  }

  return {
    id: meal.id || "",
    name: meal.name || "",
    quantity: meal.quantity || "1 serving",
    calories: Number(meal.calories) || 0,
    category: meal.category || fallbackCategory
  };
};

const getPlanMealCalories = (plan) =>
  Object.values(plan.meals || {}).reduce((total, meal) => total + (Number(meal?.calories) || 0), 0);

const renderMealPanel = (label, meal) => {
  if (!meal) {
    return `
      <div class="diet-meal-line">
        <strong>${label}</strong>
        <span class="subtle">Not added</span>
      </div>
    `;
  }

  if (typeof meal === "string") {
    return `
      <div class="diet-meal-line">
        <strong>${label}</strong>
        <span>${meal}</span>
      </div>
    `;
  }

  return `
    <div class="diet-meal-line">
      <strong>${label}</strong>
      <span>${meal.name || "Meal item"}</span>
      <div class="mini-meta-row">
        <span>${meal.quantity || "1 serving"}</span>
        <span>${Number(meal.calories) || 0} kcal</span>
      </div>
    </div>
  `;
};

const renderExercisePanel = (exercise) => {
  const name = typeof exercise === "string" ? exercise : exercise?.name;
  if (!name) return "";

  if (typeof exercise === "string") {
    return `
      <div class="exercise-mini-card">
        <strong>${exercise}</strong>
        <span class="subtle">Admin selected exercise</span>
      </div>
    `;
  }

  return `
    <div class="exercise-mini-card">
      <strong>${name}</strong>
      <div class="mini-meta-row">
        ${exercise.category ? `<span>${formatLabel(exercise.category)}</span>` : ""}
        ${exercise.bodyPart ? `<span>${formatLabel(exercise.bodyPart)}</span>` : ""}
        ${exercise.equipment ? `<span>${formatLabel(exercise.equipment)}</span>` : ""}
      </div>
      <p>${exercise.sets ? `${exercise.sets} sets` : ""}${exercise.reps ? ` | ${exercise.reps}` : ""}${exercise.duration ? ` | ${exercise.duration}` : ""}</p>
      ${exercise.instructions ? `<p class="subtle">${exercise.instructions}</p>` : ""}
    </div>
  `;
};

const getWorkoutExercises = (plan = {}) => {
  plan = plan || {};
  const directExercises = Array.isArray(plan.exercises) ? plan.exercises : [];
  const weeklyExercises = (plan.weeklyPlan || []).flatMap((day) => day.exercises || []);
  return directExercises.length ? directExercises : weeklyExercises;
};

const renderWorkoutDayPanel = (day) => `
  <div class="workout-day-mini">
    <div>
      <strong>${day.title || `Day ${day.dayNumber || ""}`}</strong>
      <p class="subtle">${day.focus ? formatLabel(day.focus) : "Workout day"}</p>
    </div>
    <span class="tag">${day.estimatedCalories || 0} kcal</span>
  </div>
`;

const addRequiredIndicators = () => {
  qsa(".field").forEach((field) => {
    const label = field.querySelector("label");
    const control = field.querySelector("input, select, textarea");

    if (!label || !control?.required || label.querySelector(".required-indicator")) return;

    label.insertAdjacentHTML("beforeend", '<span class="required-indicator">*</span>');
  });
};

const loadImage = (src) =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });

const initBrandAssets = async () => {
  let favicon = document.querySelector('link[rel="icon"]');

  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }

  favicon.type = "image/png";
  favicon.href = FAVICON_PATH;

  const hasBrandLogo = await loadImage(BRAND_LOGO_PATH);
  if (!hasBrandLogo) return;

  qsa(".brand-mark").forEach((mark) => {
    mark.classList.add("has-image");
    mark.innerHTML = `<img src="${BRAND_LOGO_PATH}" alt="SmartFit logo">`;
  });
};

const clearFormFields = (form) => {
  if (!form) return;

  form.reset();

  [...form.elements].forEach((field) => {
    if (!field.name || field.disabled) return;

    if (field.tagName === "SELECT") {
      field.selectedIndex = 0;
      return;
    }

    if (field.type === "checkbox" || field.type === "radio" || field.type === "submit" || field.type === "button" || field.type === "hidden") {
      return;
    }

    field.value = "";
  });
};

const fillLoginForm = (form, email = "", password = "") => {
  if (!form) return;
  const emailInput = form.elements.namedItem("email");
  const passwordInput = form.elements.namedItem("password");
  if (emailInput) emailInput.value = email;
  if (passwordInput) passwordInput.value = password;
};

const initAuthFormState = () => {
  const authPages = {
    register: "#registerForm",
    login: "#loginForm",
    "admin-login": "#adminLoginForm"
  };

  const selector = authPages[page];
  if (!selector) return;

  const form = qs(selector);
  if (!form) return;

  clearFormFields(form);
  setTimeout(() => clearFormFields(form), 0);
  setTimeout(() => clearFormFields(form), 250);

  window.addEventListener("pageshow", () => {
    clearFormFields(form);
  });
};

const initSessionPolicy = () => {
  clearLegacyAuth("user");
  clearLegacyAuth("admin");
  storage.removeItem("sfds_last_user_email");
  storage.removeItem("sfds_last_admin_email");
};

const getCategoryIllustration = (value = "", fallback = "meditation") => {
  const normalized = String(value).toLowerCase();

  if (normalized.includes("yoga")) {
    return WORKOUT_CATEGORY_META.yoga.image;
  }

  if (normalized.includes("gym")) {
    return WORKOUT_CATEGORY_META.gym.image;
  }

  if (normalized.includes("calisthenics")) {
    return WORKOUT_CATEGORY_META.calisthenics.image;
  }

  if (normalized.includes("maharashtrian")) {
    return "/assets/images/admin-maharashtrian-panel.png";
  }

  if (normalized.includes("indian")) {
    return "/assets/images/admin-indian-panel.png";
  }

  if (normalized.includes("pure veg") || normalized.includes("pure_veg")) {
    return "/assets/images/diet-category-pure-veg.png";
  }

  if (normalized.includes("mix veg") || normalized.includes("mix_veg")) {
    return "/assets/images/diet-category-mix-veg.png";
  }

  if (normalized.includes("non veg") || normalized.includes("non_veg")) {
    return "/assets/images/diet-category-non-veg.png";
  }

  if (
    normalized.includes("diet") ||
    normalized.includes("meal") ||
    normalized.includes("nutrition") ||
    normalized.includes("weight")
  ) {
    return "/assets/images/diet-category-pure-veg.png";
  }

  if (
    normalized.includes("workout") ||
    normalized.includes("exercise") ||
    normalized.includes("fitness") ||
    normalized.includes("strength") ||
    normalized.includes("cardio")
  ) {
    return "/assets/images/workout-illustration.png";
  }

  if (
    normalized.includes("meditation") ||
    normalized.includes("mind") ||
    normalized.includes("motivation") ||
    normalized.includes("stress") ||
    normalized.includes("recovery")
  ) {
    return "/assets/images/meditation-illustration.png";
  }

  return `/assets/images/${fallback}-illustration.png`;
};

const bindLogoutButtons = () => {
  qsa("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => logout(button.dataset.logout));
  });
};

const initRegister = () => {
  const form = qs("#registerForm");
  if (!form) return;

  const requiredFields = [
    "name",
    "email",
    "password",
    "age",
    "gender",
    "heightCm",
    "weightKg",
    "activityLevel",
    "fitnessLevel",
    "fitnessGoal",
    "dietPreference",
    "preferredWorkoutType",
    "workoutDaysPerWeek",
    "workoutMinutesPerDay"
  ];

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());
    const requiredValues = requiredFields.map((field) => formData[field]);

    if (
      !ValidationUtils.requireFields(requiredValues) ||
      !ValidationUtils.isEmail(formData.email) ||
      !ValidationUtils.isStrongPassword(formData.password)
    ) {
      setMessage("#registerMessage", "Fill all required fields with valid information. Password needs uppercase, lowercase, number, and 8+ characters.");
      return;
    }

    try {
      const payload = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
          heightCm: Number(formData.heightCm),
          weightKg: Number(formData.weightKg),
          workoutDaysPerWeek: Number(formData.workoutDaysPerWeek),
          workoutMinutesPerDay: Number(formData.workoutMinutesPerDay)
        })
      });

      saveUserSession(payload);
      setMessage("#registerMessage", payload.message, "success");
      setTimeout(() => {
        window.location.href = "/user/dashboard.html";
      }, 700);
    } catch (error) {
      setMessage("#registerMessage", error.message);
    }
  });
};

const initLogin = () => {
  const form = qs("#loginForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());

    try {
      const payload = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      saveUserSession(payload);
      setMessage("#loginMessage", payload.message, "success");
      setTimeout(() => {
        window.location.href = "/user/dashboard.html";
      }, 700);
    } catch (error) {
      setMessage("#loginMessage", error.message);
    }
  });
};

const initAdminLogin = () => {
  const form = qs("#adminLoginForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());

    try {
      const payload = await apiFetch("/auth/admin-login", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      saveAdminSession(payload);
      setMessage("#adminLoginMessage", payload.message, "success");
      setTimeout(() => {
        window.location.href = "/admin/admin-dashboard.html";
      }, 700);
    } catch (error) {
      setMessage("#adminLoginMessage", error.message);
    }
  });
};

const loadDashboard = async () => {
  ensureAuth("user");

  try {
    const data = await apiFetch("/users/dashboard");
    const { user, snapshot, recommendedDiet, recommendedWorkout, recentProgress, tips } = data;

    fillText("#welcomeName", user.name);
    fillText("#bmiValue", snapshot.bmi);
    fillText("#bmiStatus", snapshot.bmiCategory);
    fillText(
      "#idealWeight",
      `${snapshot.idealWeightRange.minWeight} kg - ${snapshot.idealWeightRange.maxWeight} kg`
    );
    fillText("#calorieValue", `${snapshot.recommendedCalories} kcal/day`);
    fillText("#waterValue", `${snapshot.waterIntakeLiters} L/day`);

    const dietCard = qs("#dietTitle")?.closest(".media-card");
    if (dietCard) {
      dietCard.classList.add("dashboard-plan-card");
      dietCard.innerHTML = recommendedDiet
        ? `
          <div class="media-copy">
            <div class="tag-row">
              <span class="tag">${recommendedDiet.user ? "Assigned to you" : "Default plan"}</span>
              <span class="tag">${formatLabel(recommendedDiet.goal || user.fitnessGoal)}</span>
            </div>
            <h3>${recommendedDiet.title}</h3>
            <p class="subtle">${recommendedDiet.notes || recommendedDiet.calorieRange || ""}</p>
            <div class="mini-meta-row">
              <span>${recommendedDiet.calorieRange || "Calories added by admin"}</span>
              <span>${getPlanMealCalories(recommendedDiet)} kcal meals</span>
            </div>
          </div>
          <img src="${getCategoryIllustration(recommendedDiet.dietCategory || recommendedDiet.cuisine || recommendedDiet.goal, "diet")}" alt="Diet plan illustration" class="media-thumb">
        `
        : `
          <div class="media-copy">
            <span class="tag">Diet Plan</span>
            <h3>No diet plan found</h3>
            <p class="subtle">Please ask admin to add or assign a plan for your current goal.</p>
          </div>
          <img src="/assets/images/diet-illustration.png" alt="Diet plan illustration" class="media-thumb">
        `;
    }

    const workoutCard = qs("#workoutTitle")?.closest(".media-card");
    if (workoutCard) {
      const exerciseCount = getWorkoutExercises(recommendedWorkout).length;
      workoutCard.classList.add("dashboard-plan-card");
      workoutCard.innerHTML = recommendedWorkout
        ? `
          <div class="media-copy">
            <div class="tag-row">
              <span class="tag">Assigned workout</span>
              <span class="tag">${formatLabel(recommendedWorkout.workoutType || recommendedWorkout.workoutCategory || user.preferredWorkoutType)}</span>
            </div>
            <h3>${recommendedWorkout.title}</h3>
            <p class="subtle">${recommendedWorkout.weeklySchedule || recommendedWorkout.summary || recommendedWorkout.notes || ""}</p>
            <div class="mini-meta-row">
              <span>${formatLabel(recommendedWorkout.fitnessLevel || "all")} level</span>
              <span>${exerciseCount || recommendedWorkout.weeklyPlan?.length || 0} exercise panels</span>
            </div>
          </div>
          <img src="${getCategoryIllustration(recommendedWorkout.workoutType || recommendedWorkout.workoutCategory || recommendedWorkout.goal, "workout")}" alt="Workout plan illustration" class="media-thumb">
        `
        : `
          <div class="media-copy">
            <span class="tag">Workout Plan</span>
            <h3>No workout plan found</h3>
            <p class="subtle">Generate a plan or ask admin to assign one for your profile.</p>
          </div>
          <img src="/assets/images/workout-illustration.png" alt="Workout plan illustration" class="media-thumb">
        `;
    }

    renderList("#adminCommunicationGrid", [
      {
        label: "Diet Plan",
        title: recommendedDiet ? recommendedDiet.title : "Waiting for assignment",
        detail: recommendedDiet
          ? `${recommendedDiet.user ? "Assigned to you" : "Default plan"} | ${formatLabel(recommendedDiet.goal || user.fitnessGoal)}`
          : "Ask the admin to assign a plan for your current goal."
      },
      {
        label: "Workout Plan",
        title: recommendedWorkout ? recommendedWorkout.title : "Waiting for assignment",
        detail: recommendedWorkout
          ? `${formatLabel(recommendedWorkout.workoutType || recommendedWorkout.workoutCategory || user.preferredWorkoutType)} | ${recommendedWorkout.weeklySchedule || "Weekly schedule available"}`
          : "Generate a plan or ask the admin to assign one."
      },
      {
        label: "Tips",
        title: `${tips.length} visible tip(s)`,
        detail: `${tips.filter((tip) => tip.user).length} sent specifically to you, ${tips.filter((tip) => !tip.user).length} general.`
      }
    ], (item) => `
      <div class="communication-item">
        <span class="tip-category-badge">${item.label}</span>
        <strong>${item.title}</strong>
        <p class="subtle">${item.detail}</p>
      </div>
    `);

    renderList("#recentProgressList", recentProgress, (item) => `
      <div class="list-item">
        <strong>${new Date(item.date).toLocaleDateString()}</strong>
        <div>Weight: ${item.currentWeight} kg | Calories: ${item.caloriesTaken} kcal</div>
        <div>Water: ${item.waterTaken} L | Steps: ${item.stepsWalked}</div>
        <div>${item.workoutDone}</div>
      </div>
    `);

    renderList("#tipList", tips, (tip) => `
      <div class="list-item">
        <span class="tag">${tip.category}</span>
        ${tip.user ? `<span class="tag tag-warm">Sent to you</span>` : `<span class="tag">General</span>`}
        <h4>${tip.title}</h4>
        <p class="subtle">${tip.content}</p>
      </div>
    `);

    if (qs("#progressChart")) {
      if (window.ChartHelpers?.renderWeightChart) {
        window.ChartHelpers.renderWeightChart(qs("#progressChart"), recentProgress);
      } else {
        new Chart(qs("#progressChart"), {
          type: "line",
          data: {
            labels: recentProgress.map((item) => new Date(item.date).toLocaleDateString()),
            datasets: [
              {
                label: "Weight (kg)",
                data: recentProgress.map((item) => item.currentWeight),
                borderColor: "#0f766e",
                backgroundColor: "rgba(15,118,110,0.15)",
                tension: 0.35,
                fill: true
              }
            ]
          }
        });
      }
    }
  } catch (error) {
    setMessage("#pageMessage", error.message);
  }
};

const loadProfile = async () => {
  ensureAuth("user");

  try {
    const data = await apiFetch("/users/profile");
    const profile = data.profile;

    Object.entries(profile).forEach(([key, value]) => {
      const input = qs(`[name="${key}"]`);
      if (input && value !== undefined && value !== null) {
        input.value = Array.isArray(value) ? value.join(", ") : value;
      }
    });

    const form = qs("#profileForm");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = Object.fromEntries(new FormData(form).entries());
      try {
        const response = await apiFetch(
          "/users/profile",
          {
            method: "PUT",
            body: JSON.stringify({
              ...formData,
              age: Number(formData.age),
              heightCm: Number(formData.heightCm),
              weightKg: Number(formData.weightKg),
              workoutDaysPerWeek: Number(formData.workoutDaysPerWeek),
              workoutMinutesPerDay: Number(formData.workoutMinutesPerDay)
            })
          },
          "user"
        );

        setMessage("#profileMessage", response.message, "success");
      } catch (error) {
        setMessage("#profileMessage", error.message);
      }
    });
  } catch (error) {
    setMessage("#profileMessage", error.message);
  }
};

const loadBMIPage = async () => {
  ensureAuth("user");
  try {
    const data = await apiFetch("/users/bmi-report");
    const { snapshot, records } = data;
    fillText("#bmiMain", snapshot.bmi);
    fillText("#bmiCategoryMain", snapshot.bmiCategory);
    fillText(
      "#bmiIdealRange",
      `${snapshot.idealWeightRange.minWeight} kg - ${snapshot.idealWeightRange.maxWeight} kg`
    );

    renderTableRows(
      "#bmiHistoryTable",
      records.map(
        (record) => `
        <tr>
          <td>${new Date(record.recordedAt).toLocaleDateString()}</td>
          <td>${record.heightCm}</td>
          <td>${record.weightKg}</td>
          <td>${record.bmi}</td>
          <td>${record.bmiCategory}</td>
          <td>${record.recommendedCalories} kcal</td>
          <td>${record.waterIntakeLiters} L</td>
        </tr>
      `
      )
    );
  } catch (error) {
    setMessage("#pageMessage", error.message);
  }
};

const loadDietPlans = async () => {
  try {
    ensureAuth("user");
    const data = await apiFetch("/users/plans");
    const dietPlans = data.dietPlans || [];
    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `sfds_diet_satisfaction_${todayKey}`;
    const getSatisfiedPlans = () => JSON.parse(storage.getItem(storageKey) || "[]");
    const saveSatisfiedPlans = (plans) => storage.setItem(storageKey, JSON.stringify([...new Set(plans)]));
    const isSatisfied = (plan) => getSatisfiedPlans().includes(plan._id);

    const updateDietStatus = () => {
      const satisfiedCount = getSatisfiedPlans().filter((id) => dietPlans.some((plan) => plan._id === id)).length;
      fillText(
        "#dietTodayStatus",
        satisfiedCount
          ? `${satisfiedCount} diet plan${satisfiedCount === 1 ? "" : "s"} satisfied today`
          : "No diet marked today"
      );
    };

    const renderDietPlan = (plan) => {
      const satisfied = isSatisfied(plan);
      return `
        <article class="diet-plan-card user-plan-panel diet-inbox-card ${satisfied ? "satisfied" : ""}">
          <div class="diet-plan-visual">
            <img src="${getCategoryIllustration(plan.dietCategory || plan.cuisine || plan.goal, "diet")}" alt="Diet plan illustration">
            <span>${formatLabel(plan.dietCategory || "pure_veg")}</span>
          </div>
          <div class="diet-plan-copy">
            <div class="tag-row">
              <span class="tag">${formatLabel(plan.goal)}</span>
              <span class="tag">${formatLabel(plan.fitnessLevel || "all")}</span>
              <span class="tag ${plan.user ? "tag-warm" : ""}">${plan.user ? "Specific plan" : "General plan"}</span>
              ${satisfied ? `<span class="tag tag-warm">Satisfied today</span>` : ""}
            </div>
            <h3>${plan.title}</h3>
            <div class="plan-highlight-row">
              <div><span>Calorie Range</span><strong>${plan.calorieRange}</strong></div>
              <div><span>Meal Total</span><strong>${getPlanMealCalories(plan)} kcal</strong></div>
              <div><span>Hydration</span><strong>${plan.hydrationTip || "Admin will update"}</strong></div>
            </div>
            <div class="diet-meal-grid">
              ${renderMealPanel("Breakfast", plan.meals?.breakfast)}
              ${renderMealPanel("Lunch", plan.meals?.lunch)}
              ${renderMealPanel("Dinner", plan.meals?.dinner)}
              ${renderMealPanel("Snacks", plan.meals?.snacks)}
            </div>
            ${plan.notes ? `<p class="subtle">${plan.notes}</p>` : ""}
            <div class="diet-satisfaction-row">
              <div>
                <strong>${satisfied ? "Great. You completed this diet today." : "Did you complete this diet today?"}</strong>
                <span>${satisfied ? "Your daily satisfaction is saved for today." : "Tap once after following this plan."}</span>
              </div>
              <button type="button" class="btn ${satisfied ? "btn-outline" : "btn-primary"}" data-diet-satisfied="${plan._id}">
                ${satisfied ? "Satisfied" : "I am satisfied today"}
              </button>
            </div>
          </div>
        </article>
      `;
    };

    const renderDietGroup = (selector, plans, emptyMessage) => {
      const element = qs(selector);
      if (!element) return;
      element.innerHTML = plans.length ? plans.map(renderDietPlan).join("") : `<div class="empty-state">${emptyMessage}</div>`;
    };

    const renderDietPage = () => {
      const specificPlans = dietPlans.filter((plan) => plan.user);
      const generalPlans = dietPlans.filter((plan) => !plan.user);

      fillText("#dietTotalCount", dietPlans.length);
      fillText("#dietSpecificCount", specificPlans.length);
      fillText("#dietGeneralCount", generalPlans.length);
      fillText("#specificDietBadge", `${specificPlans.length} plan${specificPlans.length === 1 ? "" : "s"}`);
      fillText("#generalDietBadge", `${generalPlans.length} plan${generalPlans.length === 1 ? "" : "s"}`);

      renderDietGroup("#specificDietPlans", specificPlans, "No specific diet plan assigned to your account yet.");
      renderDietGroup("#generalDietPlans", generalPlans, "No general diet plans are available for your current goal.");
      updateDietStatus();

      qsa("[data-diet-satisfied]").forEach((button) => {
        button.addEventListener("click", () => {
          const planId = button.dataset.dietSatisfied;
          const satisfiedPlans = getSatisfiedPlans();
          if (!satisfiedPlans.includes(planId)) {
            saveSatisfiedPlans([...satisfiedPlans, planId]);
          }
          setMessage("#pageMessage", "Diet satisfaction saved for today.", "success");
          renderDietPage();
        });
      });
    };

    renderDietPage();
  } catch (error) {
    setMessage("#pageMessage", error.message);
  }
};

const loadWorkoutPlans = async () => {
  try {
    ensureAuth("user");
    const data = await apiFetch("/users/plans");
    const workoutPlans = data.workoutPlans || [];
    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `sfds_workout_satisfaction_${todayKey}`;
    const getSatisfiedPlans = () => JSON.parse(storage.getItem(storageKey) || "[]");
    const saveSatisfiedPlans = (plans) => storage.setItem(storageKey, JSON.stringify([...new Set(plans)]));
    const isSatisfied = (plan) => getSatisfiedPlans().includes(plan._id);

    const updateWorkoutStatus = () => {
      const satisfiedCount = getSatisfiedPlans().filter((id) => workoutPlans.some((plan) => plan._id === id)).length;
      fillText("#workoutSatisfiedCount", satisfiedCount);
      fillText(
        "#workoutTodayStatus",
        satisfiedCount
          ? `${satisfiedCount} workout plan${satisfiedCount === 1 ? "" : "s"} satisfied today`
          : "No workout marked today"
      );
    };

    const renderWorkoutPlan = (plan) => {
      const exercises = getWorkoutExercises(plan);
      const satisfied = isSatisfied(plan);
      return `
        <article class="workout-inbox-card user-plan-panel ${satisfied ? "satisfied" : ""}">
          <div class="workout-plan-visual">
            <img src="${getCategoryIllustration(plan.workoutType || plan.workoutCategory || plan.goal, "workout")}" alt="Workout plan illustration">
            <span>${formatLabel(plan.workoutType || plan.workoutCategory || "gym")}</span>
          </div>
          <div class="workout-plan-copy">
            <div class="tag-row">
              <span class="tag">${formatLabel(plan.goal)}</span>
              <span class="tag">${formatLabel(plan.fitnessLevel || "all")}</span>
              <span class="tag ${plan.user ? "tag-warm" : ""}">${plan.user ? "Specific plan" : "General plan"}</span>
              ${satisfied ? `<span class="tag tag-warm">Satisfied today</span>` : ""}
            </div>
            <h3>${plan.title}</h3>
            <div class="plan-highlight-row">
              <div><span>Duration</span><strong>${plan.duration || `${plan.assessment?.workoutMinutesPerDay || "-"} min/day`}</strong></div>
              <div><span>Schedule</span><strong>${plan.weeklySchedule || `${plan.weeklyPlan?.length || 0} training days`}</strong></div>
              <div><span>Calories</span><strong>${plan.totalEstimatedCalories || 0}</strong></div>
            </div>
            ${plan.summary ? `<p>${plan.summary}</p>` : ""}
            ${plan.notes ? `<p class="subtle">${plan.notes}</p>` : ""}
            ${(plan.weeklyPlan || []).length ? `<div class="workout-day-mini-grid">${plan.weeklyPlan.map(renderWorkoutDayPanel).join("")}</div>` : ""}
            <div class="exercise-mini-grid">
              ${exercises.length ? exercises.map(renderExercisePanel).join("") : `<div class="empty-state">Admin has not added exercises to this plan yet.</div>`}
            </div>
            <div class="workout-satisfaction-row">
              <div>
                <strong>${satisfied ? "Great. You completed this workout today." : "Did you complete this workout today?"}</strong>
                <span>${satisfied ? "Your workout satisfaction is saved for today." : "Tap once after finishing this workout."}</span>
              </div>
              <button type="button" class="btn ${satisfied ? "btn-outline" : "btn-primary"}" data-workout-satisfied="${plan._id}">
                ${satisfied ? "Satisfied" : "I am satisfied today"}
              </button>
            </div>
          </div>
        </article>
      `;
    };

    const renderWorkoutGroup = (selector, plans, emptyMessage) => {
      const element = qs(selector);
      if (!element) return;
      element.innerHTML = plans.length ? plans.map(renderWorkoutPlan).join("") : `<div class="empty-state">${emptyMessage}</div>`;
    };

    const renderWorkoutPage = () => {
      const specificPlans = workoutPlans.filter((plan) => plan.user);
      const generalPlans = workoutPlans.filter((plan) => !plan.user);

      fillText("#workoutSpecificCount", specificPlans.length);
      fillText("#workoutGeneralCount", generalPlans.length);
      fillText("#specificWorkoutBadge", `${specificPlans.length} plan${specificPlans.length === 1 ? "" : "s"}`);
      fillText("#generalWorkoutBadge", `${generalPlans.length} plan${generalPlans.length === 1 ? "" : "s"}`);

      renderWorkoutGroup("#specificWorkoutPlans", specificPlans, "No workout plan assigned by admin to your account yet.");
      renderWorkoutGroup("#generalWorkoutPlans", generalPlans, "No general workout plans are available for your current goal.");
      updateWorkoutStatus();

      qsa("[data-workout-satisfied]").forEach((button) => {
        button.addEventListener("click", () => {
          const planId = button.dataset.workoutSatisfied;
          const satisfiedPlans = getSatisfiedPlans();
          if (!satisfiedPlans.includes(planId)) {
            saveSatisfiedPlans([...satisfiedPlans, planId]);
          }
          setMessage("#pageMessage", "Workout satisfaction saved for today.", "success");
          renderWorkoutPage();
        });
      });
    };

    renderWorkoutPage();
  } catch (error) {
    setMessage("#pageMessage", error.message);
  }
};

const initProgressForm = async () => {
  ensureAuth("user");

  const form = qs("#progressForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());

    try {
      const data = await apiFetch("/progress", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          currentWeight: Number(formData.currentWeight),
          caloriesTaken: Number(formData.caloriesTaken),
          waterTaken: Number(formData.waterTaken),
          stepsWalked: Number(formData.stepsWalked)
        })
      });

      setMessage("#progressMessage", data.message, "success");
      form.reset();
      loadHistory();
    } catch (error) {
      setMessage("#progressMessage", error.message);
    }
  });
};

const loadHistory = async () => {
  if (!qs("#historyTable")) return;
  ensureAuth("user");

  const sort = qs("#sortHistory")?.value || "latest";
  try {
    const data = await apiFetch(`/progress?sort=${sort}`);
    renderTableRows(
      "#historyTable",
      data.history.map(
        (item) => `
        <tr>
          <td>${new Date(item.date).toLocaleDateString()}</td>
          <td>${item.currentWeight}</td>
          <td>${item.caloriesTaken}</td>
          <td>${item.waterTaken}</td>
          <td>${item.stepsWalked}</td>
          <td>${item.workoutDone}</td>
          <td>${item.bmi}</td>
          <td>${item.note || "-"}</td>
        </tr>
      `
      )
    );
  } catch (error) {
    setMessage("#pageMessage", error.message);
  }
};

const loadTips = async () => {
  ensureAuth("user");

  try {
    const data = await apiFetch("/tips/me");
    const allTips = data.tips || [];
    let selectedCategory = "all";

    const renderTipCard = (tip) => {
      const meta = TIP_CATEGORY_META[tip.category] || TIP_CATEGORY_META.general;
      return `
        <article class="tip-inbox-card ${tip.user ? "personal" : ""}">
          <div class="tip-card-image-wrap">
            <img src="${meta.image || getCategoryIllustration(tip.category, "meditation")}" alt="${formatLabel(tip.category)} tip illustration">
          </div>
          <div class="tip-card-body">
            <div class="tag-row">
              <span class="tip-category-badge">${meta.label || formatLabel(tip.category)}</span>
              ${tip.user ? `<span class="tag tag-warm">Specific tip</span>` : `<span class="tag">General tip</span>`}
            </div>
            <h3>${tip.title}</h3>
            <p>${tip.content}</p>
            <div class="tip-card-footer">
              <span>${meta.accent || "Admin guidance"}</span>
              <span>${formatLabel(tip.targetAudience || (tip.user ? "specific user" : "all"))}</span>
            </div>
          </div>
        </article>
      `;
    };

    const emptyTips = (message) => `<div class="empty-state tips-empty-state">${message}</div>`;

    const renderCategoryFilter = () => {
      const filter = qs("#tipsCategoryFilter");
      if (!filter) return;

      const categories = ["all", ...new Set(allTips.map((tip) => tip.category || "general"))];
      filter.innerHTML = categories
        .map((category) => {
          const count = category === "all" ? allTips.length : allTips.filter((tip) => tip.category === category).length;
          const label = category === "all" ? "All" : formatLabel(category);
          return `
            <button type="button" class="tips-filter-button ${selectedCategory === category ? "active" : ""}" data-tip-filter="${category}">
              <span>${label}</span>
              <strong>${count}</strong>
            </button>
          `;
        })
        .join("");

      qsa("[data-tip-filter]").forEach((button) => {
        button.addEventListener("click", () => {
          selectedCategory = button.dataset.tipFilter;
          renderTips();
        });
      });
    };

    const renderTips = () => {
      const filteredTips =
        selectedCategory === "all"
          ? allTips
          : allTips.filter((tip) => (tip.category || "general") === selectedCategory);
      const specificTips = filteredTips.filter((tip) => tip.user);
      const generalTips = filteredTips.filter((tip) => !tip.user);

      fillText("#tipsTotalCount", allTips.length);
      fillText("#tipsSpecificCount", allTips.filter((tip) => tip.user).length);
      fillText("#tipsGeneralCount", allTips.filter((tip) => !tip.user).length);
      fillText("#specificTipsBadge", `${specificTips.length} tip${specificTips.length === 1 ? "" : "s"}`);
      fillText("#generalTipsBadge", `${generalTips.length} tip${generalTips.length === 1 ? "" : "s"}`);

      const specificGrid = qs("#specificTipsGrid");
      const generalGrid = qs("#generalTipsGrid");
      if (specificGrid) {
        specificGrid.innerHTML = specificTips.length
          ? specificTips.map(renderTipCard).join("")
          : emptyTips("No specific tips assigned to your account in this category.");
      }
      if (generalGrid) {
        generalGrid.innerHTML = generalTips.length
          ? generalTips.map(renderTipCard).join("")
          : emptyTips("No general tips available in this category.");
      }

      renderCategoryFilter();
    };

    renderTips();
  } catch (error) {
    setMessage("#pageMessage", error.message);
  }
};

const loadAdminDashboard = async () => {
  ensureAuth("admin");

  try {
    const data = await apiFetch("/admin/dashboard", {}, "admin");
    fillText("#adminUsersCount", data.stats.userCount);
    fillText("#adminDietCount", data.stats.dietCount);
    fillText("#adminWorkoutCount", data.stats.workoutCount);
    fillText("#adminProgressCount", data.stats.progressCount);

    renderTableRows(
      "#adminRecentUsers",
      data.recentUsers.map(
        (user) => `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.fitnessGoal.replaceAll("_", " ")}</td>
          <td>${user.fitnessLevel}</td>
          <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
      `
      )
    );
  } catch (error) {
    setMessage("#pageMessage", error.message);
  }
};

const loadManageUsers = async () => {
  ensureAuth("admin");

  try {
    const data = await apiFetch("/admin/users", {}, "admin");
    renderTableRows(
      "#manageUsersTable",
      data.users.map(
        (user) => `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.fitnessGoal.replaceAll("_", " ")}</td>
          <td>${user.activityLevel}</td>
          <td>${user.weightKg} kg</td>
          <td><button class="btn btn-danger" data-delete-user="${user._id}">Delete</button></td>
        </tr>
      `
      )
    );

    qsa("[data-delete-user]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await apiFetch(`/admin/users/${button.dataset.deleteUser}`, { method: "DELETE" }, "admin");
          loadManageUsers();
        } catch (error) {
          setMessage("#pageMessage", error.message);
        }
      });
    });
  } catch (error) {
    setMessage("#pageMessage", error.message);
  }
};

const createCrudPage = ({
  formSelector,
  endpoint,
  tableSelector,
  mapRow,
  transformPayload,
  role = "admin"
}) => {
  const loadRecords = async () => {
    const data = await apiFetch(endpoint, {}, role);
    const items = data.plans || data.tips || [];
    renderTableRows(tableSelector, items.map(mapRow));

    qsa("[data-edit-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = items.find((entry) => entry._id === button.dataset.editId);
        if (!item) return;

        qsa(`${formSelector} [name]`).forEach((field) => {
          const path = field.name.split(".");
          let value = item;
          path.forEach((segment) => {
            value = value?.[segment];
          });
          field.value = Array.isArray(value) ? value.join(", ") : value || "";
        });

        qs(`${formSelector} [name="id"]`).value = item._id;
      });
    });

    qsa("[data-delete-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        await apiFetch(`${endpoint}/${button.dataset.deleteId}`, { method: "DELETE" }, role);
        loadRecords();
      });
    });
  };

  const form = qs(formSelector);
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = Object.fromEntries(new FormData(form).entries());
      const id = formData.id;
      delete formData.id;

      const payload = transformPayload(formData);

      await apiFetch(
        id ? `${endpoint}/${id}` : endpoint,
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(payload)
        },
        role
      );

      form.reset();
      loadRecords();
    });
  }

  loadRecords().catch((error) => setMessage("#pageMessage", error.message));
};

const initManageTips = () => {
  ensureAuth("admin");

  const form = qs("#tipForm");
  if (!form) return;

  const modeToggle = qs("#tipModeToggle");
  const studioMessage = qs("#tipStudioMessage");
  const categoryCards = qs("#tipCategoryCards");
  const libraryPanel = qs("#tipLibraryPanel");
  const libraryTitle = qs("#tipLibraryTitle");
  const librarySearch = qs("#tipLibrarySearch");
  const librarySummary = qs("#tipLibrarySummary");
  const libraryOptions = qs("#tipLibraryOptions");
  const selectedTipPreview = qs("#selectedTipPreview");
  const insights = qs("#tipsAdminInsights");
  const savedTipCategoryFilter = qs("#savedTipCategoryFilter");
  const userSelect = qs("#tipUserSelect");

  const state = {
    mode: "manual",
    category: "diet",
    selectedTipId: "",
    search: "",
    tips: [],
    users: []
  };

  const renderTipUsers = () => {
    if (!userSelect) return;

    userSelect.innerHTML = `
      <option value="">Select user when specific</option>
      ${state.users.map((user) => `<option value="${user._id}">${user.name} (${user.email})</option>`).join("")}
    `;
  };

  const resetForm = () => {
    form.reset();
    form.elements.namedItem("id").value = "";
    form.elements.namedItem("category").value = state.category;
    form.elements.namedItem("targetAudience").value = "all";
    form.elements.namedItem("assignmentScope").value = "general";
    form.elements.namedItem("user").value = "";
    if (state.mode === "library" && state.selectedTipId) {
      const selectedTip = TIP_LIBRARY[state.category]?.find((tip) => tip.id === state.selectedTipId);
      if (selectedTip) {
        form.elements.namedItem("title").value = selectedTip.title;
        form.elements.namedItem("content").value = selectedTip.content;
        form.elements.namedItem("targetAudience").value = selectedTip.targetAudience;
      }
    }
  };

  const normalizeKey = (tip) =>
    `${String(tip.category || "").trim().toLowerCase()}::${String(tip.title || "").trim().toLowerCase()}`;

  const getSavedTipKeySet = () => new Set(state.tips.map((tip) => normalizeKey(tip)));

  const getFilteredSavedTips = () => {
    if ((savedTipCategoryFilter?.value || "all") === "all") {
      return state.tips;
    }

    return state.tips.filter((tip) => tip.category === savedTipCategoryFilter.value);
  };

  const getSelectedLibraryTip = () =>
    TIP_LIBRARY[state.category]?.find((tip) => tip.id === state.selectedTipId) || null;

  const applyTipToForm = (tip) => {
    if (!tip) return;
    form.elements.namedItem("title").value = tip.title;
    form.elements.namedItem("category").value = tip.category;
    form.elements.namedItem("targetAudience").value = tip.targetAudience;
    form.elements.namedItem("assignmentScope").value = tip.user ? "specific" : "general";
    form.elements.namedItem("user").value = tip.user?._id || "";
    form.elements.namedItem("content").value = tip.content;
  };

  const renderInsights = () => {
    const totalLibraryTips = Object.values(TIP_LIBRARY).reduce((total, tips) => total + tips.length, 0);
    const importedCoverage = Object.keys(TIP_CATEGORY_META).map((category) => ({
      category,
      count: state.tips.filter((tip) => tip.category === category).length
    }));

    insights.innerHTML = `
      <div class="diet-insight-card hero">
        <span class="eyebrow">Tips Studio</span>
        <h4>Manual and library-powered publishing</h4>
        <p>Create original guidance, reuse polished suggestions, or bulk import a category library in one place.</p>
      </div>
      <div class="diet-insight-card">
        <span class="eyebrow">Library Size</span>
        <strong>${totalLibraryTips}+ tips</strong>
        <p>Five categories with 100+ generated tip options each are ready for admin use.</p>
      </div>
      <div class="diet-insight-card">
        <span class="eyebrow">Saved Tips</span>
        <strong>${state.tips.length}</strong>
        <p>${importedCoverage.map((item) => `${TIP_CATEGORY_META[item.category].label}: ${item.count}`).join(" | ")}</p>
      </div>
    `;
  };

  const renderModeToggle = () => {
    modeToggle.innerHTML = `
      <button type="button" class="tip-mode-button ${state.mode === "manual" ? "active" : ""}" data-tip-mode="manual">Manual Entry</button>
      <button type="button" class="tip-mode-button ${state.mode === "library" ? "active" : ""}" data-tip-mode="library">Choose From Library</button>
    `;

    studioMessage.textContent =
      state.mode === "manual"
        ? "Write a custom title and content yourself, then save it directly."
        : "Pick a category, search the library, use a tip in the form, or bulk import polished suggestions.";

    libraryPanel.classList.toggle("hidden", state.mode !== "library");

    qsa("[data-tip-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        state.mode = button.dataset.tipMode;
        renderModeToggle();
        renderCategoryCards();
        renderLibrary();
        resetForm();
      });
    });
  };

  const renderCategoryCards = () => {
    const savedTipKeys = getSavedTipKeySet();

    categoryCards.innerHTML = Object.entries(TIP_CATEGORY_META)
      .map(([value, item]) => {
        const totalTips = TIP_LIBRARY[value].length;
        const importedTips = TIP_LIBRARY[value].filter((tip) => savedTipKeys.has(normalizeKey(tip))).length;

        return `
          <button type="button" class="admin-option-card ${state.category === value ? "active" : ""}" data-tip-category="${value}">
            <img src="${item.image}" alt="${item.label} tips illustration">
            <div class="option-meta">
              <strong>${item.label}</strong>
              <span class="stat-pill">${totalTips}+ options</span>
              <span class="stat-pill warm">${importedTips} saved</span>
              <span class="subtle">${item.description}</span>
            </div>
          </button>
        `;
      })
      .join("");

    qsa("[data-tip-category]").forEach((button) => {
      button.addEventListener("click", () => {
        state.category = button.dataset.tipCategory;
        state.search = "";
        state.selectedTipId = TIP_LIBRARY[state.category][0]?.id || "";
        form.elements.namedItem("category").value = state.category;
        librarySearch.value = "";
        renderCategoryCards();
        renderLibrary();
        resetForm();
      });
    });
  };

  const renderSelectedTipPreview = () => {
    const selectedTip = getSelectedLibraryTip();
    if (!selectedTip) {
      selectedTipPreview.className = "tip-preview-card empty";
      selectedTipPreview.innerHTML = `Select a library tip to preview the full content here.`;
      return;
    }

    selectedTipPreview.className = "tip-preview-card";
    selectedTipPreview.innerHTML = `
      <div class="tip-library-head">
        <div>
          <span class="tip-category-badge">${TIP_CATEGORY_META[selectedTip.category].label}</span>
          <h4>${selectedTip.title}</h4>
        </div>
        <span class="stat-pill">${selectedTip.targetAudience}</span>
      </div>
      <p>${selectedTip.content}</p>
    `;
  };

  const renderLibrary = () => {
    const tips = TIP_LIBRARY[state.category] || [];
    const filteredTips = tips.filter((tip) => {
      const query = state.search.trim().toLowerCase();
      if (!query) return true;

      return (
        tip.title.toLowerCase().includes(query) ||
        tip.content.toLowerCase().includes(query) ||
        tip.targetAudience.toLowerCase().includes(query)
      );
    });

    if (!state.selectedTipId && filteredTips.length) {
      state.selectedTipId = filteredTips[0].id;
    }

    libraryTitle.textContent = `${TIP_CATEGORY_META[state.category].label} tip library`;
    librarySummary.textContent = `${filteredTips.length} of ${tips.length} tips available in this category.`;

    libraryOptions.innerHTML = filteredTips.length
      ? filteredTips
          .map(
            (tip) => `
              <article class="tip-library-card ${state.selectedTipId === tip.id ? "active" : ""}" data-tip-option="${tip.id}">
                <div class="tip-library-head">
                  <div>
                    <span class="tip-category-badge">${TIP_CATEGORY_META[tip.category].label}</span>
                    <strong>${tip.title}</strong>
                  </div>
                  <span class="stat-pill">${tip.targetAudience}</span>
                </div>
                <p>${tip.content}</p>
                <div class="button-row">
                  <button type="button" class="btn btn-outline" data-use-tip="${tip.id}">Use In Form</button>
                </div>
              </article>
            `
          )
          .join("")
      : `<div class="empty-state">No library tips matched that search. Try another keyword.</div>`;

    qsa("[data-tip-option]").forEach((card) => {
      card.addEventListener("click", () => {
        state.selectedTipId = card.dataset.tipOption;
        renderLibrary();
      });
    });

    qsa("[data-use-tip]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        state.selectedTipId = button.dataset.useTip;
        const selectedTip = getSelectedLibraryTip();
        applyTipToForm(selectedTip);
        renderLibrary();
        setMessage("#pageMessage", "Selected library tip loaded into the form.", "success");
      });
    });

    renderSelectedTipPreview();
  };

  const bindSavedTipTable = () => {
    qsa("[data-edit-tip-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const tip = state.tips.find((item) => item._id === button.dataset.editTipId);
        if (!tip) return;

        state.mode = "manual";
        state.category = tip.category || "general";
        form.elements.namedItem("id").value = tip._id;
        form.elements.namedItem("title").value = tip.title || "";
        form.elements.namedItem("category").value = tip.category || "general";
        form.elements.namedItem("targetAudience").value = tip.targetAudience || "all";
        form.elements.namedItem("assignmentScope").value = tip.user ? "specific" : "general";
        form.elements.namedItem("user").value = tip.user?._id || "";
        form.elements.namedItem("content").value = tip.content || "";
        renderModeToggle();
        renderCategoryCards();
        renderLibrary();
        setMessage("#pageMessage", "Tip loaded into the form for editing.", "success");
      });
    });

    qsa("[data-delete-tip-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await apiFetch(`/tips/${button.dataset.deleteTipId}`, { method: "DELETE" }, "admin");
          setMessage("#pageMessage", "Tip deleted.", "success");
          await loadRecords();
        } catch (error) {
          setMessage("#pageMessage", error.message);
        }
      });
    });
  };

  const renderSavedTips = () => {
    const items = getFilteredSavedTips();

    renderTableRows(
      "#manageTipTable",
      items.map(
        (item) => `
          <tr>
            <td>
              <div class="tip-table-head">
                <strong>${item.title}</strong>
              </div>
            </td>
            <td><span class="tip-category-badge">${TIP_CATEGORY_META[item.category]?.label || formatLabel(item.category)}</span></td>
            <td>${item.targetAudience || "all"}</td>
            <td>${item.user?.name ? `${item.user.name}<br><span class="subtle">${item.user.email}</span>` : "All users"}</td>
            <td><p class="tip-table-content">${item.content}</p></td>
            <td>
              <button class="btn btn-outline" data-edit-tip-id="${item._id}">Edit</button>
              <button class="btn btn-danger" data-delete-tip-id="${item._id}">Delete</button>
            </td>
          </tr>
        `
      )
    );

    bindSavedTipTable();
  };

  const loadRecords = async () => {
    const [data, userData] = await Promise.all([
      apiFetch("/tips", {}, "admin"),
      apiFetch("/admin/users", {}, "admin")
    ]);
    state.tips = data.tips || [];
    state.users = userData.users || [];
    renderTipUsers();
    renderInsights();
    renderCategoryCards();
    renderLibrary();
    renderSavedTips();
  };

  const saveTipsBatch = async (tipsToSave, successMessage) => {
    if (!tipsToSave.length) {
      setMessage("#pageMessage", "All matching tips are already saved.", "success");
      return;
    }

    try {
      for (const tip of tipsToSave) {
        await apiFetch(
          "/tips",
          {
            method: "POST",
            body: JSON.stringify({
              title: tip.title,
              category: tip.category,
              user: "",
              targetAudience: tip.targetAudience,
              content: tip.content
            })
          },
          "admin"
        );
      }

      setMessage("#pageMessage", successMessage, "success");
      await loadRecords();
    } catch (error) {
      setMessage("#pageMessage", error.message);
    }
  };

  qs("#applySelectedTip")?.addEventListener("click", () => {
    const selectedTip = getSelectedLibraryTip();
    if (!selectedTip) {
      setMessage("#pageMessage", "Select a library tip first.");
      return;
    }

    applyTipToForm(selectedTip);
    setMessage("#pageMessage", "Selected library tip loaded into the form.", "success");
  });

  qs("#importCategoryTips")?.addEventListener("click", async () => {
    const savedTipKeys = getSavedTipKeySet();
    const pendingTips = TIP_LIBRARY[state.category].filter((tip) => !savedTipKeys.has(normalizeKey(tip)));
    await saveTipsBatch(
      pendingTips,
      `${pendingTips.length} ${TIP_CATEGORY_META[state.category].label.toLowerCase()} tips imported.`
    );
  });

  qs("#importAllTips")?.addEventListener("click", async () => {
    const savedTipKeys = getSavedTipKeySet();
    const pendingTips = Object.values(TIP_LIBRARY)
      .flat()
      .filter((tip) => !savedTipKeys.has(normalizeKey(tip)));

    await saveTipsBatch(pendingTips, `${pendingTips.length} library tips imported across all categories.`);
  });

  qs("#resetTipForm")?.addEventListener("click", () => {
    resetForm();
    setMessage("#pageMessage", "Tip form reset.", "success");
  });

  librarySearch?.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderLibrary();
  });

  savedTipCategoryFilter?.addEventListener("change", renderSavedTips);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());
    const id = formData.id;

    if (!formData.title || !formData.content) {
      setMessage("#pageMessage", "Add both a title and content before saving.");
      return;
    }

    if (formData.assignmentScope === "specific" && !formData.user) {
      setMessage("#pageMessage", "Specific tip is mandatory to assign to a selected user.");
      return;
    }

    const userForTip = formData.assignmentScope === "specific" ? formData.user : "";
    const audienceForTip =
      formData.assignmentScope === "specific"
        ? formData.targetAudience || "specific user"
        : formData.targetAudience || "all";

    try {
      await apiFetch(
        id ? `/tips/${id}` : "/tips",
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify({
            title: formData.title,
            category: formData.category,
            user: userForTip,
            targetAudience: audienceForTip,
            content: formData.content
          })
        },
        "admin"
      );

      setMessage("#pageMessage", id ? "Tip updated." : "Tip added.", "success");
      resetForm();
      await loadRecords();
    } catch (error) {
      setMessage("#pageMessage", error.message);
    }
  });

  state.selectedTipId = TIP_LIBRARY[state.category][0]?.id || "";
  renderModeToggle();
  renderCategoryCards();
  renderLibrary();
  renderInsights();
  resetForm();
  loadRecords().catch((error) => setMessage("#pageMessage", error.message));
};

const initManageWorkoutPlans = () => {
  ensureAuth("admin");

  const form = qs("#workoutForm");
  if (!form) return;

  const categoryInput = qs('[name="workoutCategory"]');
  const categoryCards = qs("#workoutCategoryCards");
  const exerciseOptions = qs("#workoutExerciseOptions");
  const selectedExercises = qs("#selectedWorkoutExercises");
  const exercisePanelField = qs("#workoutExercisePanelField");
  const selectionSummary = qs("#workoutSelectionSummary");
  const libraryTitle = qs("#workoutLibraryTitle");

  const state = {
    category: "gym",
    exercises: []
  };

  const resetState = () => {
    state.category = "gym";
    state.exercises = [];
  };

  const renderCategoryCards = () => {
    categoryInput.value = state.category;
    categoryCards.innerHTML = Object.entries(WORKOUT_ADMIN_LIBRARY)
      .map(
        ([value, item]) => `
          <button type="button" class="admin-option-card ${state.category === value ? "active" : ""}" data-workout-category="${value}">
            <img src="${item.image}" alt="${item.label} workout illustration">
            <div class="option-meta">
              <strong>${item.label}</strong>
              <span class="subtle">${item.description}</span>
            </div>
          </button>
        `
      )
      .join("");

    qsa("[data-workout-category]").forEach((button) => {
      button.addEventListener("click", () => {
        state.category = button.dataset.workoutCategory;
        renderCategoryCards();
        renderExerciseOptions();
      });
    });
  };

  const renderSelectedExercises = () => {
    selectionSummary.textContent = state.exercises.length
      ? `${state.exercises.length} exercise(s) selected for ${WORKOUT_ADMIN_LIBRARY[state.category].label}.`
      : "No exercises selected yet.";

    selectedExercises.innerHTML = state.exercises.length
      ? state.exercises
          .map(
            (exercise) => `
              <span class="selection-chip">
                ${exercise}
                <button type="button" data-remove-workout-exercise="${exercise}" aria-label="Remove ${exercise}">&times;</button>
              </span>
            `
          )
          .join("")
      : `<span class="subtle">Select exercises from the panel to build this plan.</span>`;

    qsa("[data-remove-workout-exercise]").forEach((button) => {
      button.addEventListener("click", () => {
        state.exercises = state.exercises.filter((exercise) => exercise !== button.dataset.removeWorkoutExercise);
        renderSelectedExercises();
        renderExerciseOptions();
      });
    });
  };

  const renderExerciseOptions = () => {
    const category = WORKOUT_ADMIN_LIBRARY[state.category];
    libraryTitle.textContent = `${category.label} exercise library`;
    exerciseOptions.innerHTML = category.options
      .map(
        (option) => `
          <button type="button" class="admin-option-card ${state.exercises.includes(option.name) ? "active" : ""}" data-toggle-workout-exercise="${option.name}">
            <img src="${category.image}" alt="${category.label} exercise">
            <div class="option-meta">
              <strong>${option.name}</strong>
              <span class="subtle">${option.detail}</span>
            </div>
          </button>
        `
      )
      .join("");

    qsa("[data-toggle-workout-exercise]").forEach((button) => {
      button.addEventListener("click", () => {
        const exerciseName = button.dataset.toggleWorkoutExercise;
        state.exercises = state.exercises.includes(exerciseName)
          ? state.exercises.filter((exercise) => exercise !== exerciseName)
          : [...state.exercises, exerciseName];
        renderSelectedExercises();
        renderExerciseOptions();
      });
    });
  };

  const fillForm = (item = null) => {
    form.reset();
    qs('#workoutForm [name="id"]').value = "";
    resetState();

    if (item) {
      qs('#workoutForm [name="id"]').value = item._id;
      qs('#workoutForm [name="title"]').value = item.title || "";
      qs('#workoutForm [name="goal"]').value = item.goal || "lose_weight";
      qs('#workoutForm [name="fitnessLevel"]').value = item.fitnessLevel || "all";
      qs('#workoutForm [name="duration"]').value = item.duration || "";
      qs('#workoutForm [name="weeklySchedule"]').value = item.weeklySchedule || "";
      qs('#workoutForm [name="notes"]').value = item.notes || "";
      state.category = item.workoutCategory || "gym";
      state.exercises = [...(item.exercises || [])];
    }

    renderCategoryCards();
    renderSelectedExercises();
    renderExerciseOptions();
  };

  const loadRecords = async () => {
    const data = await apiFetch("/workouts", {}, "admin");
    const items = data.plans || [];

    renderTableRows(
      "#manageWorkoutTable",
      items.map(
        (item) => `
          <tr>
            <td>${item.title}</td>
            <td>${formatLabel(item.workoutCategory || "gym")}</td>
            <td>${formatLabel(item.goal)}</td>
            <td>${formatLabel(item.fitnessLevel)}</td>
            <td>${item.duration || "-"}</td>
            <td>
              <button class="btn btn-outline" data-edit-workout-id="${item._id}">Edit</button>
              <button class="btn btn-danger" data-delete-workout-id="${item._id}">Delete</button>
            </td>
          </tr>
        `
      )
    );

    qsa("[data-edit-workout-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = items.find((entry) => entry._id === button.dataset.editWorkoutId);
        if (!item) return;
        fillForm(item);
        exercisePanelField.classList.remove("hidden");
      });
    });

    qsa("[data-delete-workout-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        await apiFetch(`/workouts/${button.dataset.deleteWorkoutId}`, { method: "DELETE" }, "admin");
        setMessage("#pageMessage", "Workout plan deleted.", "success");
        loadRecords().catch((error) => setMessage("#pageMessage", error.message));
      });
    });
  };

  qs("#openWorkoutExercisePicker").addEventListener("click", () => {
    exercisePanelField.classList.remove("hidden");
  });

  qs("#closeWorkoutExercisePicker").addEventListener("click", () => {
    exercisePanelField.classList.add("hidden");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());
    const id = formData.id;

    if (!formData.title || !state.category || !state.exercises.length) {
      setMessage("#pageMessage", "Add a title, choose a workout category, and select at least one exercise.");
      return;
    }

    const payload = {
      title: formData.title,
      goal: formData.goal,
      fitnessLevel: formData.fitnessLevel,
      workoutCategory: state.category,
      duration: formData.duration,
      weeklySchedule: formData.weeklySchedule,
      exercises: state.exercises,
      notes: formData.notes
    };

    await apiFetch(
      id ? `/workouts/${id}` : "/workouts",
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload)
      },
      "admin"
    );

    fillForm();
    exercisePanelField.classList.add("hidden");
    setMessage("#pageMessage", id ? "Workout plan updated." : "Workout plan added.", "success");
    loadRecords().catch((error) => setMessage("#pageMessage", error.message));
  });

  fillForm();
  loadRecords().catch((error) => setMessage("#pageMessage", error.message));
};

const initManageDietPlans = () => {
  ensureAuth("admin");

  const form = qs("#dietForm");
  if (!form) return;

  const cuisineInput = qs('[name="cuisine"]');
  const userSelect = qs("#adminDietUserSelect");
  const categoryCards = qs("#dietCategoryCards");
  const mealPanelField = qs("#dietMealPanelField");
  const mealPanelLabel = qs("#dietMealPanelLabel");
  const mealPanelTitle = qs("#dietMealPanelTitle");
  const mealOptions = qs("#dietMealOptions");
  const mealSearch = qs("#dietMealSearch");
  const selectionInsights = qs("#dietSelectionInsights");
  let adminUsers = [];

  const state = {
    dietCategory: "pure_veg",
    activeSlot: "breakfast",
    search: "",
    selectedMeals: {
      breakfast: null,
      lunch: null,
      dinner: null,
      snacks: null
    }
  };

  const mealFields = {
    breakfast: qs('[name="meals.breakfast"]'),
    lunch: qs('[name="meals.lunch"]'),
    dinner: qs('[name="meals.dinner"]'),
    snacks: qs('[name="meals.snacks"]')
  };

  const updateMealFields = () => {
    Object.entries(mealFields).forEach(([slot, field]) => {
      field.value = formatMealDisplay(state.selectedMeals[slot]);
    });
  };

  const renderSelectionInsights = () => {
    const category = DIET_ADMIN_LIBRARY[state.dietCategory];
    const totalOptions = Object.values(category.meals).reduce((count, meals) => count + meals.length, 0);
    const selectedCount = Object.values(state.selectedMeals).filter(Boolean).length;
    const totalCalories = Object.values(state.selectedMeals).reduce(
      (total, meal) => total + (Number(meal?.calories) || 0),
      0
    );

    selectionInsights.innerHTML = `
      <div class="diet-insight-card hero">
        <span class="eyebrow">${category.accent}</span>
        <h4>${category.label} meal studio</h4>
        <p>${category.description}</p>
      </div>
      <div class="diet-insight-card">
        <span class="eyebrow">Coverage</span>
        <strong>${selectedCount}/4 meals selected</strong>
        <p>${totalOptions}+ options are ready across breakfast, lunch, dinner, and snacks.</p>
      </div>
      <div class="diet-insight-card">
        <span class="eyebrow">Live calories</span>
        <strong>${totalCalories} kcal</strong>
        <p>Calculated from the exact meal quantities currently chosen for this plan.</p>
      </div>
    `;
  };

  const renderCategoryCards = () => {
    cuisineInput.value = DIET_ADMIN_LIBRARY[state.dietCategory].cuisine;
    categoryCards.innerHTML = Object.entries(DIET_ADMIN_LIBRARY)
      .map(
        ([value, item]) => `
          <button type="button" class="admin-option-card ${state.dietCategory === value ? "active" : ""}" data-diet-category="${value}">
            <img src="${item.image}" alt="${item.label} food illustration">
            <div class="option-meta">
              <strong>${item.label}</strong>
              <span class="stat-pill">${Object.values(item.meals).reduce((count, meals) => count + meals.length, 0)}+ options</span>
              <span class="subtle">${item.description}</span>
            </div>
          </button>
        `
      )
      .join("");

    qsa("[data-diet-category]").forEach((button) => {
      button.addEventListener("click", () => {
        state.dietCategory = button.dataset.dietCategory;
        Object.keys(state.selectedMeals).forEach((slot) => {
          if (state.selectedMeals[slot] && state.selectedMeals[slot].category !== state.dietCategory) {
            state.selectedMeals[slot] = null;
          }
        });
        updateMealFields();
        renderCategoryCards();
        renderMealOptions();
        renderSelectionInsights();
      });
    });
  };

  const renderUsers = () => {
    if (!userSelect) return;

    userSelect.innerHTML = `
      <option value="">Select user when specific</option>
      ${adminUsers.map((user) => `<option value="${user._id}">${user.name} (${user.email})</option>`).join("")}
    `;
  };

  const renderMealOptions = () => {
    const cuisine = DIET_ADMIN_LIBRARY[state.dietCategory];
    const slot = state.activeSlot;
    const activeMeal = state.selectedMeals[slot];
    const searchTerm = state.search.trim().toLowerCase();
    const meals = cuisine.meals[slot].filter((meal) => {
      if (!searchTerm) return true;
      return (
        meal.name.toLowerCase().includes(searchTerm) ||
        meal.quantity.toLowerCase().includes(searchTerm) ||
        meal.detail.toLowerCase().includes(searchTerm)
      );
    });

    mealPanelLabel.textContent = `${formatLabel(slot)} Options`;
    mealPanelTitle.textContent = `${cuisine.label} ${formatLabel(slot)} panel`;

    mealOptions.innerHTML = meals.length
      ? meals
          .map(
            (meal) => `
          <button type="button" class="meal-option-card ${activeMeal?.id === meal.id ? "active" : ""}" data-select-meal="${meal.id}" data-meal-category="${meal.category}">
            <img src="${cuisine.image}" alt="${cuisine.label} meal illustration">
            <div class="option-meta">
              <strong>${meal.name}</strong>
              <span class="stat-pill">${meal.quantity}</span>
              <span class="stat-pill warm">${meal.calories} kcal</span>
              <span class="subtle">${meal.detail}</span>
            </div>
          </button>
        `
          )
          .join("")
      : `<div class="empty-state">No meals matched that search. Try another ingredient or quantity keyword.</div>`;

    qsa("[data-select-meal]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedMeals[slot] =
          cuisine.meals[slot].find((meal) => meal.id === button.dataset.selectMeal) || null;
        updateMealFields();
        renderMealOptions();
        renderSelectionInsights();
      });
    });
  };

  const openMealPanel = (slot) => {
    state.activeSlot = slot;
    mealPanelField.classList.remove("hidden");
    mealSearch.value = state.search;
    renderMealOptions();
  };

  const fillForm = (item = null) => {
    form.reset();
      qs('#dietForm [name="id"]').value = "";
      qs('#dietForm [name="assignmentScope"]').value = "general";
      qs('#dietForm [name="user"]').value = "";
      qs('#dietForm [name="userIdentifier"]').value = "";
      state.dietCategory = "pure_veg";
    state.activeSlot = "breakfast";
    state.search = "";
    state.selectedMeals = {
      breakfast: null,
      lunch: null,
      dinner: null,
      snacks: null
    };

    if (item) {
      qs('#dietForm [name="id"]').value = item._id;
      qs('#dietForm [name="assignmentScope"]').value = item.user ? "specific" : "general";
      qs('#dietForm [name="user"]').value = item.user?._id || "";
      qs('#dietForm [name="userIdentifier"]').value = item.user?.email || "";
      qs('#dietForm [name="title"]').value = item.title || "";
      qs('#dietForm [name="goal"]').value = item.goal || "lose_weight";
      qs('#dietForm [name="fitnessLevel"]').value = item.fitnessLevel || "all";
      qs('#dietForm [name="calorieRange"]').value = item.calorieRange || "";
      qs('#dietForm [name="hydrationTip"]').value = item.hydrationTip || "";
      qs('#dietForm [name="notes"]').value = item.notes || "";
      state.dietCategory = item.dietCategory || item.meals?.breakfast?.category || "pure_veg";
      state.selectedMeals.breakfast = normalizeMealSelection(item.meals?.breakfast, state.dietCategory);
      state.selectedMeals.lunch = normalizeMealSelection(item.meals?.lunch, state.dietCategory);
      state.selectedMeals.dinner = normalizeMealSelection(item.meals?.dinner, state.dietCategory);
      state.selectedMeals.snacks = normalizeMealSelection(item.meals?.snacks, state.dietCategory);
    }

    updateMealFields();
    renderUsers();
    if (item) {
      qs('#dietForm [name="user"]').value = item.user?._id || "";
    }
    renderCategoryCards();
    renderMealOptions();
    renderSelectionInsights();
  };

  const loadRecords = async () => {
    const [data, userData] = await Promise.all([
      apiFetch("/diets", {}, "admin"),
      apiFetch("/admin/users", {}, "admin")
    ]);
    const items = data.plans || [];
    adminUsers = userData.users || [];
    renderUsers();

    renderTableRows(
      "#manageDietTable",
      items.map(
        (item) => `
          <tr>
            <td>${item.title}</td>
            <td>${item.user?.name ? `${item.user.name}<br><span class="subtle">${item.user.email}</span>` : "Default / All Users"}</td>
            <td>${formatLabel(item.dietCategory || "pure_veg")}</td>
            <td>${formatLabel(item.goal)}</td>
            <td>${formatLabel(item.fitnessLevel)}</td>
            <td>${item.calorieRange}<br><span class="subtle">${getPlanMealCalories(item)} kcal from meals</span></td>
            <td>
              <button class="btn btn-outline" data-edit-diet-id="${item._id}">Edit</button>
              <button class="btn btn-danger" data-delete-diet-id="${item._id}">Delete</button>
            </td>
          </tr>
        `
      )
    );

    qsa("[data-edit-diet-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = items.find((entry) => entry._id === button.dataset.editDietId);
        if (!item) return;
        fillForm(item);
        openMealPanel("breakfast");
      });
    });

    qsa("[data-delete-diet-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        await apiFetch(`/diets/${button.dataset.deleteDietId}`, { method: "DELETE" }, "admin");
        setMessage("#pageMessage", "Diet plan deleted.", "success");
        loadRecords().catch((error) => setMessage("#pageMessage", error.message));
      });
    });
  };

  qsa("[data-open-meal-slot]").forEach((button) => {
    button.addEventListener("click", () => openMealPanel(button.dataset.openMealSlot));
  });

  mealSearch.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderMealOptions();
  });

  qs("#closeDietMealPicker").addEventListener("click", () => {
    mealPanelField.classList.add("hidden");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());
    const id = formData.id;

    if (
      !formData.title ||
      !formData.calorieRange ||
      !state.selectedMeals.breakfast ||
      !state.selectedMeals.lunch ||
      !state.selectedMeals.dinner ||
      !state.selectedMeals.snacks
    ) {
      setMessage("#pageMessage", "Fill the title and calorie range, then select all four meals from the category catalog.");
      return;
    }

    if (formData.assignmentScope === "specific" && !formData.user && !formData.userIdentifier) {
      setMessage("#pageMessage", "Specific diet plan is mandatory to assign to a selected user or user email/ID.");
      return;
    }

    const payload = {
      user: formData.assignmentScope === "specific" ? formData.user || "" : "",
      userIdentifier: formData.assignmentScope === "specific" ? formData.userIdentifier || "" : "",
      title: formData.title,
      goal: formData.goal,
      fitnessLevel: formData.fitnessLevel,
      dietCategory: state.dietCategory,
      cuisine: DIET_ADMIN_LIBRARY[state.dietCategory].cuisine,
      calorieRange: formData.calorieRange,
      meals: {
        breakfast: state.selectedMeals.breakfast,
        lunch: state.selectedMeals.lunch,
        dinner: state.selectedMeals.dinner,
        snacks: state.selectedMeals.snacks
      },
      hydrationTip: formData.hydrationTip,
      notes: formData.notes
    };

    await apiFetch(
      id ? `/diets/${id}` : "/diets",
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload)
      },
      "admin"
    );

    fillForm();
    mealPanelField.classList.add("hidden");
    setMessage("#pageMessage", id ? "Diet plan updated." : "Diet plan added.", "success");
    loadRecords().catch((error) => setMessage("#pageMessage", error.message));
  });

  fillForm();
  loadRecords().catch((error) => setMessage("#pageMessage", error.message));
};

const loadAdminProgress = async () => {
  ensureAuth("admin");
  try {
    const data = await apiFetch("/admin/progress", {}, "admin");
    renderTableRows(
      "#adminProgressTable",
      data.records.map(
        (item) => `
        <tr>
          <td>${item.user?.name || "-"}</td>
          <td>${new Date(item.date).toLocaleDateString()}</td>
          <td>${item.currentWeight}</td>
          <td>${item.caloriesTaken}</td>
          <td>${item.waterTaken}</td>
          <td>${item.stepsWalked}</td>
          <td>${item.workoutDone}</td>
          <td>${item.note || "-"}</td>
        </tr>
      `
      )
    );
  } catch (error) {
    setMessage("#pageMessage", error.message);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initBrandAssets();
  initSessionPolicy();
  addRequiredIndicators();
  initAuthFormState();
  bindLogoutButtons();

  if (qs("#sortHistory")) {
    qs("#sortHistory").addEventListener("change", loadHistory);
  }

  if (page === "register") initRegister();
  if (page === "login") initLogin();
  if (page === "admin-login") initAdminLogin();
  if (page === "dashboard") loadDashboard();
  if (page === "profile") loadProfile();
  if (page === "bmi") loadBMIPage();
  if (page === "diet-plan") loadDietPlans();
  if (page === "workout-plan" || page === "workout-module") loadWorkoutPlans();
  if (page === "progress") initProgressForm();
  if (page === "history") loadHistory();
  if (page === "tips") loadTips();
  if (page === "admin-dashboard") loadAdminDashboard();
  if (page === "manage-users") loadManageUsers();
  if (page === "view-progress") loadAdminProgress();

  if (page === "manage-diet") {
    initManageDietPlans();
  }

  if (page === "manage-workouts") {
    initManageWorkoutPlans();
  }

  if (page === "manage-tips") {
    initManageTips();
  }
});

