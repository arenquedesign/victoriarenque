/**
 * PORTFOLIO — Script principal
 * Victoria Arenque · Senior Product Designer
 *
 * Dependências (carregadas antes deste script no HTML):
 *   - GSAP 3.12.5    (https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js)
 *   - Lenis 1.0.42   (https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js)
 *
 * Módulos (ordem de execução):
 *   1. Lenis Smooth Scroll — instância global (home page)
 *   2. Custom Cursor Dot   — GSAP quickTo, apenas desktop com mouse
 *   3. Color Scheme on Project Hover — muda bg do body + data-theme
 *   4. Navigation Menu     — GSAP Timeline (não há #menuToggle no HTML atual)
 *   5. Avatar Modal        — CSS transition, sem GSAP
 *   6. Header Text Animation on Scroll — letras animam via classe CSS
 *   7. Toggle Switch       — troca de opção ativa + CustomEvent
 *   8. Smooth Scroll for Anchor Links — via Lenis/scrollIntoView
 *   9. Case Study Bottom Sheet — GSAP + Lenis secundário (lenisCaseSheet)
 */


/* ============================================
   MÓDULO 1: Lenis Smooth Scroll (home page)

   O que faz: Inicializa o smooth scroll global da página principal.
              Roda no RAF (requestAnimationFrame) contínuo junto com
              o Lenis secundário do case sheet.
   Elementos: <html class="lenis"> (adicionado no HTML)
   Config: lerp 0.1, wheelMultiplier 0.7, smoothTouch: false
   Controles via data attributes (para extensibilidade):
     [data-lenis-start]  → lenis.start()
     [data-lenis-stop]   → lenis.stop()
     [data-lenis-toggle] → alterna start/stop
   Nota: lenisCaseSheet é declarado aqui para ficar no escopo global
         e ser acessível pelo módulo do case sheet (instanciado mais abaixo).
============================================ */

// Instâncias secundárias para os case sheets — declaradas aqui para o RAF ter acesso
let lenisCaseSheet  = null;  // Case #1: CRM (year2022)
let lenisCaseSheet2 = null;  // Case #2: Feedback in app (year2023)
let lenisCaseSheet3 = null;  // Case #3: From a new offer to a complete redesign (year2024)

// Instância principal do scroll da home page
const lenis = new Lenis({
  lerp:               0.1,    // suavidade do scroll (0 = instantâneo, 1 = nunca chega)
  wheelMultiplier:    0.7,    // velocidade do scroll com roda do mouse
  gestureOrientation: 'vertical',
  normalizeWheel:     false,
  smoothTouch:        false   // desativa smooth em touch (melhor performance mobile)
});

/**
 * RAF Loop — roda continuamente para atualizar ambas as instâncias Lenis.
 * lenisCaseSheet só é atualizado se estiver instanciado (não null).
 * @param {number} time — timestamp do requestAnimationFrame
 */
function raf(time) {
  lenis.raf(time);
  if (lenisCaseSheet)  lenisCaseSheet.raf(time);
  if (lenisCaseSheet2) lenisCaseSheet2.raf(time);
  if (lenisCaseSheet3) lenisCaseSheet3.raf(time);
  requestAnimationFrame(raf);
}

// Inicia o loop imediatamente
requestAnimationFrame(raf);

// Controles via data attributes (future-proof para botões no HTML)
document.addEventListener('DOMContentLoaded', () => {

  // [data-lenis-start] — libera o scroll
  document.querySelectorAll('[data-lenis-start]').forEach(btn => {
    btn.addEventListener('click', () => lenis.start());
  });

  // [data-lenis-stop] — trava o scroll
  document.querySelectorAll('[data-lenis-stop]').forEach(btn => {
    btn.addEventListener('click', () => lenis.stop());
  });

  // [data-lenis-toggle] — alterna entre start e stop
  document.querySelectorAll('[data-lenis-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (lenis.isStopped) {
        lenis.start();
      } else {
        lenis.stop();
      }
    });
  });

});


/* ============================================
   MÓDULO 2: Custom Cursor Dot

   O que faz: Substitui o cursor padrão do sistema por um ponto circular
              com mix-blend-mode:difference (inverte cor sobre o fundo).
              Só ativa em desktop com mouse real (hover:hover + pointer:fine).
   Elementos: .cursor-dot
   Animação:
     - Posição: gsap.quickTo — duration 0.15s, ease power2 (levemente atrasado)
     - Tamanho default: 20×20px
     - Tamanho hover: 48×48px, duration 0.3s ease power2.out
   Trigger hover: a, button, [role="button"], [data-cursor-dot], .project-item
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Verifica se é desktop com mouse real
  const isDesktop = window.innerWidth > 991;
  const hasHover  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!isDesktop || !hasHover) return; // sai sem fazer nada em touch/mobile

  const cursorDot = document.querySelector('.cursor-dot');
  if (!cursorDot) return;

  // quickTo: cria funções otimizadas que atualizam x/y sem criar novas tweens a cada mousemove
  const xDot = gsap.quickTo(cursorDot, 'x', { duration: 0.15, ease: 'power2' });
  const yDot = gsap.quickTo(cursorDot, 'y', { duration: 0.15, ease: 'power2' });

  // Atualiza posição a cada movimento do mouse
  window.addEventListener('mousemove', (e) => {
    xDot(e.clientX);
    yDot(e.clientY);
  });

  // Elementos que disparam o estado hover do cursor
  const interactiveElements = document.querySelectorAll(
    'a, button, [role="button"], [data-cursor-dot], .project-item'
  );

  interactiveElements.forEach(element => {

    // Hover enter: expande o dot de 20 para 48px
    element.addEventListener('mouseenter', () => {
      cursorDot.classList.add('is-hovering');
      gsap.to(cursorDot, {
        width:    48,
        height:   48,
        duration: 0.3,
        ease:     'power2.out'
      });
    });

    // Hover leave: retorna o dot para 20px
    element.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('is-hovering');
      gsap.to(cursorDot, {
        width:    20,
        height:   20,
        duration: 0.3,
        ease:     'power2.out'
      });
    });

  });

});


/* ============================================
   MÓDULO 3: Color Scheme on Project Hover

   O que faz: Ao passar o mouse em um project-item, muda a cor de fundo
              do body (via style.backgroundColor) e aplica um data-theme
              que ativa um color scheme completo via CSS custom properties.
              Ao sair, retorna ao preto padrão e remove o tema.
   Elementos: .project-item[data-color][data-theme]
              body (recebe backgroundColor inline + atributo data-theme)
   Estados do body:
     mouseenter → body.style.backgroundColor = data-color
                  body.setAttribute('data-theme', data-theme)
     mouseleave → body.style.backgroundColor = '#000000'
                  body.removeAttribute('data-theme')
   Motion: CSS transition background-color 0.6s ease (declarado no body no CSS)
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const projectItems  = document.querySelectorAll('.project-item');
  const body          = document.body;
  const defaultColor  = '#FFFEF8'; // cor padrão da home (cream)

  projectItems.forEach(item => {

    item.addEventListener('mouseenter', () => {
      const color = item.getAttribute('data-color');
      const theme = item.getAttribute('data-theme');

      if (color) body.style.backgroundColor = color;
      if (theme) body.setAttribute('data-theme', theme);
    });

    item.addEventListener('mouseleave', () => {
      body.style.backgroundColor = defaultColor;
      body.removeAttribute('data-theme');
    });

  });

});


/* ============================================
   MÓDULO 4: Navigation Menu (GSAP Timeline)

   O que faz: Anima a abertura e fechamento do menu fullscreen.
              Cria uma GSAP Timeline pausada e a reproduz/inverte
              conforme o estado do menu.
   Elementos:
     #menuToggle           — botão disparador (não presente no HTML atual)
     #navMenu              — container do menu
     .nav-menu__overlay    — fundo blur
     .bg-panel (×3)        — painéis de fundo que deslizam
     .nav-menu__item (×4)  — links do menu
     [data-menu-fade]      — footer com redes sociais
   Timeline (sequência):
     t=0.0s — .menu-toggle__text: y 0 → -100%, 0.4s power3.inOut
     t=0.0s — .menu-toggle__icon: rotation 0 → 315°, 0.4s power3.inOut
     t=0.1s — overlay: opacity 0 → 1, 0.5s power2.out
     t=0.2s — .bg-panel[0→2]: x 100% → 0%, stagger 0.15s, 0.8s expo.out
     t=0.8s — .nav-menu__item: opacity+y 30px → 0, stagger 0.08s, 0.6s power3.out
     t=1.0s — [data-menu-fade]: opacity 0 → 1, 0.5s power2.out
   Estados possíveis: isOpen (bool) | isAnimating (bool — previne spam de cliques)
   Fechar via: ESC key | click em link do menu
============================================ */

/**
 * Inicializa o menu de navegação com GSAP.
 * Chamada quando GSAP está disponível + DOMContentLoaded.
 */
function initMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu    = document.getElementById('navMenu');
  const body       = document.body;

  // Sem o botão toggle no HTML, a função sai silenciosamente
  if (!menuToggle || !navMenu) return;

  // Elementos que participam da animação
  const toggleText   = menuToggle.querySelector('.menu-toggle__text');
  const toggleIcon   = menuToggle.querySelector('.menu-toggle__icon');
  const overlay      = navMenu.querySelector('.nav-menu__overlay');
  const bgPanels     = navMenu.querySelectorAll('.bg-panel');
  const menuItems    = navMenu.querySelectorAll('.nav-menu__item');
  const fadeElements = navMenu.querySelectorAll('[data-menu-fade]');

  // Controle de estado
  let isAnimating = false;
  let isOpen      = false;

  // Timeline GSAP pausada — reproduzida ao abrir, invertida ao fechar
  const tl = gsap.timeline({
    paused: true,
    onStart: () => {
      isAnimating = true;
      navMenu.style.visibility = 'visible';
    },
    onComplete: () => {
      isAnimating = false;
      if (isOpen) body.setAttribute('data-nav', 'open');
    },
    onReverseComplete: () => {
      isAnimating = false;
      body.setAttribute('data-nav', 'closed');
      navMenu.style.visibility = 'hidden';
    }
  });

  // Construção da timeline (valores exatos — não alterar sem conferir no Figma/preview)
  tl
    // Botão toggle: texto sobe + ícone gira para X
    .to(toggleText, { y: '-100%',   duration: 0.4, ease: 'power3.inOut' }, 0)
    .to(toggleIcon, { rotation: 315, duration: 0.4, ease: 'power3.inOut' }, 0)

    // Overlay blur aparece
    .to(overlay,    { opacity: 1,   duration: 0.5, ease: 'power2.out' }, 0.1)

    // 3 painéis deslizam da direita em cascata (stagger 0.15s)
    .fromTo(bgPanels,
      { x: '100%' },
      { x: '0%', duration: 0.8, stagger: 0.15, ease: 'expo.out' },
      0.2
    )

    // Links do menu: fade + slide up (stagger 0.08s)
    .to(menuItems,  { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.8)

    // Footer: fade in
    .to(fadeElements, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.0);

  // Disparador: botão toggle
  menuToggle.addEventListener('click', () => {
    if (isAnimating) return; // previne spam de cliques

    if (!isOpen) {
      // Abrindo
      isOpen = true;
      body.style.overflow = 'hidden'; // trava o scroll da página
      tl.play();
    } else {
      // Fechando
      isOpen = false;
      body.style.overflow = '';       // libera o scroll
      tl.reverse();
    }
  });

  // Fechar ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen && !isAnimating) {
      isOpen = false;
      body.style.overflow = '';
      tl.reverse();
    }
  });

  // Fechar ao clicar em um link do menu
  menuItems.forEach(item => {
    item.querySelector('a').addEventListener('click', () => {
      if (!isAnimating) {
        isOpen = false;
        body.style.overflow = '';
        tl.reverse();
      }
    });
  });
}

// Inicializa apenas se GSAP estiver carregado
if (typeof gsap !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initMenu);
} else {
  console.error('GSAP não carregado. Verifique a ordem dos scripts no HTML.');
}


/* ============================================
   MÓDULO 5: Avatar Modal

   O que faz: Abre/fecha o lightbox com a foto ampliada da Victoria.
              Usa transições CSS (sem GSAP) controladas pela classe .active.
   Elementos:
     #avatarBtn        — avatar no header (dispara abertura)
     #avatarModal      — container do modal
     #closeModalBtn    — botão X dentro do modal
     .avatar-modal__overlay — área clicável para fechar
   Estados:
     fechado: .avatar-modal (sem .active) → opacity:0, pointer-events:none
     aberto:  .avatar-modal.active         → opacity:1, pointer-events:all
   Motion (CSS):
     container: opacity 0→1, 0.4s ease
     content:   scale 0.8→1 + opacity 0→1, 0.4s cubic-bezier(0.34,1.56,0.64,1)
   Acessibilidade: overflow:hidden no body quando aberto (previne scroll)
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const avatarBtn    = document.getElementById('avatarBtn');
  const avatarModal  = document.getElementById('avatarModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalOverlay = avatarModal.querySelector('.avatar-modal__overlay');

  // Abre o modal ao clicar no avatar do header
  avatarBtn.addEventListener('click', () => {
    avatarModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // previne scroll por baixo
  });

  // Fecha ao clicar no botão X
  closeModalBtn.addEventListener('click', () => {
    avatarModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Fecha ao clicar no overlay (fora da foto)
  modalOverlay.addEventListener('click', () => {
    avatarModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Fecha ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && avatarModal.classList.contains('active')) {
      avatarModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

});


/* ============================================
   MÓDULO 6: Header Text Animation on Scroll

   O que faz: Detecta a direção do scroll e adiciona/remove classes
              no .header__text para animar as letras individualmente.
   Elementos: #headerText (.header__text com spans .letter)
   Estados CSS:
     .hiding → letters: opacity:0, translateX(-10px)
     .showing → letters: opacity:1, translateX(0)
   Lógica:
     scroll down (> 50px) → adiciona .hiding, remove .showing
     scroll up             → remove .hiding, adiciona .showing
     volta ao topo (≤ 50px) → remove .hiding, adiciona .showing
   Motion: CSS transition 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) por letra
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const headerText = document.getElementById('headerText');
  let lastScrollY  = window.scrollY;
  let isHidden     = false;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 50 && !isHidden) {
      // Rolando para baixo — esconde o texto
      headerText.classList.remove('showing');
      headerText.classList.add('hiding');
      isHidden = true;

    } else if (currentScrollY < lastScrollY && isHidden) {
      // Rolando para cima — mostra o texto
      headerText.classList.remove('hiding');
      headerText.classList.add('showing');
      isHidden = false;

    } else if (currentScrollY <= 50 && isHidden) {
      // Voltou ao topo — mostra o texto
      headerText.classList.remove('hiding');
      headerText.classList.add('showing');
      isHidden = false;
    }

    lastScrollY = currentScrollY;
  });

});


/* ============================================
   MÓDULO 7: Toggle Switch Functionality

   O que faz: Gerencia o estado ativo dos botões do toggle "Personal / Real cases".
              Remove .toggle__option--active de todos e aplica ao clicado.
              Dispara um CustomEvent 'toggleChanged' para possível uso futuro
              em filtragem de projetos.
   Elementos: .toggle__option (botões dentro de .toggle)
   Estados:
     ativo:   .toggle__option--active (bg sólido, texto escuro)
     inativo: sem a classe (bg transparente)
   CustomEvent: 'toggleChanged' com detail: { option: "personal" | "business" }
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const toggleButtons = document.querySelectorAll('.toggle__option');

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {

      // Remove estado ativo de todos
      toggleButtons.forEach(btn => {
        btn.classList.remove('toggle__option--active');
        btn.setAttribute('aria-selected', 'false');
      });

      // Aplica estado ativo no clicado
      button.classList.add('toggle__option--active');
      button.setAttribute('aria-selected', 'true');

      // Dispara evento customizado (extensível para filtros futuros)
      const selectedOption = button.getAttribute('data-option');
      document.dispatchEvent(new CustomEvent('toggleChanged', {
        detail: { option: selectedOption }
      }));

    });
  });

});


/* ============================================
   MÓDULO 8: Smooth Scroll for Anchor Links

   O que faz: Intercepta cliques em links internos (href="#...") e
              usa scrollIntoView com behavior:'smooth' ao invés do
              comportamento padrão do browser.
   Nota: O Lenis não é usado aqui diretamente pois os links do menu
         levam a seções que podem não existir ainda no HTML.
============================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block:    'start'
      });
    }
  });
});


/* ============================================
   MÓDULO 9: Case Study Bottom Sheet

   O que faz: Controla a abertura e fechamento do painel de case study.
              Usa GSAP para a animação de entrada/saída e um Lenis
              secundário para o scroll interno do painel.
   Elementos:
     #caseSheet                           — container do painel
     #caseSheetClose                      — botão fechar
     .project-item[data-theme="year2022"] — dispara abertura ao click
     .case-sheet__scroll                  — wrapper do Lenis secundário
     .case-sheet__scroll-content          — content do Lenis secundário
     .case-sheet__header                  — usado para calcular threshold do botão
   Animações GSAP:
     openSheet():
       gsap.to(caseSheet, { y: 0, duration: 0.8, ease: 'expo.out' })
     closeSheet():
       gsap.to(caseSheet, { y: '100%', duration: 0.65, ease: 'expo.in' })
   Scroll interno (Lenis secundário — lenisCaseSheet):
     - Inicializado neste módulo e pausado (lenisCaseSheet.stop())
     - Ativado ao abrir (lenisCaseSheet.start())
     - Pausado e resetado ao fechar (lenisCaseSheet.scrollTo(0))
   Controle do botão fechar (inversão de cor):
     - Threshold: sheetHeader.offsetHeight - 55px
     - scroll >= threshold → adiciona .case-sheet__close--inverted (bg navy, ícone cream)
     - scroll < threshold  → remove .case-sheet__close--inverted (bg cream, ícone navy)
   Estados:
     isSheetOpen:  bool — previne dupla abertura
     isAnimating:  bool — previne interrupção durante animação
   Fechar via: #caseSheetClose | ESC key
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const caseSheet      = document.getElementById('caseSheet');
  const caseSheetClose = document.getElementById('caseSheetClose');
  const crmProject     = document.querySelector('.project-item[data-theme="year2022"]');

  // Sai se os elementos não existirem
  if (!caseSheet || !crmProject) return;

  // Elementos internos do case sheet
  const sheetScroll        = caseSheet.querySelector('.case-sheet__scroll');
  const sheetScrollContent = caseSheet.querySelector('.case-sheet__scroll-content');
  const sheetHeader        = caseSheet.querySelector('.case-sheet__header');

  // Instância Lenis secundária para o scroll interno do case sheet
  // lenisCaseSheet é declarado no escopo global para o RAF do Módulo 1
  lenisCaseSheet = new Lenis({
    wrapper:            sheetScroll,        // elemento com overflow:auto
    content:            sheetScrollContent, // elemento que efetivamente rola
    lerp:               0.1,
    wheelMultiplier:    0.7,
    gestureOrientation: 'vertical',
    normalizeWheel:     false,
    smoothTouch:        false
  });

  // Inicia pausado — só ativa ao abrir o painel
  lenisCaseSheet.stop();

  // Controle de estado
  let isSheetOpen = false;
  let isAnimating = false;

  /**
   * Abre o case sheet.
   * - Para o scroll da home (lenis.stop())
   * - Ativa o scroll interno (lenisCaseSheet.start())
   * - GSAP: y 100% → 0, 0.8s expo.out
   */
  function openSheet() {
    if (isAnimating || isSheetOpen) return;
    isAnimating = true;
    isSheetOpen = true;

    caseSheet.setAttribute('aria-hidden', 'false');
    lenis.stop();           // trava scroll da home
    lenisCaseSheet.start(); // libera scroll interno

    gsap.to(caseSheet, {
      y:        0,
      duration: 0.8,         // duration: 0.8s (valor exato — não alterar)
      ease:     'expo.out',  // easing: expo.out (suave ao chegar)
      onComplete: () => { isAnimating = false; }
    });
  }

  /**
   * Fecha o case sheet.
   * - GSAP: y 0 → 100%, 0.65s expo.in
   * - Ao completar: para Lenis interno, reseta scroll para 0, libera home scroll
   *                 remove classe --inverted do botão fechar
   */
  function closeSheet() {
    if (isAnimating || !isSheetOpen) return;
    isAnimating = true;
    isSheetOpen = false;

    gsap.to(caseSheet, {
      y:        '100%',
      duration: 0.65,        // duration: 0.65s (levemente mais rápido ao fechar)
      ease:     'expo.in',   // easing: expo.in (acelera ao sair)
      onComplete: () => {
        caseSheet.setAttribute('aria-hidden', 'true');
        lenisCaseSheet.stop();
        lenisCaseSheet.scrollTo(0, { immediate: true }); // reseta scroll para o topo
        caseSheetClose.classList.remove('case-sheet__close--inverted');
        lenis.start(); // libera scroll da home
        isAnimating = false;
      }
    });
  }

  // Inversão de cor do botão fechar conforme o fundo sob ele
  // Threshold: headerHeight - 55px (55px = ~altura do botão + margem)
  lenisCaseSheet.on('scroll', ({ scroll }) => {
    const threshold = sheetHeader.offsetHeight - 55;

    if (scroll >= threshold) {
      // Botão está sobre a área cream → inverte para navy
      caseSheetClose.classList.add('case-sheet__close--inverted');
    } else {
      // Botão está sobre a área navy → mantém cream
      caseSheetClose.classList.remove('case-sheet__close--inverted');
    }
  });

  // Disparadores
  crmProject.addEventListener('click', openSheet);
  caseSheetClose.addEventListener('click', closeSheet);

  // Fechar via ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSheetOpen) closeSheet();
  });

});


/* ============================================
   MÓDULO 10: Case Study Bottom Sheet — Case #2
   "Feedback in app: efficiency with AI" (year2023)

   Mesmo padrão do Módulo 9, com:
     #caseSheet2        — container do painel
     #caseSheet2Close   — botão fechar
     .project-item[data-theme="year2023"] — dispara abertura
     lenisCaseSheet2    — Lenis secundário para scroll interno
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const caseSheet2      = document.getElementById('caseSheet2');
  const caseSheet2Close = document.getElementById('caseSheet2Close');
  const aiProject       = document.querySelector('.project-item[data-theme="year2023"]');

  if (!caseSheet2 || !aiProject) return;

  const sheet2Scroll        = caseSheet2.querySelector('.case-sheet__scroll');
  const sheet2ScrollContent = caseSheet2.querySelector('.case-sheet__scroll-content');
  const sheet2Header        = caseSheet2.querySelector('.case-sheet__header');

  lenisCaseSheet2 = new Lenis({
    wrapper:            sheet2Scroll,
    content:            sheet2ScrollContent,
    lerp:               0.1,
    wheelMultiplier:    0.7,
    gestureOrientation: 'vertical',
    normalizeWheel:     false,
    smoothTouch:        false
  });

  lenisCaseSheet2.stop();

  let isSheet2Open = false;
  let isAnimating2 = false;

  function openSheet2() {
    if (isAnimating2 || isSheet2Open) return;
    isAnimating2 = true;
    isSheet2Open = true;

    caseSheet2.setAttribute('aria-hidden', 'false');
    lenis.stop();
    lenisCaseSheet2.start();

    gsap.to(caseSheet2, {
      y:        0,
      duration: 0.8,
      ease:     'expo.out',
      onComplete: () => { isAnimating2 = false; }
    });
  }

  function closeSheet2() {
    if (isAnimating2 || !isSheet2Open) return;
    isAnimating2 = true;
    isSheet2Open = false;

    gsap.to(caseSheet2, {
      y:        '100%',
      duration: 0.65,
      ease:     'expo.in',
      onComplete: () => {
        caseSheet2.setAttribute('aria-hidden', 'true');
        lenisCaseSheet2.stop();
        lenisCaseSheet2.scrollTo(0, { immediate: true });
        caseSheet2Close.classList.remove('case-sheet__close--inverted');
        lenis.start();
        isAnimating2 = false;
      }
    });
  }

  lenisCaseSheet2.on('scroll', ({ scroll }) => {
    const threshold = sheet2Header.offsetHeight - 55;
    if (scroll >= threshold) {
      caseSheet2Close.classList.add('case-sheet__close--inverted');
    } else {
      caseSheet2Close.classList.remove('case-sheet__close--inverted');
    }
  });

  aiProject.addEventListener('click', openSheet2);
  caseSheet2Close.addEventListener('click', closeSheet2);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSheet2Open) closeSheet2();
  });

});


/* ============================================
   MÓDULO 11: Case Study Bottom Sheet — Case #3
   "From a new offer to a complete redesign" (year2024)

   Mesmo padrão do Módulo 10, com:
     #caseSheet3        — container do painel
     #caseSheet3Close   — botão fechar
     .project-item[data-theme="year2024"] — dispara abertura
     lenisCaseSheet3    — Lenis secundário para scroll interno
   Inclui lógica do carrossel antes/depois (prev/next).
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const caseSheet3      = document.getElementById('caseSheet3');
  const caseSheet3Close = document.getElementById('caseSheet3Close');
  const designProject   = document.querySelector('.project-item[data-theme="year2024"]');

  if (!caseSheet3 || !designProject) return;

  const sheet3Scroll        = caseSheet3.querySelector('.case-sheet__scroll');
  const sheet3ScrollContent = caseSheet3.querySelector('.case-sheet__scroll-content');
  const sheet3Header        = caseSheet3.querySelector('.case-sheet__header');

  lenisCaseSheet3 = new Lenis({
    wrapper:            sheet3Scroll,
    content:            sheet3ScrollContent,
    lerp:               0.1,
    wheelMultiplier:    0.7,
    gestureOrientation: 'vertical',
    normalizeWheel:     false,
    smoothTouch:        false
  });

  lenisCaseSheet3.stop();

  let isSheet3Open = false;
  let isAnimating3 = false;

  function openSheet3() {
    if (isAnimating3 || isSheet3Open) return;
    isAnimating3 = true;
    isSheet3Open = true;

    caseSheet3.setAttribute('aria-hidden', 'false');
    lenis.stop();
    lenisCaseSheet3.start();

    gsap.to(caseSheet3, {
      y:        0,
      duration: 0.8,
      ease:     'expo.out',
      onComplete: () => { isAnimating3 = false; }
    });
  }

  function closeSheet3() {
    if (isAnimating3 || !isSheet3Open) return;
    isAnimating3 = true;
    isSheet3Open = false;

    gsap.to(caseSheet3, {
      y:        '100%',
      duration: 0.65,
      ease:     'expo.in',
      onComplete: () => {
        caseSheet3.setAttribute('aria-hidden', 'true');
        lenisCaseSheet3.stop();
        lenisCaseSheet3.scrollTo(0, { immediate: true });
        caseSheet3Close.classList.remove('case-sheet__close--inverted');
        lenis.start();
        isAnimating3 = false;
      }
    });
  }

  lenisCaseSheet3.on('scroll', ({ scroll }) => {
    const threshold = sheet3Header.offsetHeight - 55;
    if (scroll >= threshold) {
      caseSheet3Close.classList.add('case-sheet__close--inverted');
    } else {
      caseSheet3Close.classList.remove('case-sheet__close--inverted');
    }
  });

  designProject.addEventListener('click', openSheet3);
  caseSheet3Close.addEventListener('click', closeSheet3);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSheet3Open) closeSheet3();
  });

  // Carrossel antes/depois — botões prev/next movem por card
  const carouselTrack = document.getElementById('caseSheet3CarouselTrack');
  const prevBtn       = document.getElementById('caseSheet3CarouselPrev');
  const nextBtn       = document.getElementById('caseSheet3CarouselNext');

  if (carouselTrack && prevBtn && nextBtn) {
    const getCardWidth = () => {
      const card = carouselTrack.querySelector('.case3-carousel__card');
      return card ? card.offsetWidth + 20 : 600; // largura do card + gap
    };

    prevBtn.addEventListener('click', () => {
      carouselTrack.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      carouselTrack.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
    });
  }

});
