# TENDANCES LIVE :

Tendances Live est un script vous donnant une toute nouvelle nouvelle dimension pour appréhender votre liste de topics.

Cet outil vous permet plusieurs types d'affichage de la liste des topics sur les forums de jeuxvideo.com.
Il vous donne la possibilité de prendre en compte la popularité de chaque topics, vous pourrez identifier les topics les plus up du moment, les trier par popularité ou les afficher sur votre liste habituelle.

Cet outil vous permettra aussi de rafraîchir automatiquement la liste tout en restant en mesure de la bloquée à tous moments d'un simple mouvement de souris.

__________________________________

### Fonctionnalités :

https://www.noelshack.com/2018-06-6-1518281149-tendanceslive.png https://www.noelshack.com/2018-06-6-1518286519-tendanceslive2.png https://www.noelshack.com/2018-06-6-1518286519-tendanceslive3.png

Chaque onglet va vous donner un setup différent :

* Classic  : Affiche la liste de façon classique sans la rafraîchir.
* Live  : Affiche la liste de façon classique. La liste est rafraîchie toutes les 5 ou 10 secondes 
(voir paragraphe Configuration)
* Popularité  : Affiche la liste classique en triant les topics par popularité. 
Liste rafraichie
* Les plus up  : Affiche la liste des topics les plus up du moment  en les triant par popularité. 
Liste rafraichie

A noter : A chaque rafraîchissement de la liste, le compteur de connecté est aussi mis à jour.

 
Le start and stop :

Tendance Live vous permet de ne pas perdre la trace d'un topic que vous voudriez lire lors d'un rafraîchissement inutile.

* Lorsque vous laissez votre curseur sur la liste des topics
* ou lorsque vous cliquez sur le bouton rectangulaire vert à la droite des onglets  

le rafraîchissement de la liste est arrêté.
Si votre souris est sur la liste, les bordures de la liste seront plus foncées que la normale pour vous indiquer que la liste est actuellement verrouillée.
Si vous cliquer sur le bouton vert, il sera rouge une fois activé, ce qui signifiera que la liste est verrouillée.

Si vous avez activé l'identification des tendances dans la liste, la couleur des topics populaires reste mise à jour lors du blocage pour vous permettre de toujours être en mesure d'identifier les tendances en direct

 
Activer/désactiver l'identification des tendances : 

Lorsque vous cliquez sur le bouton slider "ON/OFF" l'identification des tendances est activée ou désactivée, ce qui signifie que la couleur des topics peut être affichée en fonction de leur popularité ou laissée telle quelle.
Ainsi vous pouvez choisir d'identifier les topics en tendance dans votre liste habituelle, ou même de désactiver le balisage couleur en gardant le tri par popularité dans les onglets à cet effet.

__________________________________

### Installation :


* Installez le plugin Tampermonkey/Greasemonkey :
Chrome : https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=fr
Firefox : https://addons.mozilla.org/fr/firefox/addon/greasemonkey/
Opera : https://addons.opera.com/fr/extensions/details/tampermonkey-beta/?display=en
Non testé sur la version de safari

__________________________________

### Configuration :

Au début du script vous pouvez modifier quelque variables pour configurer certains comportements de l'outil Tendances Live.

Comportement :

- VITESSE_F5 : Choisir la vitesse de rafraîchissement, toutes les 5 ou 10 secondes (5 secondes par défaut)

Couleurs des tendances :

Donne l'accès aux valeurs des couleurs des topics en tendances pour pouvoir les personnaliser à votre guise.

* colorLight : couleur d'un topic devenant populaire
* colorMedium : couleur d'un topic populaire
* colorHeavy : couleur d'un topic très populaire

Mise à jour des tendances :

* timerRefreshTrend : Choisir le temps en secondes avant mise à jour de la liste des topics en tendances (3 secondes par défaut)
Modifie par extension le temps avant téléchargement d'une nouvelle page rafraichie
A ne modifier seulement si votre connection ne vous permet pas d'afficher une page en moins de 3 secondes
Vitesse d'affichage habituelle entre 0 et 400 ms

__________________________________

### Compatibilité :

Le script est utilisable seulement sur la VERSION PC des forum de jeuxvideo.com 

 
- Scripts :
Le script pourrait être incompatible avec certains scripts ayant des comportements similaires avec Tendances Live (coloration, tri)

N'utilisez pas ce script avec mon autre script First Live qui permet seulement le rafraîchissement de la liste
 
- Styles :
 Compatible avec le style Stylish DARK JVC

La coloration des topics peut être incompatible avec certains styles :

Afficher des couleurs dégueulasses pour les topics en tendance :
Pour cela il vous reste toujours la possibilité de changer les couleurs des tendances au début du script

Ne pas afficher les couleurs du tout : 
Désactivez le style - ou désactivez l'identification des tendances sur Tendances Live grâce au slider ON/OFF et ne garder que les autres fonctionnalités

__________________________________

### Comportements :

- Le script prend un peu de temps avant d'afficher en couleur les topics en tendances car il a besoin de retraiter plusieurs fois la page rafraichie avant d'obtenir une assignation des tendances convenable

- Le script n'est pas en mesure de prendre en compte le nombre de personnes postant sur le forum, il se peut donc que lorsque trop peu de topics sont crées et que les couleurs sont activées, la plupart des topics se voient attribuer une couleur.
Autant désactiver l'affichage des couleurs dans ces moments là.

- Pour que le script puisse fonctionner, il faut que les serveurs de jeuxvideo.com soient opérationnels, c'est-à-dire qu'ils ne lag pas.
S'ls prennent plus de temps à afficher une page que d'habitude, une CROIX ROUGE apparaîtra à la droite du bouton slide, vous alertant que le script ne peut pas charger la page assez rapidement.

Si cela arrive il se peut que le script ne soit pas en mesure :

- D'identifier les tendances des topics de façon performante
- De rafraichir les topics

Si vous voyez que la CROIX ROUGE perdure longtemps :
- Essayer de rafraîchir la page
- Si cela continue, vous pouvez augmenter la valeur timerRefreshTrend afin d'augmenter le temps que le script attendra avant d'abandonner le chargement de la page.
- Ou vous pouvez simplement attendre en restant sur l'onglet 'Classic' le temps que le problème soit résolu

__________________________________
Si vous avez des suggestions ou rencontrez des bugs, vous pouvez me le dire par MP en spécifiant une balise [suggestion] ou [bug] et un titre explicite au compte TendancesLive s'il-vous-plaît les kheys
