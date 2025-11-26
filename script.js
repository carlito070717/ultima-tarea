// Elementos del DOM
const mensaje = document.getElementById('mensaje');
const charCounter = document.getElementById('charCounter');
const matrizMensaje = document.getElementById('matrizMensaje');
const k11 = document.getElementById('k11');
const k12 = document.getElementById('k12');
const k21 = document.getElementById('k21');
const k22 = document.getElementById('k22');
const btnEncriptar = document.getElementById('encriptar');
const btnDesencriptar = document.getElementById('desencriptar');
const resultado = document.getElementById('resultado');
const resultadoSection = document.getElementById('resultadoSection');
const resultadoTitle = document.getElementById('resultadoTitle');
const btnCopiar = document.getElementById('copiar');

// Actualizar contador de caracteres
mensaje.addEventListener('input', () => {
    const len = mensaje.value.length;
    charCounter.textContent = len;
    
    // Cambiar color según proximidad al límite
    if (len > 25) {
        charCounter.style.color = '#ef4444';
    } else if (len > 20) {
        charCounter.style.color = '#f59e0b';
    } else {
        charCounter.style.color = '#818cf8';
    }
    
    mostrarMatrizMensaje();
});

// Mostrar matriz del mensaje
function mostrarMatrizMensaje() {
    const texto = mensaje.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (texto.length === 0) {
        matrizMensaje.innerHTML = '<p class="placeholder-text">La matriz aparecerá aquí cuando escribas un mensaje</p>';
        return;
    }
    
    const valores = texto.split('').map(char => char.charCodeAt(0) - 65);
    
    // Agregar padding si es impar
    if (valores.length % 2 !== 0) {
        valores.push(23); // 'X' = 23
    }
    
    // Crear matriz visual
    let matrizHTML = '<div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">';
    
    for (let i = 0; i < valores.length; i += 2) {
        matrizHTML += `
            <div style="display: inline-flex; align-items: center; gap: 5px;">
                <span style="color: #818cf8; font-size: 2rem;">[</span>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <span style="color: #10b981; font-weight: 600;">${valores[i]}</span>
                    <span style="color: #10b981; font-weight: 600;">${valores[i + 1]}</span>
                </div>
                <span style="color: #818cf8; font-size: 2rem;">]</span>
            </div>
        `;
    }
    
    matrizHTML += '</div>';
    matrizMensaje.innerHTML = matrizHTML;
}

// Añadir efecto visual a los inputs de la matriz
[k11, k12, k21, k22].forEach(input => {
    input.addEventListener('input', () => {
        if (input.value) {
            input.style.borderColor = '#6366f1';
        } else {
            input.style.borderColor = '#334155';
        }
    });
});

// Función de encriptación Hill
btnEncriptar.addEventListener('click', () => {
    // Mostrar animación de carga en el botón
    btnEncriptar.innerHTML = '<span class="btn-icon">⏳</span><span>Procesando...</span>';
    btnEncriptar.disabled = true;
    btnDesencriptar.disabled = true;
    
    setTimeout(() => {
        encriptarMensaje();
        btnEncriptar.innerHTML = '<span class="btn-icon">🔒</span><span>Encriptar</span><span class="btn-arrow">→</span>';
        btnEncriptar.disabled = false;
        btnDesencriptar.disabled = false;
    }, 500);
});

// Función de desencriptación Hill
btnDesencriptar.addEventListener('click', () => {
    // Mostrar animación de carga en el botón
    btnDesencriptar.innerHTML = '<span class="btn-icon">⏳</span><span>Procesando...</span>';
    btnDesencriptar.disabled = true;
    btnEncriptar.disabled = true;
    
    setTimeout(() => {
        desencriptarMensaje();
        btnDesencriptar.innerHTML = '<span class="btn-icon">🔓</span><span>Desencriptar</span><span class="btn-arrow">→</span>';
        btnDesencriptar.disabled = false;
        btnEncriptar.disabled = false;
    }, 500);
});

function encriptarMensaje() {
    // Validar inputs de la matriz
    const key = [
        [parseInt(k11.value) || 0, parseInt(k12.value) || 0],
        [parseInt(k21.value) || 0, parseInt(k22.value) || 0]
    ];
    
    if (key[0][0] === 0 && key[0][1] === 0 && key[1][0] === 0 && key[1][1] === 0) {
        mostrarError('⚠️ Error: Ingresa una matriz clave válida');
        return;
    }
    
    const texto = mensaje.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (texto.length === 0) {
        mostrarError('⚠️ Error: Ingresa un mensaje para encriptar');
        return;
    }
    
    // Calcular determinante
    const det = (key[0][0] * key[1][1] - key[0][1] * key[1][0]) % 26;
    
    if (det === 0) {
        mostrarError('⚠️ Error: La matriz no es invertible (determinante = 0 mod 26)');
        return;
    }
    
    // Convertir texto a números
    let numeros = texto.split('').map(char => char.charCodeAt(0) - 65);
    
    // Agregar padding si es impar
    if (numeros.length % 2 !== 0) {
        numeros.push(23); // 'X'
    }
    
    // Encriptar
    let encriptado = '';
    for (let i = 0; i < numeros.length; i += 2) {
        const v1 = numeros[i];
        const v2 = numeros[i + 1];
        
        let c1 = (key[0][0] * v1 + key[0][1] * v2) % 26;
        let c2 = (key[1][0] * v1 + key[1][1] * v2) % 26;
        
        // Asegurar valores positivos
        if (c1 < 0) c1 += 26;
        if (c2 < 0) c2 += 26;
        
        encriptado += String.fromCharCode(65 + c1);
        encriptado += String.fromCharCode(65 + c2);
    }
    
    mostrarResultado(encriptado, 'encriptación');
}

// Función para calcular el inverso modular
function modInverso(a, m) {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) {
            return x;
        }
    }
    return null;
}

// Función para calcular la matriz inversa módulo 26
function matrizInversa(key) {
    // Calcular determinante
    let det = (key[0][0] * key[1][1] - key[0][1] * key[1][0]) % 26;
    if (det < 0) det += 26;
    
    // Calcular inverso del determinante
    const detInv = modInverso(det, 26);
    
    if (detInv === null) {
        return null;
    }
    
    // Calcular matriz adjunta y multiplicar por inverso del determinante
    const inv = [
        [(key[1][1] * detInv) % 26, (-key[0][1] * detInv) % 26],
        [(-key[1][0] * detInv) % 26, (key[0][0] * detInv) % 26]
    ];
    
    // Asegurar valores positivos
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            if (inv[i][j] < 0) inv[i][j] += 26;
        }
    }
    
    return inv;
}

function desencriptarMensaje() {
    // Validar inputs de la matriz
    const key = [
        [parseInt(k11.value) || 0, parseInt(k12.value) || 0],
        [parseInt(k21.value) || 0, parseInt(k22.value) || 0]
    ];
    
    if (key[0][0] === 0 && key[0][1] === 0 && key[1][0] === 0 && key[1][1] === 0) {
        mostrarError('⚠️ Error: Ingresa una matriz clave válida');
        return;
    }
    
    const texto = mensaje.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (texto.length === 0) {
        mostrarError('⚠️ Error: Ingresa un mensaje para desencriptar');
        return;
    }
    
    // Calcular determinante
    const det = (key[0][0] * key[1][1] - key[0][1] * key[1][0]) % 26;
    
    if (det === 0) {
        mostrarError('⚠️ Error: La matriz no es invertible (determinante = 0 mod 26)');
        return;
    }
    
    // Calcular matriz inversa
    const keyInv = matrizInversa(key);
    
    if (keyInv === null) {
        mostrarError('⚠️ Error: No se puede calcular la matriz inversa');
        return;
    }
    
    // Convertir texto a números
    let numeros = texto.split('').map(char => char.charCodeAt(0) - 65);
    
    // Agregar padding si es impar
    if (numeros.length % 2 !== 0) {
        numeros.push(23); // 'X'
    }
    
    // Desencriptar
    let desencriptado = '';
    for (let i = 0; i < numeros.length; i += 2) {
        const c1 = numeros[i];
        const c2 = numeros[i + 1];
        
        let v1 = (keyInv[0][0] * c1 + keyInv[0][1] * c2) % 26;
        let v2 = (keyInv[1][0] * c1 + keyInv[1][1] * c2) % 26;
        
        // Asegurar valores positivos
        if (v1 < 0) v1 += 26;
        if (v2 < 0) v2 += 26;
        
        desencriptado += String.fromCharCode(65 + v1);
        desencriptado += String.fromCharCode(65 + v2);
    }
    
    mostrarResultado(desencriptado, 'desencriptación');
}

function mostrarError(mensaje) {
    resultado.classList.add('error');
    resultado.textContent = mensaje;
    resultadoSection.classList.remove('hidden');
    btnCopiar.classList.add('hidden');
    resultadoTitle.textContent = '❌ Error';
    
    // Scroll suave al resultado
    resultadoSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function mostrarResultado(texto, tipo) {
    resultado.classList.remove('error');
    resultado.textContent = `✅ ${texto}`;
    resultadoSection.classList.remove('hidden');
    btnCopiar.classList.remove('hidden');
    
    // Cambiar el título según el tipo
    if (tipo === 'encriptación') {
        resultadoTitle.textContent = '🔒 Mensaje Encriptado';
    } else if (tipo === 'desencriptación') {
        resultadoTitle.textContent = '🔓 Mensaje Desencriptado';
    }
    
    // Scroll suave al resultado
    resultadoSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Animación de éxito
    resultado.style.animation = 'none';
    setTimeout(() => {
        resultado.style.animation = 'fadeInUp 0.5s ease-out';
    }, 10);
}

// Funcionalidad de copiar
btnCopiar.addEventListener('click', () => {
    const texto = resultado.textContent.replace('✅ ', '');
    
    navigator.clipboard.writeText(texto).then(() => {
        // Cambiar texto del botón temporalmente
        const textoOriginal = btnCopiar.textContent;
        btnCopiar.textContent = '✅ ¡Copiado!';
        btnCopiar.style.background = '#059669';
        
        setTimeout(() => {
            btnCopiar.textContent = textoOriginal;
            btnCopiar.style.background = '#10b981';
        }, 2000);
    }).catch(() => {
        alert('No se pudo copiar el texto');
    });
});

// Permitir Enter para encriptar
mensaje.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        btnEncriptar.click();
    }
});

// Inicializar
mostrarMatrizMensaje();
