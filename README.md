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

## 🚀 Próximamente (En Desarrollo)

- **Inventario / Carpeta de Colección:** Un espacio dedicado para ver, ordenar, y filtrar por idols todas las cartas que has conseguido.
- **Deck Builder:** Herramienta para armar mazos competitivos que respeta las reglas oficiales del juego (Mazo principal de 50 cartas, Mazo de 20 cartas Cheer, máximo de 4 copias de la misma carta, etc).

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
