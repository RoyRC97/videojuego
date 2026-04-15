var juego = new Phaser.Game(1280, 880, Phaser.CANVAS, 'canvas');

var fondo, music, plataformas, arbol;

var personaje_1, manzanas, monedas;

var arriba, izquierda, derecha;

var emitterLluvia, emitterHojas;

var musicaGameOver;

var moustro1, moustro2, moustro3;

var vidas = 3;

var puntos = 0;

var textoVidas, textoPuntos;

var btnPausa, btnRestar, btnSalir;

var sfxMoneda, sfxManzana,sfxBoton, sfxDaño, sfxCaida;

var arma, teclaFuego;
var modoDosJugadores = false; // ¿Son 1 o 2 jugadores?
var turnoJugador = 1;        // Indica quién está jugando ahora
var personajeP1 = 'monito';  // Personaje elegido por el J1
var personajeP2 = 'monito2'; // Personaje elegido por el J2 (si aplica)

// Vidas y puntos independientes para el modo 2 jugadores
var vidasP1 = 3, puntosP1 = 0;
var vidasP2 = 3, puntosP2 = 0;


var EstadoInicio = {
    fondoMenu: null,

    preload: function() {
        juego.load.audio('musicaInicio', 'audio/RolaEStadoUno.mp3');
        juego.load.image('fondo_inicio', 'img/fondo1.jpg');
        juego.load.image('btn_empezar', 'img/empezar.png');
    },

    create: function() {
        juego.camera.reset();
        juego.world.setBounds(0, 0, 1280, 880);

        this.fondoMenu = juego.add.tileSprite(0, 0, 1280, 880, 'fondo_inicio');
        // 🎵 MÚSICA DEL MENÚ
        music = juego.add.audio('musicaInicio');
        music.play('', 0, 1, true);

        var titulo = juego.add.text(juego.width / 2, 250, "MI AVENTURA", {
            font: "bold 100px Arial",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 10
        });
        titulo.anchor.set(0.5);

        var btnEmpezar = juego.add.button(juego.width / 2, 500, 'btn_empezar', function() {
             if (music) { music.stop(); } // 👈 DETENER MÚSICA
            vidas = 3;
            puntos = 0;
            // Corregido: Primero elegimos si es 1 o 2 jugadores
            juego.state.start('menuModo'); 
        }, this);
        btnEmpezar.anchor.set(0.5);
    },

    update: function() {
        this.fondoMenu.tilePosition.x -= 2;
    }
};

var EstadoMenuModo = {
    preload: function() {
        
        juego.load.audio('musicaSeleccion', 'audio/RolaSeleccionarJugador.mp3');
        juego.load.image('boton_1p', 'img/btn_1jugador.png');
        juego.load.image('boton_2p', 'img/btn_2jugadores.png');
        juego.load.image('fondo_menu', 'img/fondo1.jpg');
    },

    create: function() {
    
        // 🔊 Activar audio (IMPORTANTE en navegadores)
        if (juego.sound.context.state === 'suspended') {
            juego.sound.context.resume();
        }
    
        // 🔇 Detener música anterior
        if (music) {
            music.stop();
        }
    
        // 🎵 Reproducir música del menú modo
        music = juego.add.audio('musicaSeleccion');
        music.loop = true;
        music.volume = 1;
        music.play();
    
        // 🔹 1. FONDO
        var fondo = juego.add.sprite(0, 0, 'fondo_menu');
        fondo.width = juego.width;
        fondo.height = juego.height;
    
        // 🔹 2. TÍTULO
        var txtTitle = juego.add.text(juego.width / 2, 120, "MODO DE JUEGO", {
            font: "bold 80px Arial",
            fill: "#bda5a5"
        });
        txtTitle.anchor.set(0.5);
    
        // 🔹 3. BOTÓN 1 JUGADOR
        var btn1 = juego.add.button(juego.width / 2, 0, 'boton_1p', function() {
            modoDosJugadores = false;
            music.stop(); // 🔥 detener música antes de cambiar
            juego.state.start('seleccion');
        }, this);
    
        btn1.anchor.set(0.5);
    
        var anchoDeseado = 300;
        var escala1 = anchoDeseado / btn1.width;
        btn1.scale.setTo(escala1);
    
        // 🔹 4. BOTÓN 2 JUGADORES
        var btn2 = juego.add.button(juego.width / 2, 0, 'boton_2p', function() {
            modoDosJugadores = true;
            turnoJugador = 1;
            music.stop(); // 🔥 detener música
            juego.state.start('seleccion');
        }, this);
    
        btn2.anchor.set(0.5);
    
        var escala2 = anchoDeseado / btn2.width;
        btn2.scale.setTo(escala2);
    
        // 🔹 POSICIONES
        var centroY = juego.height / 2 + 50;
        btn1.y = centroY - btn1.height;
        btn2.y = centroY + btn2.height;
    
        // 🔥 HOVER
        btn1.inputEnabled = true;
        btn2.inputEnabled = true;
    
        btn1.events.onInputOver.add(function() {
            btn1.scale.setTo(escala1 * 1.1);
        });
    
        btn1.events.onInputOut.add(function() {
            btn1.scale.setTo(escala1);
        });
    
        btn2.events.onInputOver.add(function() {
            btn2.scale.setTo(escala2 * 1.1);
        });
    
        btn2.events.onInputOut.add(function() {
            btn2.scale.setTo(escala2);
        });
    }
};

var EstadoSeleccion = {
    preload: function() {
        juego.load.spritesheet('monito', 'img/personaje (1).png', 109, 144);
        juego.load.spritesheet('monito2', 'img/personaje2.png', 109, 144);
        juego.load.image('fondo_seleccion', 'img/fondo1.jpg');
        juego.load.audio('sfxBoton', 'audio/boton.mp3');
    },

    create: function() {
        // 🎨 Fondo
        var fondo = juego.add.tileSprite(0, 0, 1280, 880, 'fondo_seleccion');

        var txt = juego.add.text(juego.width / 2, 150, "ELIGE TU HÉROE", {
            font: "bold 60px Arial", 
            fill: "#ffffff"
        });
        txt.anchor.set(0.5);

        // 👇 Botón personaje
        var btnP1 = juego.add.button(juego.width / 2 - 200, 450, 'monito', function() {
            if (modoDosJugadores && turnoJugador === 1) {
                personajeP1 = 'monito'; 
                turnoJugador = 2;       
                txt.text = "JUGADOR 2: ELIGE HÉROE"; 
            } else if (modoDosJugadores && turnoJugador === 2) {
                personajeP2 = 'monito'; 
                personajeSeleccionado = personajeP1; 
                turnoJugador = 1;       
                music.stop(); // 🔥 IMPORTANTE: detener música antes de cambiar de estado
                juego.state.start('edouno');
            } else {
                personajeSeleccionado = 'monito';
                music.stop(); // 🔥 IMPORTANTE
                juego.state.start('edouno');
            }
        }, this);

        btnP1.anchor.set(0.5);
    }
};


var PrimerEdo = {

    preload: function () {
        // --- 1. CARGA DE AUDIOS ---
        juego.load.audio('roluki', 'audio/RolaJuego.mp3');
        juego.load.audio('sonidoMoneda', 'audio/moneda.mp3'); 
        juego.load.audio('sonidoManzana', 'audio/mordiendo_manzana.mp3');
        juego.load.audio('sfxBoton', 'audio/boton.mp3');
        juego.load.audio('sfxDaño', 'audio/daño.mp3');
        juego.load.audio('sfxCaida', 'audio/caida.mp3');

        juego.load.spritesheet('monito', 'img/personaje (1).png', 109, 144);
        juego.load.spritesheet('moustro', 'img/monstruo2.png', 260, 260); 
        juego.load.image('sky', 'img/fondo1.jpg');
        juego.load.image('pasto_img', 'img/pasto1.png');
        juego.load.image('pausa', 'img/pausa.png');
        juego.load.image('restar', 'img/restart.png');
        juego.load.image('salir', 'img/salir.png');
        juego.load.image('gota', 'img/gota.png');
        juego.load.image('arbol','img/arbol.png');
        juego.load.image('hoja','img/hoja.png');
        juego.load.image('manzana', 'img/manzana.png'); 
        juego.load.image('moneda', 'img/moneda.png');
        juego.load.image('bala', 'img/bala.png');
    },

    create: function () {
        sfxDaño = juego.add.audio('sfxDaño');
        sfxCaida = juego.add.audio('sfxCaida');
        juego.sound.muteOnPause = false;
        
      

        // Definir la tecla para disparar (usaremos la BARRA ESPACIADORA)

        // --- 2. CONFIGURACIÓN DEL MUNDO ---

        juego.world.setBounds(0, 0, 3000, 880);
        juego.physics.startSystem(Phaser.Physics.ARCADE);

        this.fondo = juego.add.tileSprite(0, 0, 1280, 880, 'sky');
        this.fondo.fixedToCamera = true;
        

// --- FUNCIÓN PARA MATAR MONSTRUOS ---
        this.matarMonstruo = function(bala, enemigo) {
            bala.kill();       // Elimina la bala
            enemigo.destroy(); // Elimina al monstruo del juego
            puntos += 50;      // ¡Bonus de puntos!
            textoPuntos.text = "🪙 Puntos: " + puntos;
};

        // --- 3. AUDIOS (Control para que no se encimen) ---
        // Dentro de create:
  
        sfxBoton = juego.add.audio('sfxBoton');
        if (music) { music.stop(); } 
        music = juego.add.audio('roluki');
        music.play('', 0, 1, true);

        sfxMoneda = juego.add.audio('sonidoMoneda');
        sfxManzana = juego.add.audio('sonidoManzana');

        // --- 4. PLATAFORMAS ---
        plataformas = juego.add.group();
        plataformas.enableBody = true; 
        this.crearPasto(0, 550, 350);
        this.crearPasto(490, 338, 300); 
        this.crearPasto(930, 550, 350);
// --- NUEVAS PLATAFORMAS (Extensión del nivel) ---
        this.crearPasto(1400, 400, 300);  // Un salto hacia arriba
        this.crearPasto(1850, 550, 400);  // Bajando un poco para descansar
        this.crearPasto(2350, 350, 300);  // Una plataforma alta
        this.crearPasto(2750, 550, 250);  // La última plataforma antes del "loop"

        // --- 5. OBJETOS ---
        arbol = juego.add.sprite(870, 360, 'arbol'); 
        arbol.anchor.set(0.5, 1); 
        arbol.scale.set(0.6);

        manzanas = juego.add.group();
        manzanas.enableBody = true;
        this.crearManzana(520, 180); 
        this.crearManzana(670, 130); 
        this.crearManzana(720, 200); 
// Nuevas Manzanas
        this.crearManzana(1500, 250); 
        this.crearManzana(2450, 200); 

        // Nuevas Monedas


        monedas = juego.add.group();
        monedas.enableBody = true;
        this.crearMoneda(100, 500);
        this.crearMoneda(550, 280);
        this.crearMoneda(1100, 500);
        this.crearMoneda(1900, 450);
        this.crearMoneda(2100, 450);
        this.crearMoneda(2800, 450);

        // --- 6. PERSONAJE ---
        personaje_1 = juego.add.sprite(100, 400, personajeSeleccionado);
        juego.physics.enable(personaje_1, Phaser.Physics.ARCADE);
        personaje_1.inputEnabled = true; // Habilita que el personaje reciba clics
        personaje_1.input.enableDrag();  // Permite arrastrarlo con el mouse
        personaje_1.body.gravity.y = 1200; 
        personaje_1.scale.set(1.1); 
        personaje_1.anchor.set(0.5); 
        personaje_1.animations.add('izq', [0, 1], 12, true);
        personaje_1.animations.add('der', [0, 1], 12, true);
        juego.camera.follow(personaje_1);

        // --- 7. MONSTRUOS ---
        moustro1 = juego.add.sprite(20, 150, 'moustro');
        moustro1.animations.add('run', [0, 1, 2, 3], 6, true);
        moustro1.animations.play('run');
        moustro1.scale.set(0.5);
        juego.physics.enable(moustro1, Phaser.Physics.ARCADE);
        moustro1.body.allowGravity = false;

        moustro2 = juego.add.sprite(1200, 400, 'moustro');
        moustro2.animations.add('run', [0, 1, 2, 3], 6, true);
        moustro2.animations.play('run');
        moustro2.scale.x = -0.5; 
        moustro2.scale.y = 0.5;
        juego.physics.enable(moustro2, Phaser.Physics.ARCADE);
        moustro2.body.allowGravity = false;

        // MONSTRUO 3 (Estatíco / Quieto) - TAMAÑO ORIGINAL 0.10
        moustro3 = juego.add.sprite(600, 260, 'moustro'); 
        moustro3.animations.add('run', [0, 1, 2, 3], 6, true);
        moustro3.animations.play('run'); 
        moustro3.scale.set(0.10); // <--- Vuelto a 0.10 como pediste
        juego.physics.enable(moustro3, Phaser.Physics.ARCADE);
        moustro3.body.allowGravity = false;
        moustro3.body.immovable = true;

        // --- 8. UI ---
        var estiloUI = { font: "bold 40px 'Courier New'", fill: "#FFCC00", stroke: "#8B4513", strokeThickness: 6 };
        textoVidas = juego.add.text(50, 110, "❤ Vidas: " + vidas, estiloUI);
        textoPuntos = juego.add.text(50, 160, "🪙 Puntos: " + puntos, estiloUI);
        textoVidas.fixedToCamera = true;
        textoPuntos.fixedToCamera = true;
        var estiloNombre = { 
            font: "bold 20px Arial", 
            fill: "#ffffff", 
            stroke: "#000000", 
            strokeThickness: 4 
        };

        // Posición: x = mitad de pantalla, y = altura total menos un pequeño margen (30px)
        var miNombre = juego.add.text(juego.width / 2, juego.height - 30, "Creado por: Rodrigo Rios y Juan Ocampo ", estiloNombre);
        
        // Esto centra el texto horizontalmente respecto a su coordenada X
        miNombre.anchor.set(0.5);
        
        // ¡IMPORTANTE! Que se quede fijo aunque la cámara se mueva
        miNombre.fixedToCamera = true;

        btnPausa = juego.add.button(50, 40, 'pausa', this.pausarJuego, this);
        btnPausa.scale.set(0.4); btnPausa.fixedToCamera = true;

        btnRestar = juego.add.button(130, 40, 'restar', this.reiniciarNivel, this);
        btnRestar.scale.set(0.4); btnRestar.fixedToCamera = true;

        btnSalir = juego.add.button(1180, 40, 'salir', this.salirDelJuego, this);
        btnSalir.scale.set(0.4); btnSalir.fixedToCamera = true;

        arriba = juego.input.keyboard.addKey(Phaser.Keyboard.UP);
        izquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        derecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
                arma = juego.add.weapon(30, 'bala');
        arma.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        arma.bulletSpeed = 900;
        arma.fireRate = 150;
        arma.trackSprite(personaje_1, 0, 0, false);
        arma.bullets.setAll('scale.x', 0.06);
        arma.bullets.setAll('scale.y', 0.06);       
        // 0 grados es hacia la derecha en Phaser
        arma.fireAngle = 0; 
        teclaFuego = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        
        this.crearEmitters();
    },

    update: function () {
        juego.physics.arcade.collide(personaje_1, plataformas);
        this.fondo.tilePosition.x -= 2;

        juego.physics.arcade.overlap(personaje_1, manzanas, this.comerManzana, null, this);
        juego.physics.arcade.overlap(personaje_1, monedas, this.recogerMoneda, null, this);
        juego.physics.arcade.overlap(personaje_1, moustro1, this.chocarEnemigo, null, this);
        juego.physics.arcade.overlap(personaje_1, moustro2, this.chocarEnemigo, null, this);
        juego.physics.arcade.overlap(personaje_1, moustro3, this.chocarEnemigo, null, this);
        
        // 1. Lógica para disparar
        if (personaje_1.scale.x > 0) {
            arma.fireAngle = 0; // Apunta a la derecha
        } else {
            arma.fireAngle = 180; // Apunta a la izquierda
        }
        if (teclaFuego.isDown) {
    // Ajustamos la posición de salida (trackOffset) dinámicamente
        if (personaje_1.scale.x > 0) {
            // Si mira a la derecha, sale 10 píxeles a la derecha del centro
            arma.trackOffset.x = 10; 
        } else {
        // Si mira a la izquierda, sale 10 píxeles a la izquierda del centro
        arma.trackOffset.x = -10;
    }
            arma.fire();
        }

        // 2. Colisiones: Si la bala toca a un monstruo, llama a matarMonstruo
        juego.physics.arcade.overlap(arma.bullets, moustro1, this.matarMonstruo, null, this);
        juego.physics.arcade.overlap(arma.bullets, moustro2, this.matarMonstruo, null, this);
        juego.physics.arcade.overlap(arma.bullets, moustro3, this.matarMonstruo, null, this);



        //fondo.tilePosition.x = -juego.camera.x * 0.15; // El 0.5 crea un efecto parallax (fondo más lento)
        //fondo.tilePosition.x -= 0.2; // Movimiento constante de las nubes

        personaje_1.body.velocity.x = 0;
        if (izquierda.isDown) {
            personaje_1.body.velocity.x = -350;
            personaje_1.scale.x = -1.1; 
            personaje_1.animations.play('izq');
            //angulo de dispariop 
            arma.fireAngle = 180;
        } else if (derecha.isDown) {
            personaje_1.body.velocity.x = 350;
            personaje_1.scale.x = 1.1; 
            personaje_1.animations.play('der');
            arma.fireAngle = 0;
        } else {
            personaje_1.animations.stop();
            personaje_1.frame = 0;
        }

        if (arriba.isDown && personaje_1.body.touching.down) {
            personaje_1.body.velocity.y = -750; 
        }

        if (personaje_1.x > 2950) { personaje_1.x = 50; }
        else if (personaje_1.x < 0) { personaje_1.x = 2900; }

        moustro1.body.velocity.x = 150;
        if (moustro1.x > juego.world.width) { moustro1.x = -100; }
        moustro2.body.velocity.x = -150;
        if (moustro2.x < -100) { moustro2.x = juego.world.width; }

        if (personaje_1.y > juego.height + 100) { sfxCaida.play();this.ejecutarMuerte(); }
    },

    crearEmitters: function() {
        emitterLluvia = juego.add.emitter(juego.world.centerX, -100);
        emitterLluvia.makeParticles('gota');
        emitterLluvia.width = 1280; 
        emitterLluvia.fixedToCamera = true;
        emitterLluvia.minParticleScale = 0.03; 
        emitterLluvia.maxParticleScale = 0.06; 
        emitterLluvia.gravity = 250;
        emitterLluvia.flow(2500, 800, 20, -1); 

        emitterHojas = juego.add.emitter(870, 150); 
        emitterHojas.makeParticles('hoja');
        emitterHojas.width = 100; 
        emitterHojas.minParticleScale = 0.01; 
        emitterHojas.maxParticleScale = 0.08; 
        emitterHojas.gravity = 50; 
        emitterHojas.setXSpeed(-20, 20);
        emitterHojas.flow(4000, 1500, 1, -1); 
    },

    crearManzana: function(x, y) {
        var mzn = manzanas.create(x, y, 'manzana');
        mzn.anchor.set(0.5);
        mzn.scale.set(0.12); mzn.body.allowGravity = false;
    },

    crearMoneda: function(x, y) {
        var mon = monedas.create(x, y, 'moneda');
        mon.anchor.set(0.5);
        mon.scale.set(0.1); mon.body.allowGravity = false;
    },

    crearPasto: function(x, y, ancho) {
        var bloque = plataformas.create(x, y, 'pasto_img');
        bloque.width = ancho; bloque.body.immovable = true; bloque.body.allowGravity = false;
    },

    comerManzana: function(pj, apple) { apple.destroy(); sfxManzana.play(); vidas++; textoVidas.text = "❤ Vidas: " + vidas; },
    recogerMoneda: function(pj, coin) { coin.destroy(); sfxMoneda.play(); puntos += 10; textoPuntos.text = "🪙 Puntos: " + puntos; },
    
    pausarJuego: function() {
        sfxBoton.play(); // Disparamos el sonido

        if (!juego.paused) {
            // SI VAMOS A PAUSAR:
            // Le damos 100ms al sonido para que empiece a sonar 
            // antes de congelar el motor de Phaser.
            setTimeout(function() {
                juego.paused = true;
            }, 400); 
        } else {
            // SI VAMOS A QUITAR LA PAUSA:
            // Es instantáneo para que el sonido se escuche normal.
            juego.paused = false;
        }
    },
    
    reiniciarNivel: function() { 
        sfxBoton.play();
        vidas = 3; puntos = 0; 
        if (music) { music.stop(); } 
        juego.state.start('edouno'); 
    },
    
// Dentro de PrimerEdo
    salirDelJuego: function() { sfxBoton.play();
        if (music) { music.stop(); } // Detener música antes de ir al menú
        juego.state.start('inicio'); // Cambiado: ahora va al tercer estado
    },
    
    chocarEnemigo: function(pj, enemigo) {
        sfxDaño.play();
        juego.camera.shake(0.05, 500);
        juego.camera.flash(0xffffff, 250);
        this.ejecutarMuerte();
        juego.time.events.repeat(300, 6, function() {
            if (personaje_1.tint === 0xffffff) {
                personaje_1.tint = 0xff0000;
            } else {
                personaje_1.tint = 0xffffff;
            }
        }, this);
    },

    ejecutarMuerte: function() {
    if (modoDosJugadores) {
        if (turnoJugador === 1) {
            vidasP1--;
            // Guardamos los puntos actuales del J1
            puntosP1 = puntos; 
            if (vidasP2 > 0) {
                turnoJugador = 2;
                personajeSeleccionado = personajeP2; // Cambiamos el sprite
                vidas = vidasP2;   // Cargamos las vidas del J2
                puntos = puntosP2; // Cargamos sus puntos
                alert("¡Turno del Jugador 2!");
                juego.state.start('edouno'); // Reinicia el nivel para el J2
            }
        } else {
            vidasP2--;
            puntosP2 = puntos;
            if (vidasP1 > 0) {
                turnoJugador = 1;
                personajeSeleccionado = personajeP1;
                vidas = vidasP1;
                puntos = puntosP1;
                alert("¡Turno del Jugador 1!");
                juego.state.start('edouno');
            }
        }
    } else {
        // Lógica normal de 1 solo jugador que ya tienes...
        vidas--;
        if (vidas <= 0) juego.state.start('gameover');
        else personaje_1.reset(100, 400);
    }
}
};
var EstadoGameOver = {
    musicaGameOver: null, // Variable local para la música

    preload: function() {
        juego.load.image('fondo_negro', 'img/fondo_negro.png');
        juego.load.image('btn_restart', 'img/restart.png');
        juego.load.audio('musica_muerte', 'audio/game_over.mp3');
        // Usaremos la misma imagen de burbujas
        juego.load.image('burbujas_img', 'img/burbuja2.png');
    },

    create: function() {
        // 🔥 Limpiar y resetear todo para evitar cuadros negros
        juego.world.removeAll();
        juego.camera.reset();
        juego.camera.unfollow();
        juego.world.setBounds(0, 0, 1280, 880);

        // 🎵 Música Game Over (Solo sonará aquí)
        this.musicaGameOver = juego.add.audio('musica_muerte');
        this.musicaGameOver.play();

        // 🖤 Fondo negro sólido
        juego.add.tileSprite(0, 0, 1280, 880, 'fondo_negro');

        // 🫧 ÚNICA CAPA DE BURBUJAS (Pequeñas y uniformes)
        // Usamos un nombre de variable diferente para limpiarlo bien
        this.burbujasUnicas = juego.add.tileSprite(3, 3, 2280, 1780, 'burbujas_img');
        
        // --- AQUÍ ESTÁ LA SOLUCIÓN AL RECORTE ---
        // 1. Quitamos scale.set(1.7). Al dejarlo en scale.set(1.0) (o 0.5),
        //    Phaser puede hacer el bucle perfectamente sin bordes naranjas.
        this.burbujasUnicas.scale.set(0.6); // <--- Ajusta este número para el tamaño que prefieras (ej: 0.5 para más pequeñas)
        
        this.burbujasUnicas.alpha = 0.5; // Transparencia suave
        this.burbujasUnicas.tint = 0x99ccff; // Un azulito claro para que combinen con el Game Over
        this.burbujasUnicas.fixedToCamera = true;

        // 💀 Texto GAME OVER (Frente a los fondos)
        var txt = juego.add.text(juego.width / 2, 300, "GAME OVER", {
            font: "bold 80px Arial",
            fill: "#ff0000",
            stroke: "#000000",
            strokeThickness: 8 
        });
        txt.anchor.set(0.5);

        // 🔁 Botón Reiniciar
        var btn = juego.add.button(juego.width / 2, 500, 'btn_restart', function() {
            // Detener la música de muerte antes de volver al juego
            this.musicaGameOver.stop(); 
            vidas = 3;
            puntos = 0;
            // Al reiniciar, Phaser volverá a PrimerEdo y reseteará la cámara allá
            juego.state.start('edouno');
        }, this);
        btn.anchor.set(0.5);
    },

    update: function() {
        // Movimiento de la única capa de burbujas
        // -= para que suban, += para que bajen
        if (this.burbujasUnicas) {
            this.burbujasUnicas.tilePosition.y -= 2; 
        }
    }
};
// 1. Registramos todos los estados disponibles
juego.state.add('inicio', EstadoInicio);
juego.state.add('seleccion', EstadoSeleccion); // ¡IMPORTANTE! Asegúrate de que este nombre coincida con el de tu variable
juego.state.add('edouno', PrimerEdo);
juego.state.add('gameover', EstadoGameOver);
juego.state.add('menuModo', EstadoMenuModo);

// 2. Arrancamos ÚNICAMENTE el primero
juego.state.start('inicio');