        // --- 1. LÓGICA DEL HORARIO DINÁMICO ---
        function actualizarEstado() {
            const badge = document.getElementById('status-badge');
            const texto = document.getElementById('status-texto');
            
            const ahora = new Date();
            const dia = ahora.getDay(); // 0 = Domingo, 1 = Lunes ... 6 = Sábado
            const hora = ahora.getHours();
            const minutos = ahora.getMinutes();
            const horaDecimal = hora + (minutos / 60);

            const estaAbierto = (dia >= 1 && dia <= 6) && (horaDecimal >= 12 && horaDecimal < 21);

            if (estaAbierto) {
                badge.className = 'status-badge abierto';
                texto.innerText = 'Abierto · hasta las 21:00';
            } else {
                badge.className = 'status-badge cerrado';
                texto.innerText = 'Cerrado · abre a las 12:00';
            }
        }
        actualizarEstado();
        setInterval(actualizarEstado, 60000);

        // --- 2. ANIMACIÓN MÁQUINA DE ESCRIBIR ---
        document.addEventListener("DOMContentLoaded", () => {
            const frase = "Un plan perfecto para compartir ✨";
            const esloganElement = document.getElementById('eslogan');
            const cursorElement = document.getElementById('cursor');
            let i = 0;

            setTimeout(() => {
                cursorElement.classList.add('visible');
                
                const typingInterval = setInterval(() => {
                    if (i < frase.length) {
                        esloganElement.textContent += frase.charAt(i);
                        esloganElement.classList.add('escribiendo');
                        i++;
                    } else {
                        clearInterval(typingInterval);
                        setTimeout(() => {
                            cursorElement.style.display = 'none'; 
                        }, 2000);
                    }
                }, 60);
            }, 1800); 
        });

        // --- 3. CARGA DE PRODUCTOS (PAPA PARSE) ---
        const URL_EXCEL_ONLINE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQuDPwl8KnDktQTmb7Ie8CLSkcNIZe531NpUOXJlo4Ol5vLnOQpfQB_hSsVz6rSbW2J411zs7qFy8R8/pub?output=csv';
        let todosLosProductos = [];

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    card.classList.add('visible');
                    // Limpia el transitionDelay una vez visible para que el hover y clic sean instantáneos
                    setTimeout(() => {
                        card.style.transitionDelay = '0s';
                    }, 600);
                    observer.unobserve(card);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

        document.addEventListener("DOMContentLoaded", () => {
            Papa.parse(URL_EXCEL_ONLINE, {
                download: true, header: true, skipEmptyLines: true,
                complete: function(results) {
                    if(results.data && results.data.length > 0) {
                        todosLosProductos = results.data.map(fila => {
                            const filaLimpia = {};
                            for (let llave in fila) {
                                if (fila.hasOwnProperty(llave)) {
                                    let nombreColumna = llave.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                    filaLimpia[nombreColumna] = fila[llave] ? String(fila[llave]).trim() : '';
                                }
                            }
                            return filaLimpia;
                        }).filter(p => p.nombre && p.nombre !== '');

                        crearBotonesCategorias(todosLosProductos);
                        renderizarProductos(todosLosProductos, 'todos');
                    } else {
                        mostrarError("El menú está vacío.");
                    }
                },
                error: function() { mostrarError("Error al conectar con la cocina."); }
            });
        });

        function formatearPrecio(valor) {
            if (!valor) return '$0';
            let numero = String(valor).replace(/[^0-9]/g, '');
            return numero ? '$' + parseInt(numero).toLocaleString('es-CL') : '$0';
        }

        function crearBotonesCategorias(productos) {
            const contenedor = document.getElementById('filtros-container');
            const categorias = [...new Set(productos.map(p => p.categoria))].filter(c => c);

            categorias.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'btn-filtro';
                btn.innerText = cat;
                btn.onclick = function() { filtrarProductos(cat, this); };
                contenedor.appendChild(btn);
            });
        }

        function filtrarProductos(categoria, boton) {
            document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('activo'));
            boton.classList.add('activo');

            let filtrados = todosLosProductos;
            if (categoria !== 'todos') {
                filtrados = todosLosProductos.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
            }
            renderizarProductos(filtrados, categoria);
        }

        function renderizarProductos(productos, categoria) {
            const contenedor = document.getElementById('contenedor-productos');
            contenedor.innerHTML = '';

            if (productos.length === 0) {
                contenedor.innerHTML = '<p style="text-align: center; color: var(--texto-gris);">No hay platos en esta categoría.</p>';
                return;
            }

            if (categoria === 'todos') {
                const categorias = [...new Set(productos.map(p => p.categoria))].filter(c => c);
                
                categorias.forEach(cat => {
                    const header = document.createElement('div');
                    header.className = 'categoria-titulo';
                    header.innerHTML = `${cat} <span>Selección</span>`;
                    contenedor.appendChild(header);

                    const grid = document.createElement('div');
                    grid.className = 'grid';
                    contenedor.appendChild(grid);

                    const prodsCat = productos.filter(p => p.categoria === cat);
                    dibujarTarjetas(prodsCat, grid);
                });
            } else {
                const grid = document.createElement('div');
                grid.className = 'grid';
                contenedor.appendChild(grid);
                dibujarTarjetas(productos, grid);
            }
        }

        function dibujarTarjetas(lista, contenedor) {
            lista.forEach((prod, i) => {
                const precio = formatearPrecio(prod.precio);
                const oferta = prod.oferta ? formatearPrecio(prod.oferta) : null;
                const precioFinalTexto = oferta || precio;
                const imagen = (prod.imagen && prod.imagen.startsWith('http')) ? prod.imagen : 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop';

                const card = document.createElement('div');
                card.className = 'card';
                card.style.transitionDelay = `${(i % 6) * 0.08}s`;

                const id = 'card-' + Math.random().toString(36).substr(2, 9);
                card.id = id;

                const tagOferta = oferta ? `<div class="tag-oferta">Oferta Especial</div>` : '';

                let precioHTML = oferta ? 
                    `<span class="precio-viejo">${precio}</span>
                     <span class="precio-final">${oferta}</span>` :
                    `<span class="precio-final">${precio}</span>`;

                const mensajeWA = encodeURIComponent(`Hola Lobello! Quisiera pedir: ${prod.nombre} (${precioFinalTexto})`);
                const linkWA = `https://wa.me/56999576855?text=${mensajeWA}`;

                card.innerHTML = `
                    <div class="card-img-wrapper">
                        ${tagOferta}
                        <img src="${imagen}" alt="${prod.nombre}" onerror="this.src='https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop'">
                    </div>
                    <div class="card-info">
                        <div class="card-header">
                            <h3 class="card-nombre">${prod.nombre}</h3>
                            <div class="precio-box">${precioHTML}</div>
                        </div>
                        <p class="card-desc">${prod.descripcion || 'El mejor sabor de la casa.'}</p>
                        <div class="card-actions">
                            <button class="btn-expandir" onclick="toggleExpandir('${id}', this)">Ver Detalle</button>
                            <a href="${linkWA}" target="_blank" class="btn-pedir-wa">Pedir por WhatsApp ↗</a>
                        </div>
                    </div>
                `;

                contenedor.appendChild(card);
                observer.observe(card);
            });
        }

        function toggleExpandir(id, btn) {
            const card = document.getElementById(id);
            const estabaExpandida = card.classList.contains('expandida');

            // Cerrar cualquier otra abierta primero
            document.querySelectorAll('.card.expandida').forEach(c => {
                c.classList.remove('expandida');
                c.querySelector('.btn-expandir').innerHTML = 'Ver Detalle';
            });

            if (!estabaExpandida) {
                card.style.transitionDelay = '0s';
                card.classList.add('expandida');
                btn.innerHTML = 'Cerrar';

                // Esperar al siguiente frame tras el reflow del grid para hacer scroll suave sin tirones
                requestAnimationFrame(() => {
                    const y = card.getBoundingClientRect().top + window.scrollY - 110;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                });
            }
        }

        function mostrarError(msg) {
            document.getElementById('contenedor-productos').innerHTML = `
                <div style="text-align: center; padding: 40px; border: 1px solid rgba(255,0,0,0.3); background: rgba(255,0,0,0.1); border-radius: 20px; color: #ff4444; font-family: var(--fuente-titulo);">
                    <h3>Fallo en la conexión</h3>
                    <p style="font-family: var(--fuente-cuerpo); font-size: 0.9rem; margin-top: 10px;">${msg}</p>
                </div>
            `;
        }