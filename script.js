// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les éléments
    const clickBtn = document.getElementById('clickBtn');
    const message = document.getElementById('message');
    
    // Compteur de clics
    let clickCount = 0;
    
    // Messages aléatoires
    const messages = [
        "Bravo! Vous avez cliqué sur le bouton! 🎉",
        "Excellent choix! 👍",
        "Continuez comme ça! 💪",
        "Vous êtes incroyable! ⭐",
        "Super clic! 🚀",
        "Magnifique! ✨"
    ];
    
    // Gestionnaire d'événement pour le bouton
    clickBtn.addEventListener('click', function() {
        clickCount++;
        
        // Choisir un message aléatoire
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // Afficher le message avec le compteur
        message.textContent = `${randomMessage} (Clic #${clickCount})`;
        message.classList.add('show');
        
        // Animation du bouton
        clickBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            clickBtn.style.transform = 'scale(1)';
        }, 100);
        
        // Changer la couleur du message après plusieurs clics
        if (clickCount % 5 === 0) {
            message.style.background = '#fef3c7';
            message.style.color = '#92400e';
            message.textContent += ' 🎊 Milestone atteint!';
        } else {
            message.style.background = '#e6fffa';
            message.style.color = '#047857';
        }
    });
    
    // Animation au chargement de la page
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
});