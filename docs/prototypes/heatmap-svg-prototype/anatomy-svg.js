/**
 * LEAN MODE - Anatomy SVG Component
 * Contains scalable vector definitions for anterior and posterior muscle groups.
 * Base Color: #A7A9A5
 */

export const LEAN_MODE_ANATOMY = {
  viewBox: "0 0 1000 1000",
  baseColor: "#A7A9A5",
  strokeColor: "#6B6D69",
  strokeWidth: "1.5",

  anterior: `
    <svg viewBox="0 0 500 1000" xmlns="http://www.w3.org/2000/svg" class="anatomy-svg front-view">
      <!-- Head / Neutral Non-Interactive Base -->
      <path id="head-anterior" class="static-bone" d="M225,50 C200,50 180,70 180,95 C180,120 200,140 225,140 C250,140 270,120 270,95 C270,70 250,50 225,50 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      
      <!-- 1. Chest - Pectoralis Major -->
      <path id="chest-pectoralis-major-left" class="muscle-path" d="M225,170 C190,170 160,185 155,210 C165,235 195,250 225,245 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="chest-pectoralis-major-right" class="muscle-path" d="M225,170 C260,170 290,185 295,210 C285,235 255,250 225,245 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 2. Anterior Deltoids -->
      <path id="anterior-deltoids-left" class="muscle-path" d="M155,210 C140,210 130,225 135,245 C145,250 155,240 160,225 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="anterior-deltoids-right" class="muscle-path" d="M295,210 C310,210 320,225 315,245 C305,250 295,240 290,225 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 3. Lateral Deltoids -->
      <path id="lateral-deltoids-left" class="muscle-path" d="M135,245 C125,250 120,270 130,285 C140,280 145,265 150,250 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="lateral-deltoids-right" class="muscle-path" d="M315,245 C325,250 330,270 320,285 C310,280 305,265 300,250 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 4. Biceps -->
      <path id="biceps-left" class="muscle-path" d="M130,285 C120,310 125,335 135,350 C145,340 145,310 140,290 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="biceps-right" class="muscle-path" d="M320,285 C330,310 325,335 315,350 C305,340 305,310 310,290 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 5. Forearms (Anterior) -->
      <path id="forearms-left" class="muscle-path" d="M125,370 C115,410 115,450 120,480 C130,480 135,430 135,375 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="forearms-right" class="muscle-path" d="M325,370 C335,410 335,450 330,480 C320,480 315,430 315,375 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 6. Abs (Rectus Abdominis) -->
      <path id="abs-rectus-abdominis" class="muscle-path" d="M200,255 C190,255 190,340 200,345 C215,345 225,345 250,345 C260,340 260,255 250,255 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 7. Obliques (External Obliques) -->
      <path id="obliques-left" class="muscle-path" d="M185,255 C170,270 165,300 175,340 C190,340 190,300 185,255 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="obliques-right" class="muscle-path" d="M265,255 C280,270 285,300 275,340 C260,340 260,300 265,255 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 8. Quadriceps -->
      <path id="quadriceps-left" class="muscle-path" d="M175,500 C155,500 145,580 155,670 C175,670 190,580 190,500 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="quadriceps-right" class="muscle-path" d="M275,500 C295,500 305,580 295,670 C275,670 260,580 260,500 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 9. Calves (Anterior visible portion) -->
      <path id="calves-anterior-left" class="muscle-path" d="M160,710 C150,730 150,780 160,820 C170,820 175,780 170,710 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="calves-anterior-right" class="muscle-path" d="M290,710 C300,730 300,780 290,820 C280,820 275,780 280,710 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
    </svg>
  `,

  posterior: `
    <svg viewBox="0 0 500 1000" xmlns="http://www.w3.org/2000/svg" class="anatomy-svg back-view">
      <!-- Head / Neutral Non-Interactive Base -->
      <path id="head-posterior" class="static-bone" d="M225,50 C200,50 180,70 180,95 C180,120 200,140 225,140 C250,140 270,120 270,95 C270,70 250,50 225,50 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 10. Traps (Trapezius) -->
      <path id="traps-trapezius" class="muscle-path" d="M225,145 C190,160 150,200 155,215 C200,230 225,180 250,230 C295,200 260,160 225,145 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 11. Posterior Deltoids -->
      <path id="posterior-deltoids-left" class="muscle-path" d="M155,215 C140,215 130,230 135,250 C145,255 155,240 160,225 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="posterior-deltoids-right" class="muscle-path" d="M295,215 C310,215 320,230 315,250 C305,255 295,240 290,225 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 12. Lateral Deltoids (Posterior extension) -->
      <path id="lateral-deltoids-back-left" class="muscle-path" d="M135,250 C125,255 120,275 130,290 C140,285 145,270 150,255 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="lateral-deltoids-back-right" class="muscle-path" d="M315,250 C325,255 330,275 320,290 C310,285 305,270 300,255 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 13. Lats (Latissimus Dorsi) -->
      <path id="lats-latissimus-dorsi-left" class="muscle-path" d="M190,230 C160,240 145,280 165,330 C185,300 210,260 220,235 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="lats-latissimus-dorsi-right" class="muscle-path" d="M260,230 C290,240 305,280 285,330 C265,300 240,260 230,235 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 14. Triceps -->
      <path id="triceps-left" class="muscle-path" d="M130,290 C120,315 125,340 135,355 C145,345 145,315 140,295 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="triceps-right" class="muscle-path" d="M320,290 C330,315 325,340 315,355 C305,345 305,315 310,295 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 15. Forearms (Posterior) -->
      <path id="forearms-back-left" class="muscle-path" d="M125,375 C115,415 115,455 120,485 C130,485 135,435 135,380 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="forearms-back-right" class="muscle-path" d="M325,375 C335,415 335,455 330,485 C320,485 315,435 315,380 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 16. Lower Back (Erector Spinae) -->
      <path id="lower-back-erector-spinae" class="muscle-path" d="M210,340 C200,340 195,400 210,430 C225,430 240,430 255,430 C270,400 265,340 255,340 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 17. Glutes (Gluteal Muscles) -->
      <path id="glutes-left" class="muscle-path" d="M175,440 C150,440 145,490 170,520 C195,520 210,490 210,450 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="glutes-right" class="muscle-path" d="M275,440 C300,440 305,490 280,520 C255,520 240,490 240,450 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 18. Hamstrings -->
      <path id="hamstrings-left" class="muscle-path" d="M175,530 C155,530 145,610 160,680 C180,680 190,610 190,530 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="hamstrings-right" class="muscle-path" d="M275,530 C295,530 305,610 290,680 C270,680 260,610 260,530 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />

      <!-- 19. Calves (Posterior) -->
      <path id="calves-posterior-left" class="muscle-path" d="M165,710 C145,725 145,780 165,830 C185,830 195,780 185,710 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
      <path id="calves-posterior-right" class="muscle-path" d="M285,710 C305,725 305,780 285,830 C265,830 255,780 265,710 Z" fill="#A7A9A5" stroke="#6B6D69" stroke-width="1.5" />
    </svg>
  `
};