// Script pour nettoyer les attributs problématiques ajoutés par des extensions
(function() {
  // Liste des attributs à nettoyer
  const attributesToClean = [
    'bis_skin_checked',
    '__processed_b8caadd5-2d71-4096-9a68-8a6871cc57ce__',
    'bis_register'
  ];

  // Nettoyer les attributs sur un élément
  function cleanAttributes(element) {
    if (!(element instanceof Element)) return;
    
    attributesToClean.forEach(attr => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });
  }

  // Nettoyer tous les éléments correspondants dans le document
  function cleanAllElements() {
    // Nettoyer d'abord body
    cleanAttributes(document.body);
    
    // Puis tous les éléments avec les attributs problématiques
    attributesToClean.forEach(attr => {
      const elements = document.querySelectorAll(`[${attr}]`);
      elements.forEach(el => cleanAttributes(el));
    });
  }

  // Configurer l'observateur pour nettoyer automatiquement
  function setupObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Si l'attribut a changé
        if (mutation.type === 'attributes' && mutation.target instanceof Element) {
          cleanAttributes(mutation.target);
        }
        
        // Si des nœuds ont été ajoutés
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element Node
              // Nettoyer l'élément lui-même
              cleanAttributes(node);
              
              // Et tous ses enfants ayant les attributs problématiques
              if (node instanceof Element) {
                attributesToClean.forEach(attr => {
                  const children = node.querySelectorAll(`[${attr}]`);
                  children.forEach(child => cleanAttributes(child));
                });
              }
            }
          });
        }
      });
    });
    
    // Observer tout le document
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: attributesToClean
    });
    
    return observer;
  }

  // Fonction principale
  function init() {
    console.log('🧹 Attribute Cleaner: Initializing...');
    
    // Nettoyage initial
    cleanAllElements();
    
    // Mise en place de l'observateur
    const observer = setupObserver();
    
    console.log('✅ Attribute Cleaner: Running');
    
    // Nettoyer à nouveau périodiquement (certaines extensions peuvent être persistantes)
    const interval = setInterval(cleanAllElements, 2000);
    
    // Retourner une fonction pour arrêter tout si nécessaire
    return function stop() {
      observer.disconnect();
      clearInterval(interval);
      console.log('🛑 Attribute Cleaner: Stopped');
    };
  }

  // Démarrer quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 