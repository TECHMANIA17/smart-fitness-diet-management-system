window.ChartHelpers = {
  renderWeightChart(canvas, history = []) {
    if (!canvas || typeof Chart === "undefined") {
      return null;
    }

    return new Chart(canvas, {
      type: "line",
      data: {
        labels: history.map((item) => new Date(item.date).toLocaleDateString()),
        datasets: [
          {
            label: "Weight (kg)",
            data: history.map((item) => item.currentWeight),
            borderColor: "#0f766e",
            backgroundColor: "rgba(15,118,110,0.15)",
            tension: 0.35,
            fill: true
          }
        ]
      }
    });
  }
};

