// CONFIGURE AQUI: Cole aqui exatamente os dados que copiou do console do seu Firebase!
const firebaseConfig = {
    apiKey: "AIzaSyCBTE3NoUAMKC8jNIaGF5dCcdWL8kBcFIo",
    authDomain: "setembro-amarelo-jogo.firebaseapp.com",
    databaseURL: "https://setembro-amarelo-jogo-default-rtdb.firebaseio.com",
    projectId: "setembro-amarelo-jogo",
    storageBucket: "setembro-amarelo-jogo.firebasestorage.app",
    messagingSenderId: "453358676727",
    appId: "1:453358676727:web:037dc6a5cef96327d1c1f2",
    measurementId: "G-KY2ETBHZ83"
  };

// Inicializando o Firebase com a sintaxe clássica e segura para testes locais
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Mensagens Motivacionais das Bolhas
const mensagens = [
    { text: "Seu esforço nos estudos vai valer a pena. Cada passo conta!", emoji: "📚" },
    { text: "Cuidar da sua mente é um ato de coragem. Você não está sozinho.", emoji: "🧠" },
    { text: "Respire fundo. A tempestade vai passar e o sol vai voltar a brilhar.", emoji: "🌈" },
    { text: "Você é muito mais forte e resiliente do que imagina.", emoji: "💪" },
    { text: "Tudo bem não estar bem o tempo todo. Respeite o seu tempo.", emoji: "⏳" },
    { text: "Seu corpo físico precisa de carinho. Beba água e descanse hoje.", emoji: "🍎" },
    { text: "Sua presença faz a diferença no mundo. Nunca duvide disso.", emoji: "💛" },
    { text: "Celebrar pequenas vitórias diárias constrói grandes caminhos.", emoji: "✨" },
    { text: "Desconectar um pouco faz bem. Tire um momento só para você respirar.", emoji: "🍃" },
    { text: "Nenhum erro define o seu valor. Você está crescendo todos os dias.", emoji: "🌱" },
    { text: "Dividir o peso com alguém torna a caminhada mais leve. Converse com um amigo.", emoji: "🗣️" },
    { text: "Sua jornada é única. Não se compare com o ritmo dos outros.", emoji: "🧭" },
    { text: "Você merece o amor e a paciência que costuma dedicar aos outros.", emoji: "❤️" },
    { text: "Amanhã é uma nova oportunidade para recomeçar, sem pressa.", emoji: "🌅" },
    { text: "Um dia ruim não significa uma vida ruim. Dias melhores estão vindo.", emoji: "🌤️" }
];

const palavrasProibidas = ["palavrao1", "palavrao2", "ofensa1", "ofensa2"];

let score = 0;
const gameContainer = document.getElementById('gameContainer');
const scoreDisplay = document.getElementById('score');
const modalOverlay = document.getElementById('modalOverlay');
const modalEmoji = document.getElementById('modalEmoji');
const modalMessage = document.getElementById('modalMessage');
const closeModalBtn = document.getElementById('closeModal');
const shareBtn = document.getElementById('shareBtn');

document.addEventListener("DOMContentLoaded", () => {
    escutarMuralFirebase();
    setInterval(createBubble, 1100);
});

function createBubble() {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    const dataAleatoria = mensagens[Math.floor(Math.random() * mensagens.length)];
    bubble.innerText = dataAleatoria.emoji;
    
    const size = Math.random() * 20 + 55;
    const posX = Math.random() * (window.innerWidth - size - 40);
    
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${posX}px`;
    
    const duration = Math.random() * 3 + 5;
    bubble.style.animationDuration = `${duration}s`;
    
    bubble.addEventListener('click', (e) => {
        createBurstAnimation(e.clientX, e.clientY);
        estourarBolha(dataAleatoria);
        bubble.remove();
    });
    
    gameContainer.appendChild(bubble);
    setTimeout(() => { bubble.remove(); }, duration * 1000);
}

function createBurstAnimation(x, y) {
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        const pSize = Math.random() * 6 + 4;
        particle.style.width = `${pSize}px`;
        particle.style.height = `${pSize}px`;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 60 + 40;
        particle.style.setProperty('--mx', `${Math.cos(angle) * velocity}px`);
        particle.style.setProperty('--my', `${Math.sin(angle) * velocity}px`);
        document.body.appendChild(particle);
        setTimeout(() => { particle.remove(); }, 500);
    }
}

function estourarBolha(data) {
    score++;
    scoreDisplay.innerText = score;
    modalEmoji.innerText = data.emoji;
    modalMessage.innerText = data.text;
    modalOverlay.style.display = 'flex';
}

closeModalBtn.addEventListener('click', () => { modalOverlay.style.display = 'none'; });

// Sistema de Compartilhamento
shareBtn.addEventListener('click', async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Setembro Amarelo - Bolhas da Empatia',
                text: 'Entre nessa página para estourar bolhas motivacionais e aliviar o coração desabafando de forma anônima. 💛',
                url: window.location.href
            });
        } catch (err) { console.log("Compartilhamento cancelado."); }
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link da página copiado! Envie para seus amigos. 💛");
    }
});

// --- OPERAÇÕES NO FIREBASE ---
const confessionForm = document.getElementById('confessionForm');
const confessionInput = document.getElementById('confessionInput');
const mural = document.getElementById('mural');

confessionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let texto = confessionInput.value.trim();
    
    if(texto !== "") {
        texto = filtrarTexto(texto);
        confessionInput.value = ""; 
        
        try {
            // Salvando usando a biblioteca v8 estável localmente
            await db.collection("desabafos").add({
                texto: texto,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Erro ao enviar para o Firebase: ", error);
            alert("Não foi possível enviar o desabafo agora. Verifique a internet.");
        }
    }
});

function filtrarTexto(texto) {
    let textoFiltrado = texto;
    palavrasProibidas.forEach(palavra => {
        const regex = new RegExp(`\\b${palavra}\\b`, 'gi');
        textoFiltrado = textoFiltrado.replace(regex, "*".repeat(palavra.length));
    });
    return textoFiltrado;
}

// Sincronização estável e em tempo real com o banco de dados
function escutarMuralFirebase() {
    db.collection("desabafos").orderBy("criadoEm", "desc").onSnapshot((snapshot) => {
        mural.innerHTML = ""; 
        
        if (snapshot.empty) {
            mural.innerHTML = `
                <div class="card-desabafo">"Seja o primeiro a deixar um desabafo anônimo de alívio..."</div>
                <div class="card-desabafo">"Guardar tudo para si sufoca. Sinta-se livre para desabafar aqui."</div>
            `;
            return;
        }

        snapshot.forEach((doc) => {
            const dados = doc.data();
            if (dados.texto) {
                const card = document.createElement('div');
                card.classList.add('card-desabafo');
                card.innerText = `"${dados.texto}"`;
                mural.appendChild(card);
            }
        });
    }, (error) => {
        console.error("Erro ao ler dados do Firebase: ", error);
    });
}
