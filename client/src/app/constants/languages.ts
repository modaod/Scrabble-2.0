// eslint-disable-next-line max-classes-per-file
export abstract class Languages {
    // Main page
    mainPageScrabbleClassicButtonLabel: string;
    verificationButton: string;
    profilButtonLabel: string;
    disconnectButtonLabel: string;
    friendsButtonLabel: string;
    changeThemeButtonLabel: string;
    changeLanguageButtonLabel: string;
    chatRoomButtonLabel: string;

    // Solo-multi page
    soloMultiCompetButtonLabel: string;
    soloMultiMultiButtonLabel: string;
    joinGameButtonLabel: string;
    soloMultiReturnButtonLabel: string;

    // Profil
    gameStatsLabel: string;
    gamesPlayed: string;
    gamePoints: string;
    gameTime: string;
    gameWon: string;
    gamePlayed: string;
    opponentLabel: string;
    resultLabel: string;
    gamePointLabel: string;
    dateLabel: string;
    accActivityLabel: string;
    activityType: string;

    // Friends page
    onlineButtonLabel: string;
    onlineNoFriendLabel: string;
    allFriendsButtonLabel: string;
    pendingButtonLabel: string;
    addFriendButtonLabel: string;
    allFriendsLabel: string;
    allNoFriendLabel: string;
    incomingLabel: string;
    incomingNoRequestLabel: string;
    outgoingLabel: string;
    addButtonLabel: string;
    addFriendDescription: string;

    // Create game
    createGameTitle: string;
    competModeButtonLabel: string;
    multiButtonLabel: string;
    roomNameLabel: string;
    dictionnaryLabel: string;
    timeTurnLabel: string;
    roomVisibilityLabel: string;
    publicVisibility: string;
    privateVisibility: string;
    pwProtection: string;
    joinQueueButtonLabel: string;
    createGameButtonLabel: string;
    roomNamePlaceholder: string;
    passWordPlaceholder: string;

    // Join game
    joinGameTitle: string;
    noGameTitleP1: string;
    noGameTitleP2: string;
    roomHostLabel: string;
    playerListLabel: string;
    observerListLabel: string;
    humanPlayerLabel: string;
    virtualPlayerLabel: string;
    observerLabel: string;
    joinLabel: string;
    observeLabel: string;

    // Join game setup
    configureGameParametersLabel: string;
    playerNameLabel: string;
    joinGameLabel: string;
    returnPrecedentMenuLabel: string;

    // Ranked waiting room
    waitingRankedLabel: string;
    waitingRoomLeaveQueue: string;

    // Waiting room
    addVirtualPlayerLabel: string;
    startLabel: string;

    // Info panel
    infoPanelTitle: string;
    youLabel: string;
    yourTurnLabel: string;
    youWonLabel: string;
    replaceButton: string;
    letterLabel: string;
    letterInReserveLabel: string;

    // Profil settings
    modifyAvatarLabel: string;
    cancelButton: string;
    saveButton: string;
    modifyUsernameLabel: string;
    yourUsernameIsLabel: string;
    newUsernameLabel: string;

    // Room
    roomLabel: string;
    createRoomLabel: string;
    chooseRoomLabel: string;
    roomErrorLabel: string;
    searchRoomLabel: string;
    backButton: string;
    createButton: string;
    joinButton: string;
    continueButton: string;

    // Timer
    remainingTimeLabel: string;

    // Game page
    abandonButton: string;
    skipTurnButton: string;
    playButton: string;
    generalChatButton: string;
    roomChatButton: string;
    externalChatButton: string;

    // Word finder
    searchButtonLabel: string;
    enterLetterDescriptionLabel: string;
    validWordP1: string;
    validWordP2: string;
    inValidWordP2: string;

    // Letter holder
    exchangeButton: string;

    // Multi chat
    roomChatLabel: string;
    sendButton: string;

    // Private message
    yourMsgPlaceholderLabel: string;

    // Chat
    commBoxLabel: string;

    // Chat page
    enterMsgPlaceholder: string;

    // Name validator
    playerNamePlaceholder: string;

    // End game page
    winnerLabel: string;
    loserLabel: string;
}

export class EnglishVersion implements Languages {
    chatRoomButtonLabel = 'Chat rooms';
    loserLabel = 'Loser';
    winnerLabel = 'Winner';
    enterMsgPlaceholder = 'Enter your message';
    playerNamePlaceholder = 'Enter a player name';
    passWordPlaceholder = 'Enter a password';
    roomNamePlaceholder = 'Enter a room name';
    commBoxLabel = 'COMMUNICATION BOX';
    yourMsgPlaceholderLabel = 'Enter your message';
    sendButton = 'Send';
    roomChatLabel = 'Salon:';
    exchangeButton = 'Exchange';
    inValidWordP2 = "isn't valid.";
    validWordP2 = 'is valid!';
    validWordP1 = 'The word';
    enterLetterDescriptionLabel = 'Enter the letters and verify the word.';
    searchButtonLabel = 'Search';
    mainPageScrabbleClassicButtonLabel = 'Classic scrabble';
    verificationButton = 'Word verification';
    profilButtonLabel = 'Your profil';
    disconnectButtonLabel = 'Disconnect';
    friendsButtonLabel = 'Your friends';
    changeThemeButtonLabel = 'Change theme';
    changeLanguageButtonLabel = 'Change language';
    soloMultiCompetButtonLabel = 'Play a ranked game';
    soloMultiMultiButtonLabel = 'Play a multiplayer game';
    joinGameButtonLabel = 'Join a multiplayer game';
    soloMultiReturnButtonLabel = 'Return to main menu';
    gameStatsLabel = 'Games statistics';
    gamesPlayed = 'Games played';
    gamePoints = 'Points per game';
    gameTime = 'Time per game';
    gameWon = 'Games won';
    gamePlayed = 'Games played';
    opponentLabel = 'Opponents';
    resultLabel = 'Result';
    gamePointLabel = 'Points of the game';
    dateLabel = 'Date';
    accActivityLabel = 'Account activity';
    activityType = 'Activity type';
    onlineButtonLabel = 'Online';
    onlineNoFriendLabel = 'You do not have any online friends.';
    allFriendsButtonLabel = 'All';
    allNoFriendLabel = 'You do not have any friends.';
    pendingButtonLabel = 'Pending';
    addFriendButtonLabel = 'Add friend';
    allFriendsLabel = 'All friends';
    incomingLabel = 'Incoming';
    incomingNoRequestLabel = 'You do not have any pending friend requests.';
    outgoingLabel = 'Outgoing';
    addButtonLabel = 'Send friend request';
    addFriendDescription = "You can add a friend with their username. It's cAsE sEnSitivE!";
    createGameTitle = 'Configure a game';
    competModeButtonLabel = 'Ranked mode';
    multiButtonLabel = 'Multiplayer mode';
    roomNameLabel = 'Room name';
    dictionnaryLabel = 'Dictionnary';
    timeTurnLabel = 'Time per turn';
    roomVisibilityLabel = 'Room visibility';
    publicVisibility = 'Public';
    privateVisibility = 'Private';
    pwProtection = 'Password protected';
    joinQueueButtonLabel = 'Join queue';
    createGameButtonLabel = 'Create a game';
    joinGameTitle = 'Join a multiplayer game for mode';
    noGameTitleP1 = 'No multiplayer game for mode';
    noGameTitleP2 = "isn't available.";
    roomHostLabel = 'Room host';
    playerListLabel = 'List of players';
    observerListLabel = 'List of observers';
    humanPlayerLabel = 'Humain player';
    virtualPlayerLabel = 'Virtual player';
    observerLabel = 'Observer';
    joinLabel = 'Join';
    observeLabel = 'Observe';
    configureGameParametersLabel = 'Configuration of the parameters of game';
    playerNameLabel = 'Player name:';
    joinGameLabel = 'Join the game';
    returnPrecedentMenuLabel = 'Return to precedent menu';
    waitingRankedLabel = 'You are in queue';
    waitingRoomLeaveQueue = 'Leave queue';
    addVirtualPlayerLabel = 'Add a virtual player';
    startLabel = 'Start';
    infoPanelTitle = 'INFORMATION PANEL';
    youLabel = 'You';
    yourTurnLabel = "It's your turn!";
    youWonLabel = 'You won!';
    replaceButton = 'Replace';
    letterLabel = 'Lettres:';
    letterInReserveLabel = 'Letters in the reserve:';
    modifyAvatarLabel = 'Modify your avatar!';
    cancelButton = 'Cancel';
    saveButton = 'Save';
    modifyUsernameLabel = 'Modify your username!';
    yourUsernameIsLabel = 'Your username is ';
    newUsernameLabel = 'New username:';
    roomLabel = 'Rooms';
    createRoomLabel = 'Create a room';
    chooseRoomLabel = 'Or choose among existing rooms';
    roomErrorLabel = ' This room exists. Please choose another name! ';
    searchRoomLabel = 'Search a room';
    backButton = ' Back ';
    createButton = ' Create ';
    joinButton = ' Join ';
    remainingTimeLabel = 'remaining time:';
    abandonButton = 'Abandon';
    skipTurnButton = 'Pass';
    playButton = 'Play';
    generalChatButton = 'General';
    roomChatButton = 'Rooms';
    externalChatButton = 'External';
    continueButton = 'Continue';
}

export class FrenchVersion implements Languages {
    chatRoomButtonLabel = 'Salons de chat';
    loserLabel = 'Perdant';
    winnerLabel = 'Gagnant';
    enterMsgPlaceholder = 'Entrer votre message';
    playerNamePlaceholder = 'Saisir le nom du joueur';
    passWordPlaceholder = 'Saisir un mot de passe';
    roomNamePlaceholder = 'Saisir le nom de la salle';
    commBoxLabel = 'BOITE DE COMMUNICATION';
    yourMsgPlaceholderLabel = 'Saisir votre message';
    sendButton = 'Envoyer';
    roomChatLabel = 'Salon:';
    exchangeButton = 'Échanger';
    inValidWordP2 = "n'est pas valide.";
    validWordP2 = 'est valide!';
    validWordP1 = 'Le mot';
    enterLetterDescriptionLabel = 'Rentrez les lettres et vérifiez le mot.';
    searchButtonLabel = 'Chercher';
    mainPageScrabbleClassicButtonLabel = 'Scrabble classique';
    verificationButton = 'Vérification de mots';
    profilButtonLabel = 'Votre profil';
    disconnectButtonLabel = 'Se déconnecter';
    friendsButtonLabel = 'Vos amis';
    changeThemeButtonLabel = 'Changer le thème';
    changeLanguageButtonLabel = 'Changer le langage';
    soloMultiCompetButtonLabel = 'Jouer une partie compétitive';
    soloMultiMultiButtonLabel = 'Jouer une partie multijoueur';
    joinGameButtonLabel = 'Joindre une partie multijoueur';
    soloMultiReturnButtonLabel = 'Retourner au menu principal';
    gameStatsLabel = 'Statistiques des parties';
    gamesPlayed = 'Parties jourées';
    gamePoints = 'Points par partie';
    gameTime = 'Temps par partie';
    gameWon = 'Parties gagnées';
    gamePlayed = 'Historique du jeu';
    opponentLabel = 'Opposants';
    resultLabel = 'Résultat';
    gamePointLabel = 'Points du jeu';
    dateLabel = 'Date';
    accActivityLabel = 'Activité du compte';
    activityType = "Type d'activité";
    onlineButtonLabel = 'En ligne';
    onlineNoFriendLabel = "Vous n'avez pas d'ami en ligne.";
    allFriendsButtonLabel = 'Tous';
    allNoFriendLabel = "Vous n'avez pas d'ami.";
    pendingButtonLabel = 'En attente';
    addFriendButtonLabel = 'Ajouter un ami';
    allFriendsLabel = 'Tous les amis';
    incomingLabel = 'Entrant';
    incomingNoRequestLabel = "Vous n'avez pas de requête d'ami.";
    outgoingLabel = 'Sortant';
    addButtonLabel = 'Envoyer une requête';
    addFriendDescription = "Vous pouvez ajouter un ami avec son nom d'utilisateur. Attention au mAjUsCUlE!";
    createGameTitle = 'Configuration de la partie';
    competModeButtonLabel = 'Mode compétitif';
    multiButtonLabel = 'Mode multijoueur';
    roomNameLabel = 'Nom de la salle';
    dictionnaryLabel = 'Dictionnaire';
    timeTurnLabel = 'Temps par tour';
    roomVisibilityLabel = 'Visibilité de la salle';
    publicVisibility = 'Publique';
    privateVisibility = 'Privée';
    pwProtection = 'Protection avec mot de passe';
    joinQueueButtonLabel = "Rejoindre la file d'attente";
    createGameButtonLabel = 'Créer une partie';
    joinGameTitle = 'Rejoindre une partie multijoueur pour le mode';
    noGameTitleP1 = 'Aucune partie multijoueur pour le mode';
    noGameTitleP2 = "n'est disponible.";
    roomHostLabel = 'Hôte de la salle';
    playerListLabel = 'Liste des joueurs';
    observerListLabel = 'Liste des observateurs';
    humanPlayerLabel = 'Joueur humain';
    virtualPlayerLabel = 'Joueur virtuel';
    observerLabel = 'Observateur';
    joinLabel = 'Rejoindre';
    observeLabel = 'Observer';
    configureGameParametersLabel = 'Configuration des paramètres de la partie';
    playerNameLabel = 'Nom du joueur:';
    joinGameLabel = 'Joindre la partie';
    returnPrecedentMenuLabel = 'Retourner au menu précédent';
    waitingRankedLabel = 'Vous êtes en attente';
    waitingRoomLeaveQueue = 'Quitter la salle';
    addVirtualPlayerLabel = 'Ajouter un joueur virtuel';
    startLabel = 'Démarrer';
    infoPanelTitle = 'PANNEAU INFORMATIF';
    youLabel = 'Vous';
    yourTurnLabel = "C'est à votre tour!";
    youWonLabel = 'Vous avez gagné!';
    replaceButton = 'Remplacer';
    letterLabel = 'Letters:';
    letterInReserveLabel = 'Lettres dans la réserve:';
    modifyAvatarLabel = 'Modifiez votre avatar!';
    cancelButton = 'Annuler';
    saveButton = 'Sauvegarder';
    modifyUsernameLabel = "Modifiez votre nom d'utilisateur!";
    yourUsernameIsLabel = "Votre nom d'utilisateur est ";
    newUsernameLabel = "Nouveau nom d'utilisateur:";
    roomLabel = 'Salons';
    createRoomLabel = 'Créer un salon';
    chooseRoomLabel = 'Ou choisir un parmi les salons disponibles';
    roomErrorLabel = ' Ce salon existe. Veuillez choisir un autre nom! ';
    searchRoomLabel = 'Chercher un salon';
    backButton = ' Retourner ';
    createButton = ' Créer ';
    joinButton = ' Rejoindre ';
    remainingTimeLabel = 'temps restant:';
    abandonButton = 'Abandonner';
    skipTurnButton = 'Passer';
    playButton = 'Jouer';
    generalChatButton = 'Général';
    roomChatButton = 'Salons';
    externalChatButton = 'Externe';
    continueButton = 'Continuer';
}
