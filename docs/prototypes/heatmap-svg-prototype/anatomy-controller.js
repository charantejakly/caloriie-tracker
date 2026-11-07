/**
 * LEAN MODE - Anatomy Heatmap Controller
 * Manages color tiers, DOM rendering, tooltips, and user interactions.
 */

export const HEATMAP_TIERS = {
  0: "#A7A9A5", // Neutral / Untrained (Default Base)
  1: "#D1E7DD", // Tier 1: Light activation / Recovery
  2: "#A3CFBB", // Tier 2: Moderate volume
  3: "#FFD166", // Tier 3: High volume / Intense
  4: "#EF476F"  // Tier 4: Maximum volume / Peak exhaustion
};

export class MuscleHeatmapController {
  constructor(containerIdFront, containerIdBack) {
    this.frontContainer = document.getElementById(containerIdFront);
    this.backContainer = document.getElementById(containerIdBack);
    this.muscleData = {};
  }

  render(anatomyModule) {
    if (this.frontContainer) this.frontContainer.innerHTML = anatomyModule.anterior;
    if (this.backContainer) this.backContainer.innerHTML = anatomyModule.posterior;
    this.initInteractivity();
  }

  setMuscleIntensity(muscleId, tierLevel) {
    const color = HEATMAP_TIERS[tierLevel] || HEATMAP_TIERS[0];
    const element = document.getElementById(muscleId);
    
    if (element) {
      element.setAttribute('fill', color);
      this.muscleData[muscleId] = tierLevel;
    } else {
      console.warn(`Muscle path ID '${muscleId}' not found in DOM.`);
    }
  }

  applyWorkoutData(dataMap) {
    for (const [muscleId, tier] of Object.entries(dataMap)) {
      this.setMuscleIntensity(muscleId, tier);
    }
  }

  resetHeatmap() {
    for (const muscleId of Object.keys(this.muscleData)) {
      this.setMuscleIntensity(muscleId, 0);
    }
    this.muscleData = {};
  }

  initInteractivity(onMuscleClickCallback) {
    const allPaths = document.querySelectorAll('.muscle-path');

    let tooltip = document.getElementById('lean-mode-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'lean-mode-tooltip';
      tooltip.style.cssText = `
        position: absolute; background: rgba(30, 30, 30, 0.95); color: #fff;
        padding: 8px 12px; border-radius: 6px; font-size: 12px; pointer-events: none;
        display: none; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1); font-family: sans-serif;
      `;
      document.body.appendChild(tooltip);
    }

    allPaths.forEach(path => {
      const muscleId = path.id;
      const readableName = muscleId.replace(/-/g, ' ').toUpperCase();

      path.addEventListener('mouseenter', (e) => {
        const tier = this.muscleData[muscleId] || 0;
        tooltip.innerHTML = `<strong>${readableName}</strong><br>Intensity Tier: ${tier}`;
        tooltip.style.display = 'block';
      });

      path.addEventListener('mousemove', (e) => {
        tooltip.style.left = `${e.pageX + 15}px`;
        tooltip.style.top = `${e.pageY + 15}px`;
      });

      path.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      path.addEventListener('click', () => {
        if (onMuscleClickCallback) {
          onMuscleClickCallback(muscleId, this.muscleData[muscleId] || 0);
        }
      });
    });
  }
}