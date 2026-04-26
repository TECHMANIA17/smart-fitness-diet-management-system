(function workoutModule() {
  const page = document.body.dataset.page;
  const storage = window.sessionStorage;

  const qs = (selector) => document.querySelector(selector);
  const qsa = (selector) => [...document.querySelectorAll(selector)];
  const userToken = () => storage.getItem("sfds_user_token") || "";
  const adminToken = () => storage.getItem("sfds_admin_token") || "";

  const apiFetch = async (url, options = {}, role = "user") => {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = role === "admin" ? adminToken() : userToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api${url}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  };

  const setMessage = (selector, message, type = "error") => {
    const element = qs(selector);
    if (!element) return;
    element.textContent = message;
    element.className = `message ${type}`;
  };

  const formatLabel = (value = "") =>
    String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const calculateBMI = (heightCm, weightKg) => {
    const heightM = Number(heightCm) / 100;
    if (!heightM || !weightKg) return "";
    return (Number(weightKg) / (heightM * heightM)).toFixed(1);
  };

  const getCheckedValues = (name) =>
    qsa(`input[name="${name}"]:checked`).map((input) => input.value);

  const WORKOUT_CATEGORY_VISUALS = {
    gym: {
      image: "/assets/images/workout-category-gym.png",
      alt: "Gym workout illustration"
    },
    yoga: {
      image: "/assets/images/workout-category-yoga.png",
      alt: "Yoga workout illustration"
    },
    calisthenics: {
      image: "/assets/images/workout-category-calisthenics.png",
      alt: "Calisthenics workout illustration"
    }
  };

  const updateWorkoutHeroImage = (workoutType = "gym") => {
    const image = qs("#workoutCategoryHeroImage");
    if (!image) return;

    const visual = WORKOUT_CATEGORY_VISUALS[workoutType] || WORKOUT_CATEGORY_VISUALS.gym;
    image.src = visual.image;
    image.alt = visual.alt;
  };

  const getWorkoutCategoryImage = (workoutType = "gym") =>
    (WORKOUT_CATEGORY_VISUALS[workoutType] || WORKOUT_CATEGORY_VISUALS.gym).image;

  const renderPlan = (plan, selector) => {
    const container = qs(selector);
    if (!container) return;

    if (!plan) {
      container.className = "plan-shell empty-state";
      container.textContent = "No workout plan available yet.";
      return;
    }

    container.className = "plan-shell";
    container.innerHTML = `
      <div class="plan-header-card">
        <div>
          <span class="tag">${formatLabel(plan.workoutType || plan.workoutCategory)}</span>
          <span class="tag">${formatLabel(plan.goal)}</span>
          <h2>${plan.title}</h2>
          <p>${plan.summary || plan.weeklySchedule || ""}</p>
          <p class="subtle">${plan.notes || ""}</p>
        </div>
        <div class="summary-card-grid">
          <div class="summary-mini-card"><span>Level</span><strong>${formatLabel(plan.fitnessLevel)}</strong></div>
          <div class="summary-mini-card"><span>Days</span><strong>${plan.assessment?.workoutDaysPerWeek || plan.weeklyPlan?.length || "-"}</strong></div>
          <div class="summary-mini-card"><span>Minutes</span><strong>${plan.assessment?.workoutMinutesPerDay || "-"}</strong></div>
          <div class="summary-mini-card"><span>Calories</span><strong>${plan.totalEstimatedCalories || 0}</strong></div>
        </div>
      </div>
      <div class="workout-history-grid">
        ${(plan.weeklyPlan || [])
          .map(
            (day) => `
              <article class="plan-day-card">
                <div class="plan-day-head">
                  <div>
                    <strong>${day.title}</strong>
                    <div class="subtle">${formatLabel(day.focus)}</div>
                  </div>
                  <span class="tag">${formatLabel(day.difficulty)}</span>
                </div>
                <div class="subtle">Estimated calories: ${day.estimatedCalories || 0}</div>
                <div class="exercise-grid">
                  ${(day.exercises || [])
                    .map(
                      (exercise) => `
                        <div class="exercise-card">
                          <img src="${exercise.image}" alt="${exercise.name}">
                          <div class="exercise-copy">
                            <h4>${exercise.name}</h4>
                            <div class="detail-pairs">
                              <span>${formatLabel(exercise.category)}</span>
                              <span>${formatLabel(exercise.bodyPart)}</span>
                              <span>${formatLabel(exercise.level)}</span>
                            </div>
                            <p><strong>Volume:</strong> ${exercise.sets || "-"} sets ${exercise.reps ? `| ${exercise.reps}` : ""}${exercise.duration ? `| ${exercise.duration}` : ""}</p>
                            <p><strong>Rest:</strong> ${exercise.restSeconds || 0} sec</p>
                            <p class="subtle">${exercise.instructions || ""}</p>
                          </div>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  };

  const renderSavedPlans = (plans, selector, buttonLabel = "Regenerate") => {
    const container = qs(selector);
    if (!container) return;

    if (!plans.length) {
      container.innerHTML = `<div class="empty-state">No saved workout plans yet.</div>`;
      return;
    }

    container.innerHTML = plans
      .map(
        (plan) => `
          <div class="list-item">
            <div class="history-card-head">
              <div>
                <strong>${plan.title}</strong>
                <div class="subtle">${new Date(plan.createdAt).toLocaleString()}</div>
              </div>
              <button type="button" class="btn btn-outline" data-regenerate-id="${plan._id}">${buttonLabel}</button>
            </div>
            <div class="chip-row">
              <span class="tag">${formatLabel(plan.workoutType || plan.workoutCategory)}</span>
              <span class="tag">${formatLabel(plan.goal)}</span>
              <span class="tag">${formatLabel(plan.fitnessLevel)}</span>
            </div>
            <p class="subtle">${plan.summary || plan.weeklySchedule || ""}</p>
          </div>
        `
      )
      .join("");
  };

  const bindRegenerateButtons = (messageSelector, rerender) => {
    qsa("[data-regenerate-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const previousLabel = button.textContent;
        button.disabled = true;
        button.textContent = "Regenerating...";

        try {
          const response = await apiFetch(`/workouts/regenerate/${button.dataset.regenerateId}`, {
            method: "POST"
          });

          setMessage(messageSelector, response.message, "success");
          rerender(response.plan);
        } catch (error) {
          setMessage(messageSelector, error.message);
        } finally {
          button.disabled = false;
          button.textContent = previousLabel;
        }
      });
    });
  };

  const populateAssessmentForm = (profile) => {
    const form = qs("#workoutAssessmentForm");
    if (!form || !profile) return;

    Object.entries(profile).forEach(([key, value]) => {
      const input = form.elements.namedItem(key);
      if (!input || value === undefined || value === null) return;

      if (Array.isArray(input)) return;

      if (key === "equipmentAvailability") {
        const selected = Array.isArray(value) ? value : String(value || "").split(",");
        selected.map((item) => item.trim().toLowerCase()).forEach((item) => {
          const checkbox = qs(`input[name="equipmentAvailability"][value="${item}"]`);
          if (checkbox) checkbox.checked = true;
        });
        return;
      }

      if (key === "injuries" && Array.isArray(value)) {
        input.value = value.join(", ");
        return;
      }

      input.value = value;
    });

    const selectedType = profile.preferredWorkoutType || "gym";
    form.elements.namedItem("workoutTypePreference").value = selectedType;
    qsa("[data-workout-type]").forEach((button) => {
      button.classList.toggle("active", button.dataset.workoutType === selectedType);
    });
    updateWorkoutHeroImage(selectedType);

    const bmiInput = qs("#bmiPreview");
    if (bmiInput) {
      bmiInput.value = calculateBMI(profile.heightCm, profile.weightKg);
    }
  };

  const initWorkoutPlannerPage = async () => {
    const form = qs("#workoutAssessmentForm");
    if (!form) return;

    const refreshSavedPlans = async (latestPlan) => {
      if (latestPlan) {
        renderPlan(latestPlan, "#workoutPlanOutput");
      }

      const savedResponse = await apiFetch("/workouts/saved");
      renderSavedPlans(savedResponse.plans || [], "#savedWorkoutPlans");
      bindRegenerateButtons("#pageMessage", refreshSavedPlans);
    };

    try {
      const [profileResponse, savedResponse] = await Promise.all([
        apiFetch("/users/profile"),
        apiFetch("/workouts/saved")
      ]);

      populateAssessmentForm(profileResponse.profile);
      renderSavedPlans(savedResponse.plans || [], "#savedWorkoutPlans");
      bindRegenerateButtons("#pageMessage", refreshSavedPlans);
    } catch (error) {
      setMessage("#pageMessage", error.message);
    }

    ["heightCm", "weightKg"].forEach((name) => {
      const input = form.elements.namedItem(name);
      if (!input) return;
      input.addEventListener("input", () => {
        qs("#bmiPreview").value = calculateBMI(form.heightCm.value, form.weightKg.value);
      });
    });

    qsa("[data-workout-type]").forEach((button) => {
      button.addEventListener("click", () => {
        qsa("[data-workout-type]").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        const workoutType = button.dataset.workoutType;
        form.elements.namedItem("workoutTypePreference").value = workoutType;
        updateWorkoutHeroImage(workoutType);
      });
    });

    updateWorkoutHeroImage(form.elements.namedItem("workoutTypePreference")?.value || "gym");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = Object.fromEntries(new FormData(form).entries());
      const payload = {
        ...formData,
        equipmentAvailability: getCheckedValues("equipmentAvailability"),
        age: Number(formData.age),
        heightCm: Number(formData.heightCm),
        weightKg: Number(formData.weightKg),
        workoutDaysPerWeek: Number(formData.workoutDaysPerWeek),
        workoutMinutesPerDay: Number(formData.workoutMinutesPerDay),
        bmi: Number(formData.bmi)
      };

      qs("#workoutPlanOutput").className = "plan-shell loading-state";
      qs("#workoutPlanOutput").textContent = "Generating your weekly plan...";

      try {
        const response = await apiFetch("/workouts/generate", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        setMessage("#pageMessage", response.message, "success");
        await refreshSavedPlans(response.plan);
      } catch (error) {
        setMessage("#pageMessage", error.message);
        qs("#workoutPlanOutput").className = "plan-shell empty-state";
        qs("#workoutPlanOutput").textContent = "Unable to generate a plan with the current inputs.";
      }
    });
  };

  const initWorkoutHistoryPage = async () => {
    const renderHistory = async (message) => {
      if (message) {
        setMessage("#historyMessage", message, "success");
      }

      const response = await apiFetch("/workouts/history");
      const plans = response.plans || [];
      const list = qs("#workoutHistoryList");

      if (!plans.length) {
        list.innerHTML = `<div class="empty-state">No workout history available yet.</div>`;
        return;
      }

      list.innerHTML = plans
        .map(
          (plan) => `
            <div class="list-item">
              <div class="history-card-head">
                <div>
                  <strong>${plan.title}</strong>
                  <div class="subtle">${new Date(plan.createdAt).toLocaleString()}</div>
                </div>
                <button type="button" class="btn btn-outline" data-regenerate-id="${plan._id}">Regenerate</button>
              </div>
              <div class="chip-row">
                <span class="tag">${formatLabel(plan.workoutType || plan.workoutCategory)}</span>
                <span class="tag">${formatLabel(plan.goal)}</span>
                <span class="tag">${plan.assessment?.workoutDaysPerWeek || plan.weeklyPlan?.length || 0} days</span>
                <span class="tag">${plan.totalEstimatedCalories || 0} cal</span>
              </div>
              <p class="subtle">${plan.summary || ""}</p>
            </div>
          `
        )
        .join("");

      bindRegenerateButtons("#historyMessage", async () => {
        await renderHistory("Workout plan regenerated.");
      });
    };

    try {
      await renderHistory();
    } catch (error) {
      setMessage("#historyMessage", error.message);
    }
  };

  const initAdminWorkoutPage = async () => {
    let adminExercises = [];
    let adminUsers = [];
    let selectedExerciseIds = new Set();

    const parseCsv = (value) =>
      String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const resetExerciseForm = () => {
      const form = qs("#adminExerciseForm");
      if (!form) return;
      form.reset();
      form.elements.namedItem("id").value = "";
      form.elements.namedItem("workoutType").value = "gym";
      form.elements.namedItem("level").value = "beginner";
      form.elements.namedItem("restSeconds").value = "30";
    };

    const renderExerciseCards = () => {
      const typeFilter = qs("#exerciseTypeFilter")?.value || "all";
      const levelFilter = qs("#exerciseLevelFilter")?.value || "all";
      const filtered = adminExercises.filter((exercise) => {
        const typeMatch = typeFilter === "all" || exercise.workoutType === typeFilter;
        const levelMatch = levelFilter === "all" || exercise.level === levelFilter;
        return typeMatch && levelMatch;
      });

      qs("#exerciseLibraryColumns").innerHTML = filtered.length
        ? filtered
            .map(
              (exercise) => `
                <div class="exercise-admin-card">
                  <img src="${getWorkoutCategoryImage(exercise.workoutType)}" alt="${formatLabel(exercise.workoutType)} workout illustration">
                  <div class="exercise-copy">
                    <div class="history-card-head">
                      <div>
                        <strong>${exercise.name}</strong>
                        <div class="subtle">${formatLabel(exercise.workoutType)} | ${formatLabel(exercise.level)}</div>
                      </div>
                      <div class="chip-row">
                        <button type="button" class="btn btn-outline" data-edit-exercise="${exercise._id}">Edit</button>
                        <button type="button" class="btn btn-danger" data-delete-exercise="${exercise._id}">Delete</button>
                      </div>
                    </div>
                    <div class="chip-row">
                      <span class="tag">${formatLabel(exercise.category)}</span>
                      <span class="tag">${formatLabel(exercise.bodyPart)}</span>
                      <span class="tag">${formatLabel(exercise.equipment)}</span>
                    </div>
                    <p><strong>Volume:</strong> ${exercise.sets || "-"} sets ${exercise.reps ? `| ${exercise.reps}` : ""}${exercise.duration ? `| ${exercise.duration}` : ""}</p>
                    <p class="subtle">${exercise.instructions}</p>
                  </div>
                </div>
              `
            )
            .join("")
        : `<div class="empty-state">No exercises match the current filters.</div>`;

      qsa("[data-edit-exercise]").forEach((button) => {
        button.addEventListener("click", () => {
          const exercise = adminExercises.find((item) => item._id === button.dataset.editExercise);
          if (!exercise) return;
          const form = qs("#adminExerciseForm");
          form.elements.namedItem("id").value = exercise._id;
          form.elements.namedItem("name").value = exercise.name || "";
          form.elements.namedItem("slug").value = exercise.slug || "";
          form.elements.namedItem("workoutType").value = exercise.workoutType || "gym";
          form.elements.namedItem("level").value = exercise.level || "beginner";
          form.elements.namedItem("category").value = exercise.category || "";
          form.elements.namedItem("bodyPart").value = exercise.bodyPart || "";
          form.elements.namedItem("equipment").value = exercise.equipment || "";
          form.elements.namedItem("sets").value = exercise.sets || "";
          form.elements.namedItem("reps").value = exercise.reps || "";
          form.elements.namedItem("duration").value = exercise.duration || "";
          form.elements.namedItem("restSeconds").value = exercise.restSeconds || 0;
          form.elements.namedItem("caloriesBurnEstimate").value = exercise.caloriesBurnEstimate || "";
          form.elements.namedItem("image").value = exercise.image || "";
          form.elements.namedItem("goalTags").value = (exercise.goalTags || []).join(", ");
          form.elements.namedItem("contraindications").value = (exercise.contraindications || []).join(", ");
          form.elements.namedItem("instructions").value = exercise.instructions || "";
        });
      });

      qsa("[data-delete-exercise]").forEach((button) => {
        button.addEventListener("click", async () => {
          try {
            await apiFetch(`/workouts/exercises/${button.dataset.deleteExercise}`, { method: "DELETE" }, "admin");
            await loadAdminData("Exercise deleted.");
          } catch (error) {
            setMessage("#pageMessage", error.message);
          }
        });
      });
    };

    const renderPlanExercisePicker = () => {
      const workoutType = qs("#adminPlanWorkoutType")?.value || "gym";
      const fitnessLevel = qs('#adminUserPlanForm [name="fitnessLevel"]')?.value || "beginner";
      const levelMap = {
        beginner: "beginner",
        moderate: "moderate",
        advanced: "advanced"
      };
      const filtered = adminExercises.filter(
        (exercise) => exercise.workoutType === workoutType && exercise.level === levelMap[fitnessLevel]
      );

      qs("#adminPlanExercisePicker").innerHTML = filtered
        .map(
          (exercise) => `
            <label class="picker-exercise-card ${selectedExerciseIds.has(exercise._id) ? "active" : ""}">
              <input type="checkbox" value="${exercise._id}" ${selectedExerciseIds.has(exercise._id) ? "checked" : ""}>
              <img src="${getWorkoutCategoryImage(exercise.workoutType)}" alt="${formatLabel(exercise.workoutType)} workout illustration">
              <strong>${exercise.name}</strong>
              <span>${formatLabel(exercise.level)} | ${formatLabel(exercise.bodyPart)}</span>
            </label>
          `
        )
        .join("");

      qsa("#adminPlanExercisePicker input[type='checkbox']").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedExerciseIds.add(checkbox.value);
          } else {
            selectedExerciseIds.delete(checkbox.value);
          }
          checkbox.closest(".picker-exercise-card")?.classList.toggle("active", checkbox.checked);
        });
      });
    };

    const renderUsers = () => {
      const select = qs("#adminWorkoutUserSelect");
      if (!select) return;

      select.innerHTML = adminUsers.length
        ? `<option value="">Select user when specific</option>${adminUsers.map((user) => `<option value="${user._id}">${user.name} (${user.email})</option>`).join("")}`
        : `<option value="">No users found</option>`;
    };

    const loadAdminData = async (message) => {
      const [overviewResponse, userResponse] = await Promise.all([
        apiFetch("/workouts/admin/overview", {}, "admin"),
        apiFetch("/admin/users", {}, "admin")
      ]);

      const stats = overviewResponse.stats || {};
      adminExercises = overviewResponse.exercises || [];
      adminUsers = userResponse.users || [];
      const plans = overviewResponse.plans || [];

      if (message) {
        setMessage("#pageMessage", message, "success");
      }

      qs("#adminWorkoutStats").innerHTML = `
        <div class="stat-card"><div class="label">Total Exercises</div><div class="value">${stats.totalExercises || 0}</div></div>
        <div class="stat-card"><div class="label">Generated Plans</div><div class="value">${stats.totalPlans || 0}</div></div>
        ${((stats.byWorkoutType || [])).map((item) => `<div class="stat-card"><div class="label">${formatLabel(item.workoutType)}</div><div class="value">${item.count}</div></div>`).join("")}
      `;

      qs("#adminLevelBreakdown").innerHTML = (stats.byLevel || [])
        .map((item) => `<div class="list-item"><strong>${formatLabel(item.level)}</strong><div class="subtle">${item.count} exercises in the database.</div></div>`)
        .join("");

      qs("#adminWorkoutPlansTable").innerHTML = plans.length
        ? plans
            .map(
              (plan) => `
                <tr>
                  <td>${plan.user?.name || "Unknown user"}</td>
                  <td>${formatLabel(plan.workoutType || plan.workoutCategory)}</td>
                  <td>${formatLabel(plan.goal)}</td>
                  <td>${formatLabel(plan.fitnessLevel)}</td>
                  <td>${plan.assessment?.workoutDaysPerWeek || plan.weeklyPlan?.length || "-"}</td>
                  <td>${new Date(plan.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button class="btn btn-outline" data-edit-admin-plan="${plan._id}">Edit</button>
                    <button class="btn btn-danger" data-delete-admin-plan="${plan._id}">Delete</button>
                  </td>
                </tr>
              `
            )
            .join("")
        : `<tr><td colspan="7">No generated workout plans yet.</td></tr>`;

      qsa("[data-edit-admin-plan]").forEach((button) => {
        button.addEventListener("click", () => {
          const plan = plans.find((item) => item._id === button.dataset.editAdminPlan);
          const form = qs("#adminUserPlanForm");
          if (!plan || !form) return;

          form.elements.namedItem("id").value = plan._id;
          form.elements.namedItem("assignmentScope").value = plan.user ? "specific" : "general";
          form.elements.namedItem("user").value = plan.user?._id || "";
          form.elements.namedItem("userIdentifier").value = plan.user?.email || "";
          form.elements.namedItem("title").value = plan.title || "";
          form.elements.namedItem("goal").value = plan.goal || "weight_loss";
          form.elements.namedItem("fitnessLevel").value = plan.fitnessLevel || "beginner";
          form.elements.namedItem("workoutType").value = plan.workoutType || plan.workoutCategory || "gym";
          form.elements.namedItem("workoutDaysPerWeek").value = plan.assessment?.workoutDaysPerWeek || plan.weeklyPlan?.length || 3;
          form.elements.namedItem("workoutMinutesPerDay").value = plan.assessment?.workoutMinutesPerDay || 45;
          form.elements.namedItem("duration").value = plan.duration || "";
          form.elements.namedItem("weeklySchedule").value = plan.weeklySchedule || "";
          form.elements.namedItem("notes").value = plan.notes || "";
          selectedExerciseIds = new Set((plan.exercises || []).map((exercise) => exercise.exerciseId || exercise._id).filter(Boolean).map(String));
          renderPlanExercisePicker();
          setMessage("#pageMessage", "Workout plan loaded into the form for editing.", "success");
        });
      });

      qsa("[data-delete-admin-plan]").forEach((button) => {
        button.addEventListener("click", async () => {
          try {
            await apiFetch(`/workouts/${button.dataset.deleteAdminPlan}`, { method: "DELETE" }, "admin");
            await loadAdminData("Workout plan deleted.");
          } catch (error) {
            setMessage("#pageMessage", error.message);
          }
        });
      });

      renderExerciseCards();
      renderUsers();
      renderPlanExercisePicker();
    };

    try {
      await loadAdminData();
    } catch (error) {
      setMessage("#pageMessage", error.message);
    }

    qs("#exerciseTypeFilter")?.addEventListener("change", renderExerciseCards);
    qs("#exerciseLevelFilter")?.addEventListener("change", renderExerciseCards);
    qs("#adminPlanWorkoutType")?.addEventListener("change", () => {
      selectedExerciseIds = new Set();
      renderPlanExercisePicker();
    });
    qs('#adminUserPlanForm [name="fitnessLevel"]')?.addEventListener("change", () => {
      selectedExerciseIds = new Set();
      renderPlanExercisePicker();
    });
    qs("#resetExerciseForm")?.addEventListener("click", resetExerciseForm);
    qs("#resetAdminPlanForm")?.addEventListener("click", () => {
      qs("#adminUserPlanForm")?.reset();
      const planForm = qs("#adminUserPlanForm");
      if (planForm) {
        planForm.elements.namedItem("assignmentScope").value = "general";
        planForm.elements.namedItem("user").value = "";
        planForm.elements.namedItem("userIdentifier").value = "";
      }
      selectedExerciseIds = new Set();
      renderPlanExercisePicker();
    });

    qs("#adminExerciseForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = Object.fromEntries(new FormData(form).entries());
      const payload = {
        ...formData,
        sets: formData.sets ? Number(formData.sets) : undefined,
        restSeconds: Number(formData.restSeconds),
        caloriesBurnEstimate: formData.caloriesBurnEstimate ? Number(formData.caloriesBurnEstimate) : undefined,
        goalTags: parseCsv(formData.goalTags),
        contraindications: parseCsv(formData.contraindications)
      };

      const id = formData.id;
      delete payload.id;

      try {
        await apiFetch(id ? `/workouts/exercises/${id}` : "/workouts/exercises", {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(payload)
        }, "admin");
        resetExerciseForm();
        await loadAdminData(id ? "Exercise updated." : "Exercise added.");
      } catch (error) {
        setMessage("#pageMessage", error.message);
      }
    });

    qs("#adminUserPlanForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = Object.fromEntries(new FormData(form).entries());

      if (!selectedExerciseIds.size) {
        setMessage("#pageMessage", "Select at least one exercise for the workout plan.");
        return;
      }

      if (formData.assignmentScope === "specific" && !formData.user && !formData.userIdentifier) {
        setMessage("#pageMessage", "Specific workout plan is mandatory to assign to a selected user or user email/ID.");
        return;
      }

      try {
        const id = formData.id;
        await apiFetch(id ? `/workouts/${id}` : "/workouts", {
          method: id ? "PUT" : "POST",
          body: JSON.stringify({
            ...formData,
            user: formData.assignmentScope === "specific" ? formData.user || "" : "",
            userIdentifier: formData.assignmentScope === "specific" ? formData.userIdentifier || "" : "",
            exerciseIds: [...selectedExerciseIds],
            workoutDaysPerWeek: Number(formData.workoutDaysPerWeek),
            workoutMinutesPerDay: Number(formData.workoutMinutesPerDay)
          })
        }, "admin");

        form.reset();
        form.elements.namedItem("assignmentScope").value = "general";
        selectedExerciseIds = new Set();
        renderPlanExercisePicker();
        await loadAdminData(id ? "Workout plan updated." : "Workout plan saved.");
      } catch (error) {
        setMessage("#pageMessage", error.message);
      }
    });
  };

  if (page === "workout-module") {
    initWorkoutPlannerPage();
  }

  if (page === "workout-history") {
    initWorkoutHistoryPage();
  }

  if (page === "admin-workout-module") {
    initAdminWorkoutPage();
  }
})();
