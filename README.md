# Hololive Official Card Game (OCG) - Gacha Simulator & Deck Builder

¡Bienvenido al simulador no oficial de apertura de sobres y construcción de mazos para el **Hololive Official Card Game (OCG)**! Este proyecto está construido con React, Vite y Framer Motion para ofrecer una experiencia inmersiva y satisfactoria al coleccionar cartas digitales de tus idols favoritas.

## ✨ Características Actuales

El proyecto se encuentra en desarrollo activo, pero ya cuenta con un sistema de apertura de sobres completamente funcional y pulido:

- 🛒 **Tienda de Sobres (Shop):**
  - Compra sobres individuales (1 Pack) o cajas selladas enteras (Booster Boxes de 12 sobres).
  - Carrusel animado en 3D que muestra las cartas más raras ("Chase Cards") de la expansión seleccionada.
- 📦 **Motor de Gacha (RNG Realista):**
  - Algoritmo de probabilidad fiel que respeta el *pull rate* y la colación de cajas reales.
  - Las cajas garantizan una distribución matemática correcta (Hits asegurados y distribución de un máximo de 1 carta Cheer de cada tipo por caja).
- ✨ **Coreografía y Físicas 3D:**
  - Animación de desgarro del sobre ("Tear & Shoot"). Las cartas salen disparadas y se apilan en 3D sobre la mesa.
  - Efectos visuales interactivos: Las cartas raras que aún están boca abajo emiten un *aura arcoíris* ("Hit Pre-Glow") para crear anticipación antes de revelarlas.
- 🌈 **Efectos Foil y Holográficos:**
  - Sistema de rarezas dinámicas: Las cartas comunes tienen sutiles auras de luz (Cobre, Plata, Oro, Platino).
  - Las cartas de alta rareza (SR, UR, OUR, SEC) poseen shaders de CSS que emulan el brillo holográfico cósmico real, reaccionando al movimiento del ratón.
  - Animación especial de revelación ("Hit Reveal") con nombres en relieve y destellos cuando consigues una carta valiosa.
- 🔊 **Diseño de Sonido y UI:**
  - Efectos de sonido (SFX) integrados para botones, desgarro de sobres y revelación de Hits.
  - Interfaz de usuario moderna estilo *Glassmorphism* (cristal esmerilado).

- 🃏 **Constructor de Mazos (Deck Builder):**
  - Gestión completa de mazos: Crear, nombrar libremente, duplicar ("Save as New") y cargar mazos guardados de forma persistente en `localStorage` (Zustand).
  - Validación en tiempo real de reglas oficiales (50 cartas en mazo principal, 20 en mazo Cheer, 1 Oshi, máximo 4 copias por carta base).
  - Lógica especial "Extra": Detección automática de reglas de omisión de límite (permite hasta 50 copias para cartas Debut con la regla "any number of this holomem").
  - Panel de **Filtros Avanzados**: Toggles visuales de energía/color (Blanco, Verde, Rojo, Azul, Morado, Amarillo, Neutro) con efectos de brillo neón interactivo, selectores glassmorphic de expansión y rareza, y filtrado unificado en tiempo real.
  - Fondo ambiental animado con orbes de luz asimétricos (Deep/Ice Blue) mediante `framer-motion`.

- 🗂️ **Carpeta de Colección & Playset Overflow (Scrap System):**
  - Visualización 3D interactiva de la colección de cartas obtenidas.
  - Sistema de cálculo de exedente (*Playset Overflow*): Etiquetas visuales carmesí estilo glassmorphism (`Scrap: +[X]`) que indican las cartas duplicadas que superan los límites jugables oficiales.

- ⚙️ **Integridad Económica & Scraping:**
  - Candado de gacha (`obtainable_in_gacha`): Protección matemática que evita que cartas de mazos de inicio o promocionales diluyan las probabilidades de los sobres.
  - Scripts de Puppeteer (`enrich-card-text.cjs`) para extracción de datos de habilidades y textos de cartas desde la web oficial.

## 🚀 Próximamente (En Desarrollo)

- **Sistema de Desguace / Tienda de Canje (Scrap Shop):** Canjear las cartas excedentes (`Scrap`) por polvos o fichas para fabricar cartas específicas.
- **Simulador de Partidas / Motor de Juego (TCG Battle Engine):** Interfaz para probar los mazos construidos en una mesa de juego interactiva.

## 🛠️ Instalación y Uso Local

Si deseas correr este simulador en tu computadora de manera local:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/usmaure-collab/hololive-gacha-tcg.git
   ```
2. Entra al directorio:
   ```bash
   cd hololive-gacha-tcg
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

*Aviso: Este es un proyecto creado por fans con fines de entretenimiento y práctica. No está afiliado ni respaldado por Cover Corp ni Hololive Production.*
